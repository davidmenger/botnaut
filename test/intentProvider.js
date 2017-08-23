'use strict';

const { describe, it } = require('mocha');
const { IntentProvider } = require('../');
const co = require('co');
const assert = require('assert');
const { spy } = require('sinon');

describe('IntentProvider', function () {

    it('should be able to request the service', co.wrap(function* () {

        this.timeout(0);

        const provider = new IntentProvider({ serviceUrl: 'https://quhmhbjyag.execute-api.eu-west-1.amazonaws.com/test/t100' });
        const tag = yield provider.resolve('ticket');

        assert.equal(tag, 'buy_ticket');
    }));

    it('should filter intents', co.wrap(function* () {

        this.timeout(0);

        const provider = new IntentProvider({ serviceUrl: 'https://quhmhbjyag.execute-api.eu-west-1.amazonaws.com/test/t100' });
        const tag = yield provider.resolve('ticket', []);

        assert.equal(tag, null);
    }));

    it('should filter intents', co.wrap(function* () {

        this.timeout(0);
        const filter = spy(() => true);

        const provider = new IntentProvider({ serviceUrl: 'https://quhmhbjyag.execute-api.eu-west-1.amazonaws.com/test/t100' });
        const tag = yield provider.resolve('ticket', filter);

        assert.equal(tag, 'buy_ticket');
        assert.equal(filter.callCount, 1);
        assert.deepEqual(filter.args[0], ['buy_ticket']);
    }));

    it('should return null for the empty string', co.wrap(function* () {

        this.timeout(0);

        const provider = new IntentProvider({ serviceUrl: 'https://quhmhbjyag.execute-api.eu-west-1.amazonaws.com/test/t100' });
        const tag = yield provider.resolve('');
        assert.equal(tag, null);
    }));

});
