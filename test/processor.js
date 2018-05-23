/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Processor = require('../src/Processor');
const Request = require('../src/Request');
const ReducerWrapper = require('../src/ReducerWrapper');
const { senderFactory } = require('../src/tools');

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
        getOrCreateAndLock (/* senderId, defaultState, timeout */) {
            this.times++;
            if (simulateError && this.times < 2) {
                const err = new Error();
                err.code = 11000;
                return Promise.reject(err);
            }

            return Promise.resolve(this.model);
        },
        onAfterStateLoad (req, preparedState) {
            return preparedState;
        }
    };
    sinon.spy(storage, 'getOrCreateAndLock');
    sinon.spy(storage, 'saveState');
    sinon.spy(storage, 'onAfterStateLoad');
    return storage;
}

function createSenderFnFactory () {
    const factory = sinon.spy(() => {
        factory.sender = sinon.spy();
        return factory.sender;
    });
    return factory;
}

function createLogger (errFn = (m, e) => { throw e; }) {
    return {
        log: sinon.spy(),
        warn: sinon.spy(),
        error: sinon.spy(errFn)
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

        it('should reject messages from page itself', function () {
            const reducer = sinon.spy();

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
            }, 1).then(() => {
                assert(!reducer.called);
            });
        });

        it('should work', function () {

            const reducer = sinon.spy((req, res) => {
                res.setState({ final: 1 });
                res.text('Hello');
                assert.strictEqual(req.pageId, 10);
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
            }, 10).then(() => {
                assert(reducer.calledOnce);

                assert.deepEqual(stateStorage.model.state, {
                    final: 1,
                    user: {},
                    _expected: null,
                    _expectedKeywords: null
                });

                assert(stateStorage.saveState.called);
                assert(opts.senderFnFactory.sender.called);
                assert.deepEqual(stateStorage.getOrCreateAndLock.firstCall.args, [
                    1,
                    {},
                    100
                ]);
            });
        });

        it('postback should reset expectations', function () {
            const reducer = sinon.spy((req, res) => {
                res.text('Hello');
            });

            const stateStorage = createStateStorage({
                user: {},
                _expected: { action: 'expect' }
            });

            const opts = makeOptions();
            const proc = new Processor(reducer, opts, stateStorage);

            return proc.processMessage({
                sender: {
                    id: 1
                },
                postback: {
                    payload: {
                        action: 'action'
                    }
                }
            }, 10).then(() => {
                assert(reducer.calledOnce);

                assert.deepEqual(stateStorage.model.state, {
                    user: {},
                    _expected: null,
                    _expectedKeywords: null
                });
            });
        });

        it('should pass error to default error handler', function () {
            let responder;

            const reducer = sinon.spy((req, res) => {
                responder = res;
                res.setState({ final: 1 });
                res.text('Hello');
                assert.strictEqual(req.pageId, 10);
            });

            const stateStorage = createStateStorage();
            const opts = makeOptions();
            opts.senderFnFactory = undefined;
            opts.log = createLogger(() => {});
            const proc = new Processor(reducer, opts, stateStorage);

            const message = {
                timestamp: 1,
                sender: {
                    id: 1
                },
                message: {
                    text: 'ahoj'
                }
            };

            return proc.processMessage(message, 10)
                .then(() => responder._send({ wait: 1 }))
                .then(() => {
                    const { error } = opts.log;
                    assert(error.calledOnce);
                    assert(error.firstCall.args[0] instanceof Error);
                    assert.equal(error.firstCall.args[0].statusCode, 400);
                    assert(typeof error.firstCall.args[1] === 'object');
                });
        });

        it('should not process one message twice', function () {

            const reducer = sinon.spy((req, res) => {
                res.setState({ final: 1 });
                res.text('Hello');
                assert.strictEqual(req.pageId, 10);
            });

            const stateStorage = createStateStorage();
            const opts = makeOptions();
            const proc = new Processor(reducer, opts, stateStorage);

            const message = {
                timestamp: 1,
                sender: {
                    id: 1
                },
                message: {
                    text: 'ahoj'
                }
            };

            return proc.processMessage(message, 10).then(() => {
                assert(reducer.calledOnce);

                return proc.processMessage(message, 10).then(() => {
                    assert(reducer.calledOnce);

                });
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
                // events are processed as next tick
                .then(() => new Promise(r => process.nextTick(r)))
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

        it('throws error, when the token is missing', function () {
            assert.throws(() => new Processor(state => state, {}));
        });

        it('throws error, when the app secret is missing', function () {
            assert.throws(() => new Processor(state => state, { pageToken: 'a' }));
        });

        it('should accept custom user loader', () => {
            const userLoader = {};
            const u = new Processor(s => s, { pageToken: 'a', appSecret: 'b', userLoader });
            assert.strictEqual(u.userLoader, userLoader);
        });

        it('should accept optins and save them in state', function () {

            let callNo = 0;

            const reducer = sinon.spy((req, res, postBack) => {
                callNo++;
                if (callNo === 1) {
                    res.text('Hello');
                    res.setState({ final: 1 });
                    assert.strictEqual(req.senderId, null);
                    res.text('Hello');
                    postBack('action');
                } else {
                    res.setState({ final: 2 });
                    assert.strictEqual(req.senderId, 'senderid');
                    res.text('Hello');
                }
            });

            const stateStorage = createStateStorage();
            const opts = makeOptions();
            const sender = sinon.spy(() => Promise.resolve({ recipient_id: 'senderid' }));

            opts.senderFnFactory = senderFactory('a', { log: () => {} }, () => {}, sender);

            const proc = new Processor(reducer, opts, stateStorage);

            return proc.processMessage(Request.optin('optinid', 'action'), 10).then(() => {
                assert(reducer.calledTwice);

                assert(stateStorage.onAfterStateLoad.called);
                assert(stateStorage.onAfterStateLoad.firstCall
                    .calledBefore(stateStorage.getOrCreateAndLock.firstCall));
                assert(stateStorage.saveState.called);

                assert(stateStorage.getOrCreateAndLock.secondCall
                    .calledBefore(stateStorage.onAfterStateLoad.secondCall));

                assert.equal(sender.callCount, 3);

                // check the response
                assert.deepEqual(sender.firstCall.args[0].recipient, { user_ref: 'optinid' });
                assert.deepEqual(sender.secondCall.args[0].recipient, { id: 'senderid' });

                assert.deepEqual(stateStorage.getOrCreateAndLock.firstCall.args, [
                    'senderid',
                    {},
                    100
                ]);

                assert.deepEqual(stateStorage.model.state, {
                    final: 2,
                    _expected: null,
                    _expectedKeywords: null
                });
            });
        });
    });

});
