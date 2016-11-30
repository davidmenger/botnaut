/*
 * @author David Menger
 */
'use strict';

const UserLoader = require('./UserLoader');
const Responder = require('./Responder');
const Request = require('./Request');
const SecurityMiddleware = require('./SecurityMiddleware');
const senderFactory = require('./senderFactory');
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
        securityMiddleware?:object, loadUsers?:boolean}} options
     * @param {{getOrCreateAndLock:function, saveState:function}} [stateStorage]
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
            loadUsers: true
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

        this.userLoader = this.options.loadUsers ? new UserLoader(this.options.pageToken) : null;
    }

    _createPostBack (senderId, postbackAcumulator) {
        return (action = null, data = {}) => {
            if (action !== null) {
                const request = Request.createPostBack(senderId, action, data);
                const promise = nextTick()
                    .then(() => this.processMessage(request));

                postbackAcumulator.push(promise);
            }
        };
    }

    processMessage (message) {
        if (!message || !message.sender || !message.sender.id) {
            this.options.log.warn('Bot received bad message', message);
            return Promise.resolve(null);
        }

        const senderId = message.sender.id;
        const postbackAcumulator = [];

        return this._loadState(senderId)
            .then(stateObject => this._ensureUserProfileLoaded(senderId, stateObject))
            .then(stateObject => this._getOrCreateToken(senderId, stateObject))
            .then(({ token, stateObject }) => {

                const senderFn = this.senderFnFactory(message);

                let state = stateObject.state;
                const req = new Request(message, state);
                const res = new Responder(senderId, senderFn, token, this.options);
                const postBack = this._createPostBack(senderId, postbackAcumulator);

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

                Object.assign(stateObject, {
                    state,
                    lock: 0,
                    lastInteraction: new Date()
                });

                return this.stateStorage.saveState(stateObject);
            })
            .then(() => Promise.all(this.reducer.debugPromises || []))
            .then(() => Promise.all(postbackAcumulator))
            .catch((e) => {
                this.options.log.error(e);
            });
    }

    _ensureUserProfileLoaded (senderId, stateObject) {
        if (stateObject.state
            && stateObject.state.user
            && Object.keys(stateObject.state.user).length !== 0) {

            return stateObject;
        }
        return this._ensureUserBound(stateObject, senderId);
    }

    _getOrCreateToken (senderId, stateObject) {
        return this.secure.getOrCreateToken(senderId)
                    .then(token => ({ token, stateObject }));
    }

    _ensureUserBound (stateObject, senderId) {
        if (!this.userLoader) {
            return stateObject;
        }
        const state = stateObject;
        return this.userLoader.loadUser(senderId)
            .then((user) => {
                state.state.user = user;
                return this.stateStorage.saveState(state);
            })
            .catch((e) => {
                this.options.log.warn(e);
                return stateObject;
            });
    }

    _loadState (senderId) {
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
