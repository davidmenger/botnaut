/*
 * @author David Menger
 */
'use strict';

const UserLoader = require('./UserLoader');
const Responder = require('./Responder');
const Request = require('./Request');
const SecurityMiddleware = require('./SecurityMiddleware');
const { senderFactory } = require('./senderFactory');
const MemoryStateStorage = require('./MemoryStateStorage');

function nextTick () {
    return new Promise(r => process.nextTick(r));
}


class Processor {

    /**
     * Creates an instance of Processor.
     *
     * @param {ReducerWrapper|function|Router} reducer
     * @param {{appUrl?:string, translator?:function, timeout?:number, log?:object,
        defaultState?:object, cookieName?:string, pageToken:string, appSecret:string,
        chatLog?:object, tokenStorage?:object, senderFnFactory?:function,
        securityMiddleware?:object, loadUsers?:boolean, loadUsers?:object}} options
     * @param {{getOrCreateAndLock:function, saveState:function,
        onAfterStateLoad:function}} [stateStorage]
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
            chatLog: null,
            tokenStorage: null,
            senderFnFactory: null,
            securityMiddleware: null,
            loadUsers: true,
            userLoader: null
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
            this.senderFnFactory = senderFactory(this.options.pageToken, this.options.chatLog);
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

    _createPostBack (senderId, pageId, postbackAcumulator, senderFn, waitAfter = nextTick) {
        const makePostBack = (action, data = {}) => waitAfter()
                .then((newSenderId) => {
                    const request = Request.createPostBack(newSenderId || senderId, action, data);
                    return this.processMessage(request, pageId, senderFn);
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
            promise () {
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

    processMessage (message, pageId, sender = null) {
        let senderId;
        let refHandler;

        if (message && message.sender && message.sender.id) {
            senderId = message.sender.id;
        } else if (message && message.optin && message.optin.user_ref) {
            senderId = message.optin.user_ref;
            refHandler = this._createRefHandler();
        } else {
            this.options.log.warn('Bot received bad message', message);
            return Promise.resolve(null);
        }

        // ignore messages from the page
        if (pageId === senderId && senderId) {
            return Promise.resolve(null);
        }

        const postbacks = [];
        const isRef = !!refHandler;
        const senderHandler = refHandler && refHandler.handler;
        const senderFn = sender || this.senderFnFactory(message, pageId, senderHandler);
        let req;
        let state;

        return this._loadState(isRef, senderId, pageId)
            .then(stateObject =>
                this._ensureUserProfileLoaded(isRef, senderId, pageId, stateObject))
            .then((stateObject) => {
                state = stateObject.state;
                req = new Request(message, state, pageId);
                return this.stateStorage.onAfterStateLoad(req, stateObject);
            })
            .then(stateObject => this._getOrCreateToken(isRef, senderId, stateObject))
            .then(({ token, stateObject }) => {

                // update the state of request
                state = stateObject.state;
                req.state = state;

                // prepare responder
                const res = new Responder(isRef, senderId, senderFn, token, this.options);

                // create postBack handler
                const wait = refHandler && refHandler.promise;
                const postBack = this._createPostBack(senderId, pageId, postbacks, senderFn, wait);

                if (typeof this.reducer === 'function') {
                    this.reducer(req, res, postBack);
                } else {
                    this.reducer.reduce(req, res, postBack);
                }

                state = Object.assign({}, state, res.newState);

                // reset expectations
                if (req.isMessage() && !res.newState._expected) {
                    state._expected = null;
                }

                // reset expectations
                if (req.isMessage() && !res.newState._expectedKeywords) {
                    state._expectedKeywords = null;
                }

                if (!isRef) {
                    return stateObject;
                }

                if (!refHandler.called) {
                    throw new Error('Call any send method, when optin is received!');
                }

                return refHandler.promise()
                    .then(recipientId => this._loadState(false, recipientId, pageId));
            })
            .then((stateObject) => {
                Object.assign(stateObject, {
                    state,
                    lock: 0,
                    lastInteraction: new Date()
                });

                return this.stateStorage.saveState(stateObject);
            })
            .then(() => Promise.all(postbacks))
            .catch((e) => {
                this.options.log.error(e);
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

    _loadState (isRef, senderId, pageId) {
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

                    this._model(senderId, pageId)
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

    _model (senderId, pageId) {
        const { timeout, defaultState } = this.options;
        return this.stateStorage.getOrCreateAndLock(senderId, defaultState, timeout, pageId)
            .catch((err) => {
                if (!err || err.code !== 11000) {
                    this.options.log.error('Bot processor load error', err);
                }
                return this._wait();
            });
    }

}

module.exports = Processor;
