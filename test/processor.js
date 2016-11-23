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
            state,
            save () {
                return Promise.resolve(this);
            }
        },
        times: 0,
        findOneAndUpdate (/* query, update, options*/) {
            this.times++;
            if (simulateError && this.times < 2) {
                const err = new Error();
                err.code = 11000;
                return {
                    exec: () => Promise.reject(err)
                };
            }

            return {
                exec: () => Promise.resolve(this.model)
            };
        }
    };
    sinon.spy(storage, 'findOneAndUpdate');
    sinon.spy(storage.model, 'save');
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

describe('Processor', function () {

    describe('#processMessage()', function () {

        it('should work', function () {

            const reducer = sinon.spy((req, res) => {
                res.setState({ final: 1 });
                res.text('Hello');
            });

            const stateStorage = createStateStorage();
            const sender = createSenderFnFactory();
            const defaultState = {};
            const logger = createLogger();

            const proc = new Processor(reducer, stateStorage, sender, null, defaultState, logger);

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
                    user: null
                });

                assert(stateStorage.model.save.called);
                assert(sender.sender.called);
            });
        });

        it('invalid messages should be logged', function () {
            const stateStorage = createStateStorage();
            const sender = createSenderFnFactory();
            const defaultState = {};
            const logger = createLogger();

            const reducer = sinon.spy((req, res) => {
                res.setState({ final: 1 });
            });
            const proc = new Processor(reducer, stateStorage, sender, null, defaultState, logger);

            return proc.processMessage()
                .then(() => {
                    assert(logger.warn.calledOnce);
                    return proc.processMessage({});
                })
                .then(() => {
                    assert(logger.warn.calledTwice);
                    return proc.processMessage({ sender: 'ho' });
                })
                .then(() => {
                    assert(logger.warn.calledThrice);
                    return proc.processMessage({});
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

            const stateStorage = createStateStorage();
            const sender = createSenderFnFactory();
            const defaultState = {};
            const logger = createLogger();

            const secure = {
                getOrCreateToken: sinon.spy(() => Promise.resolve('token'))
            };

            const proc = new Processor(wrapper, stateStorage, sender, secure, defaultState, logger);

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
                    user: null
                });

                assert(stateStorage.model.save.called);
                assert(sender.sender.called);

                assert(actionSpy.calledOnce);
            });
        });
    });

});
