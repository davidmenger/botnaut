/*
 * @author David Menger
 */
'use strict';

const sinon = require('sinon');
const senderFactory = require('../src/senderFactory');

const TOKEN = 'a';
const INPUT_MESSAGE = { sender: { id: '1' } };

function createLogger () {
    return {
        error: sinon.spy(),
        log: sinon.spy()
    };
}

describe('senderFactory()', function () {

    it('should work siply', function (done) {
        const logger = createLogger();
        const factory = senderFactory(TOKEN, logger);
        const sender = factory(INPUT_MESSAGE);

        sender({ wait: 100 });
        sender({ wait: 100 });

        setTimeout(() => {
            if (logger.log.called) {
                done('should not be called before action has finnished!');
            }
        }, 150);

        setTimeout(() => {
            if (!logger.log.called) {
                done('should be called after action has finnished!');
            } else {
                done();
            }
        }, 250);

    });

});
