/*
* @author Juraj Hríb
*/
'use strict';

const sinon = require('sinon');
const assert = require('assert');
const { azureSenderFactory } = require('../../src/tools/azureSenderFactory');

const TOKEN = 'a';
const INPUT_MESSAGE = { sender: { id: 'random-string' },
    message: { text: 'Hello world' },
    meta: {
        type: 'message',
        id: 'BxxupSfdLSxFBLNpnEo1Pz|0000000',
        from: {
            id: 'random-string',
            name: 'You',
            botId: 'random-bot-id',
            stage: 'staging'
        },
        conversation: { id: 'BxxupSfdLSxFBLNpnEo1Pz' },
        recipient: { id: 'cs-testbot@Hkh8NttIV6E', name: 'cs-testbot' },
        replyToId: undefined,
        locale: 'en-GB',
        serviceUrl: '/direct-line-api-url/',
        absToken: '6avLaA'
    }
};

function createLogger () {
    return {
        error: sinon.spy(),
        log: sinon.spy()
    };
}

describe('azureSenderFactory()', function () {

    it('should create sender factory and handle message', function () {
        const logger = createLogger();
        const factory = azureSenderFactory(TOKEN, logger);
        const sender = factory('user-id', INPUT_MESSAGE);

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
