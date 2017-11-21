/*
 * @author David Menger
 */
'use strict';

const sinon = require('sinon');
const assert = require('assert');
const { senderFactory } = require('../../src/tools/senderFactory');

const TOKEN = 'a';
const INPUT_MESSAGE = { sender: { id: '1' } };

function createLogger () {
    return {
        error: sinon.spy(),
        log: sinon.spy()
    };
}

describe('senderFactory()', function () {

    it('should work siply', function () {
        const logger = createLogger();
        const factory = senderFactory(TOKEN, logger);
        const sender = factory(INPUT_MESSAGE);

        sender({ wait: 50 });
        sender({ wait: 50 });

        const start = Date.now();

        const promise = sender();

        assert(promise instanceof Promise);

        return promise
            .then(() => {
                assert(logger.log.called, 'should be called before promise is resolved');
                assert((start + 90) < Date.now());
            });

    });

});
