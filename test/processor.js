/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Processor = require('../src/Processor');
const ReducerWrapper = require('../src/ReducerWrapper');

const EMPTY_STATE = { user: {} };

function createStateStorage (state = EMPTY_STATE, simulateError = true) {
    const storage = {
        model: {
            state
        },
        saveState (newModel) {
            this.model = newModel;
            return Promise.resolve(this.model);
        },
        times: 0,
        getOrCreateAndLock (/* query, update, options*/) {
            this.times++;
            if (simulateError && this.times < 2) {
                const err = new Error();
                err.code = 11000;
                return Promise.reject(err);
            }

            return Promise.resolve(this.model);
        }
    };
    sinon.spy(storage, 'getOrCreateAndLock');
    sinon.spy(storage, 'saveState');
    return storage;
}

function createSenderFnFactory () {
    const factory = sinon.spy(() => {
        factory.sender = sinon.spy();
        return factory.sender;
    });
    return factory;
}

function createLogger () {
    return {
        log: sinon.spy(),
        warn: sinon.spy(),
        error: sinon.spy((m, e) => { throw e; })
    };
}

function makeOptions (securityMiddleware = null) {
    const senderFnFactory = createSenderFnFactory();
    const defaultState = {};
    const log = createLogger();

    return {
        senderFnFactory, defaultState, log, appSecret: 'a', pageToken: 'a', securityMiddleware, loadUsers: false
    };
}

describe('Processor', function () {

    describe('#processMessage()', function () {

        it('should work', function () {

            const reducer = sinon.spy((req, res) => {
                res.setState({ final: 1 });
                res.text('Hello');
            });

            const stateStorage = createStateStorage();
            const opts = makeOptions();
            const proc = new Processor(reducer, opts, stateStorage);

            return proc.processMessage({
                sender: {
                    id: 1
                },
                message: {
                    text: 'ahoj'
                }
            }).then(() => {
                assert(reducer.calledOnce);

                assert.deepEqual(stateStorage.model.state, {
                    final: 1,
                    user: {},
                    _expected: null,
                    _expectedKeywords: null
                });

                assert(stateStorage.saveState.called);
                assert(opts.senderFnFactory.sender.called);
            });
        });

        it('invalid messages should be logged', function () {

            const reducer = sinon.spy((req, res) => {
                res.setState({ final: 1 });
            });

            const stateStorage = createStateStorage();
            const opts = makeOptions();
            const proc = new Processor(reducer, opts, stateStorage);

            return proc.processMessage()
                .then(() => {
                    assert(opts.log.warn.calledOnce);
                    return proc.processMessage({});
                })
                .then(() => {
                    assert(opts.log.warn.calledTwice);
                    return proc.processMessage({ sender: 'ho' });
                })
                .then(() => {
                    assert(opts.log.warn.calledThrice);
                    return proc.processMessage({});
                });
        });

        it('should wait after all async postback are resolved', function () {

            const reducer = sinon.spy((req, res, postBack) => {
                if (!req.action()) {
                    const resolve = postBack.wait();
                    setTimeout(() => resolve('actionName'), 50);
                }
            });

            const stateStorage = createStateStorage(EMPTY_STATE, false);
            const opts = makeOptions();
            const proc = new Processor(reducer, opts, stateStorage);

            return proc.processMessage({
                sender: {
                    id: 1
                },
                message: {
                    text: 'ahoj'
                }
            }).then(() => {
                assert(reducer.calledTwice);
                assert(stateStorage.saveState.calledTwice);
            });
        });

        it('should work with tokenstorage and wrapper', function () {

            const reducer = sinon.spy((req, res) => {
                res.setState({ final: 1 });
                res.text('Hello');
            });

            const wrapper = new ReducerWrapper(reducer);

            const actionSpy = sinon.spy();
            wrapper.on('action', actionSpy);

            const securityMiddleware = {
                getOrCreateToken: sinon.spy(() => Promise.resolve('token'))
            };

            const stateStorage = createStateStorage();
            const opts = makeOptions(securityMiddleware);
            const proc = new Processor(wrapper, opts, stateStorage);

            return proc.processMessage({
                sender: {
                    id: 1
                },
                message: {
                    text: 'ahoj'
                }
            })
            .then(() => new Promise(r => process.nextTick(r))) // events are processed as next tick
            .then(() => {
                assert(reducer.calledOnce);

                assert.deepEqual(stateStorage.model.state, {
                    final: 1,
                    user: {},
                    _expected: null,
                    _expectedKeywords: null
                });

                assert(stateStorage.saveState.called);
                assert(opts.senderFnFactory.sender.called);

                assert(actionSpy.calledOnce);
            });
        });
    });

});
