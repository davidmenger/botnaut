/*
 * @author Vašek Strnad
 */
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const responderFactory = require('../src/responderFactory');

const SENDER_ID = 123;
const APP_URL = 'http://goo.gl';
const TOKEN = 't';

function createAssets () {
    const sendFn = sinon.spy();
    const translator = sinon.spy(w => `-${w}`);
    const opts = {
        translator,
        appUrl: APP_URL,
        token: TOKEN,
        autoTyping: false
    };
    return { sendFn, opts };
}

describe('responderFactory()', function () {

    it('should send nice text', function () {
        const { sendFn, opts } = createAssets();
        const factory = responderFactory(opts);
        const res = factory(SENDER_ID, sendFn);

        assert.strictEqual(res.text('Hello'), res, 'should return self');

        assert(sendFn.calledOnce);
        assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);
        assert.equal(sendFn.firstCall.args[0].message.text, '-Hello');

        assert(opts.translator.calledOnce);
    });

});
