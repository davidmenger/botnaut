/*
 * @author David Menger
 */
'use strict';

const UserLoader = require('./UserLoader');
const Responder = require('./Responder');
const Request = require('./Request');

function nextTick () {
    return new Promise(r => process.nextTick(r));
}

class Processor {

    constructor (
            reducer,
            stateStorage,
            senderFnFactory,
            secure,
            defaultState = {},
            log = console,
            translator = w => w,
            appUrl = null,
            timeout = 200) {

        this.reducer = reducer;
        this.stateStorage = stateStorage;
        this.timeout = timeout;
        this.defaultState = defaultState;
        this.log = log;
        this.senderFnFactory = senderFnFactory;
        this.translator = translator;
        this.appUrl = appUrl;
        this.userLoader = new UserLoader(senderFnFactory.token);
        this.secure = secure;
    }

    _createNext (senderId) {
        return (action = null, data = {}) => {
            if (action !== null) {
                const request = Request.createPostBack(senderId, action, data);
                nextTick()
                    .then(() => this.processMessage(request));
            }
        };
    }

    processMessage (message) {
        if (!message || !message.sender || !message.sender.id) {
            this.log.warn('Bot received bad message', message);
            return Promise.resolve(null);
        }

        const senderId = message.sender.id;

        return this._loadState(senderId)
            .then(stateObject => this._ensureUserProfileLoaded(senderId, stateObject))
            .then(stateObject => this._getOrCreateToken(senderId, stateObject))
            .then(({ token, stateObject }) => {

                const senderFn = this.senderFnFactory(message);

                let state = stateObject.state;
                const req = new Request(message, state);
                const res = new Responder(senderId, senderFn, this.appUrl, token, this.translator);
                const next = this._createNext(senderId);

                if (typeof this.reducer === 'function') {
                    this.reducer(req, res, next);
                } else {
                    this.reducer.reduce(req, res, next);
                }

                state = Object.assign({}, state, res.newState);

                Object.assign(stateObject, {
                    state,
                    lock: 0,
                    lastInteraction: new Date()
                });

                return stateObject.save();
            })
            .then(() => Promise.all(this.reducer.debugPromises || []))
            .catch((e) => {
                this.log.error('Bot Processor', e);
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
        if (!this.secure) {
            return { token: null, stateObject };
        }

        return this.secure.getOrCreateToken(senderId)
                    .then(token => ({ token, stateObject }));
    }

    _ensureUserBound (stateObject, senderId) {
        const state = stateObject;
        return this.userLoader.loadUser(senderId)
            .then((user) => {
                state.state.user = user;
                return state.save();
            })
            .catch((e) => {
                this.log.warn(e);
                return stateObject;
            });
    }

    _loadState (senderId) {
        return new Promise((resolve, reject) => {
            let retrys = 3;

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
        return new Promise(r => setTimeout(() => r(null), this.timeout + 10));
    }

    _model (senderId) {
        const now = Date.now();
        return this.stateStorage.findOneAndUpdate({
            senderId,
            lock: { $lt: now - this.timeout }
        }, {
            $setOnInsert: {
                state: this.defaultState
            },
            $set: {
                lock: now
            }
        }, {
            new: true,
            upsert: true
        }).exec()
            .catch((err) => {
                if (!err || err.code !== 11000) {
                    this.log.error('Bot processor load error', err);
                } else if (err.code === 11000) {
                    return this._wait();
                }
                return null;
            });
    }

}

module.exports = Processor;
