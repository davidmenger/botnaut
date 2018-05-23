/*
 * @author David Menger
 */
'use strict';

const co = require('co');
const { UserLoader, MemoryStateStorage } = require('./tools');
const { senderFactory } = require('./tools');
const Responder = require('./Responder');
const Request = require('./Request');
const SecurityMiddleware = require('./SecurityMiddleware');


class Processor {

    /**
     * Creates an instance of Processor.
     *
     * @param {ReducerWrapper|function|Router} reducer
     * @param {ProcessorOptions} options - documented at express.js
     * @param {{
        getOrCreateAndLock:function,
        saveState:function,
        onAfterStateLoad:function
       }} [stateStorage]
     *
     * @memberOf Processor
     */
    constructor (reducer, options, stateStorage = new MemoryStateStorage()) {
        this.options = {
            appUrl: '',
            translator: w => w,
            timeout: 100,
            log: console,
            defaultState: {},
            cookieName: 'botToken',
            pageToken: null, // required
            appSecret: null, // required
            chatLog: console,
            tokenStorage: null,
            senderFnFactory: null,
            securityMiddleware: null,
            loadUsers: true,
            userLoader: null,
            onSenderError: (err, message) => this.reportSendError(err, message)
        };
        Object.assign(this.options, options);

        this.reducer = reducer;
        this.stateStorage = stateStorage;

        if (!this.options.pageToken) {
            throw new Error('Missing pageToken in options');
        }

        if (this.options.senderFnFactory) {
            this.senderFnFactory = this.options.senderFnFactory;
        } else {
            this.senderFnFactory = senderFactory(
                this.options.pageToken,
                this.options.chatLog,
                this.options.onSenderError
            );
        }

        if (this.options.securityMiddleware) {
            this.secure = this.options.securityMiddleware;
        } else if (this.options.appSecret) {
            const { appSecret, tokenStorage, cookieName } = this.options;
            this.secure = new SecurityMiddleware(appSecret, tokenStorage, cookieName);
        } else {
            throw new Error('Missing `appSecret` in options. Please provide an appSecret or own securityMiddleware');
        }

        if (this.options.userLoader) {
            this.userLoader = this.options.userLoader;
        } else {
            this.userLoader = this.options.loadUsers
                ? new UserLoader(this.options.pageToken)
                : null;
        }
    }

    _createPostBack (senderId, pageId, postbackAcumulator, senderFn, waitAfter, data) {
        const makePostBack = (action, actionData = {}) => waitAfter()
            .then((newSenderId) => {
                const request = Request.postBack(newSenderId || senderId, action, actionData);
                return this.processMessage(request, pageId, senderFn, data);
            });

        const wait = () => {
            let res;
            let rej;

            const promise = new Promise((resolve, reject) => {
                res = resolve;
                rej = reject;
            });

            postbackAcumulator.push(promise);

            return (...args) => makePostBack(...args)
                .then(a => res(a))
                .catch(e => rej(e));
        };

        const postBack = (...args) => postbackAcumulator.push(makePostBack(...args));

        postBack.wait = wait;

        return postBack;
    }

    _createRefHandler () {
        const handler = {
            called: false,
            resolved: false,
            _resolve: null,
            _promise: null,
            getPromise () {
                return handler._promise;
            },
            handler (res, nextData) {

                if (nextData && !nextData.wait) {
                    handler.called = true;
                }

                if (res && !handler.resolved) {
                    handler._resolve(res.recipient_id);
                }

                const hasRecipientId = res && typeof res === 'object' && res.recipient_id;
                const nextIsRef = nextData && nextData.recipient && nextData.recipient.user_ref;

                // convert next user_ref to id
                if (hasRecipientId && nextIsRef) {
                    Object.assign(nextData, {
                        recipient: { id: res.recipient_id }
                    });
                }

                return nextData;
            }
        };
        handler._promise = new Promise((resolve) => { handler._resolve = resolve; });
        return handler;
    }

    reportSendError (err, message) {
        if (!message || !message.sender || !message.sender.id) {
            return false;
        }
        if (err.code !== 403) {
            this.options.log.error(err, message);
        }
        const senderId = message.sender.id;
        this._loadState(false, senderId)
            .then((state) => {
                Object.assign(state, {
                    lastSendError: new Date(),
                    lastErrorMessage: err.message,
                    lastErrorCode: err.code,
                    lock: 0
                });
                return this.stateStorage.saveState(state);
            })
            .catch((e) => {
                this.options.log.error(e);
            });

        return true;
    }

    processMessage (message, pageId, sender = null, data = {}) {
        let senderId;
        let refHandler;

        if (message && message.sender && message.sender.id) {
            senderId = message.sender.id;
        } else if (message && message.optin && message.optin.user_ref) {
            senderId = message.optin.user_ref;
            refHandler = this._createRefHandler();
        } else {
            this.options.log.warn('Bot received bad message', { message, pageId });
            return Promise.resolve(null);
        }

        // ignore reads and deliveries
        const isEcho = message.message && message.message.is_echo;
        if (message.read || message.delivery || isEcho || message.standby) {
            return Promise.resolve(null);
        }

        // ignore messages from the page
        if (pageId === senderId && senderId) {
            return Promise.resolve(null);
        }

        const postbacks = [];
        const isRef = !!refHandler;
        const senderHandler = refHandler && refHandler.handler;
        const senderFn = sender || this.senderFnFactory(senderId, message, pageId, senderHandler);
        let req;
        let state;

        let messageProcessed;
        const messageProcessPromise = new Promise((res) => { messageProcessed = res; });

        return this._loadState(isRef, senderId)
            .then(stateObject =>
                this._ensureUserProfileLoaded(isRef, senderId, pageId, stateObject))
            .then((stateObject) => {
                state = stateObject.state;
                req = new Request(message, state, pageId);
                return this.stateStorage.onAfterStateLoad(req, stateObject);
            })
            .then(stateObject => this._getOrCreateToken(isRef, senderId, stateObject))
            .then(co.wrap(function* ({ token, stateObject }) {

                // ensure the request was not processed
                if (stateObject.lastTimestamps && message.timestamp
                        && stateObject.lastTimestamps.indexOf(message.timestamp) !== -1) {
                    return null;
                }

                // update the state of request
                state = stateObject.state;
                req.state = state;

                // prepare responder
                const res = new Responder(isRef, senderId, senderFn, token, this.options, data);

                // create postBack handler
                const wait = () =>
                    messageProcessPromise.then(() => refHandler && refHandler.getPromise());

                const postBack = this
                    ._createPostBack(senderId, pageId, postbacks, senderFn, wait, data);

                let reduceResult;
                if (typeof this.reducer === 'function') {
                    reduceResult = this.reducer(req, res, postBack);
                } else {
                    reduceResult = this.reducer.reduce(req, res, postBack);
                }
                if (reduceResult instanceof Promise) { // note the result can be undefined
                    yield reduceResult;
                }

                state = Object.assign({}, state, res.newState);

                const isUserEvent = req.isMessage() || req.isPostBack()
                    || req.isReferral() || req.isAttachment();

                // reset expectations
                if (isUserEvent && !res.newState._expected) {
                    state._expected = null;
                }

                // reset expectations
                if (isUserEvent && !res.newState._expectedKeywords) {
                    state._expectedKeywords = null;
                }

                if (!isRef) {
                    return stateObject;
                }

                if (!refHandler.called) {
                    this.options.log.warn('No text message was sent, when optin arrived!', { message, pageId });
                    return null;
                }

                return refHandler.getPromise()
                    .then(recipientId => this._loadState(false, recipientId));
            }.bind(this)))
            .then((stateObject) => {
                if (!stateObject) {
                    return null;
                }

                // store the message timestamp to prevent event rotating
                let lastTimestamps = stateObject.lastTimestamps || [];
                if (message.timestamp) {
                    lastTimestamps = lastTimestamps.slice();
                    lastTimestamps.push(message.timestamp);
                    if (lastTimestamps.length > 10) {
                        lastTimestamps.shift();
                    }
                }

                Object.assign(stateObject, {
                    state,
                    lock: 0,
                    lastTimestamps,
                    lastInteraction: new Date(),
                    off: false
                });

                return this.stateStorage.saveState(stateObject);
            })
            .then(() => messageProcessed())
            .then(() => Promise.all(postbacks))
            .then(() => senderFn())
            .catch((e) => {
                this.options.log.error(e);
                return { status: 500 };
            });
    }

    _ensureUserProfileLoaded (isRef, senderId, pageId, stateObject) {
        const hasUserInState = stateObject.state
            && stateObject.state.user
            && Object.keys(stateObject.state.user).length !== 0;

        if (isRef) {
            if (!hasUserInState && this.userLoader) {
                Object.assign(stateObject.state, { user: {} });
            }
            return stateObject;
        }

        if (hasUserInState) {
            return stateObject;
        }

        return this._ensureUserBound(stateObject, senderId, pageId);
    }

    _getOrCreateToken (isRef, senderId, stateObject) {
        if (isRef) {
            return { token: null, stateObject };
        }

        return this.secure.getOrCreateToken(senderId)
            .then(token => ({ token, stateObject }));
    }

    _ensureUserBound (stateObject, senderId, pageId) {
        if (!this.userLoader) {
            return stateObject;
        }
        const state = stateObject;
        return this.userLoader.loadUser(senderId, pageId)
            .then((user) => {
                state.state.user = user;
                return this.stateStorage.saveState(state);
            })
            .catch((e) => {
                this.options.log.warn(e);
                return stateObject;
            });
    }

    _loadState (isRef, senderId) {
        if (isRef) {
            return Promise.resolve({
                state: Object.assign({}, this.options.defaultState)
            });
        }

        return new Promise((resolve, reject) => {
            let retrys = 4;

            const onLoad = (res) => {
                if (!res) {
                    if (retrys-- < 0) {
                        reject(new Error('Bot processor timed out'));
                        return;
                    }

                    this._model(senderId)
                        .then(onLoad)
                        .catch(reject);
                } else {
                    resolve(res);
                }
            };

            onLoad();
        });
    }

    _wait () {
        return new Promise(r => setTimeout(() => r(null), this.options.timeout + 25));
    }

    _model (senderId) {
        const { timeout, defaultState } = this.options;
        return this.stateStorage.getOrCreateAndLock(senderId, defaultState, timeout)
            .catch((err) => {
                if (!err || err.code !== 11000) {
                    this.options.log.error('Bot processor load error', err);
                }
                return this._wait();
            });
    }

}

module.exports = Processor;
