/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const { returnSenderFactory } = require('../../src/tools/returnSenderFactory');
const Processor = require('../../src/Processor');
const Request = require('../../src/Request');
const { isText, contains } = require('../../src/testTools/asserts');

const USER = 'user';
const INCOMMING = { hello: 1 };
const PAGE_ID = 'page-id';

describe('#returnSenderFactory()', function () {

    it('should return the all messages when used', function () {
        const logger = {
            log: sinon.spy()
        };
        const handler = sinon.spy((res, nextMessage) => nextMessage);

        const factory = returnSenderFactory({}, logger);

        const sender = factory(USER, INCOMMING, PAGE_ID, handler);

        return sender({ test: 1 })
            .then((queue) => {
                assert.strictEqual(typeof queue, 'object');
                assert.ok(Array.isArray(queue));
                assert.strictEqual(queue.length, 1);

                assert.ok(handler.calledOnce);
                assert.deepEqual(handler.firstCall.args, [null, { test: 1 }]);
                assert.ok(!logger.log.called);

                return sender();
            })
            .then((queue) => {
                assert.strictEqual(typeof queue, 'object');
                assert.ok(Array.isArray(queue));
                assert.strictEqual(queue.length, 1);

                assert.ok(handler.calledOnce);
                assert.ok(logger.log.called);
                assert.deepEqual(logger.log.firstCall.args, [
                    USER, queue, INCOMMING
                ]);
            });
    });

    it('should work inside a processor', function () {
        const log = {
            error: (e) => { throw e; },
            warn: sinon.spy(),
            log: sinon.spy()
        };

        const reducer = (req, res) => {
            res.text(req.text());
        };

        const prc = new Processor(reducer, {
            pageToken: 'foo',
            appSecret: 'bar',
            log,
            senderFnFactory: returnSenderFactory({}, log)
        });

        return prc.processMessage(Request.text('haha', 'hello'))
            .then((messages) => {
                assert.ok(Array.isArray(messages), 'Messages should be an array');
                assert.strictEqual(messages.length, 1);
                isText(messages[0]);
                contains(messages[0], 'hello');
            });
    });

});
