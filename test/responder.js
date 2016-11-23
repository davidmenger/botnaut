/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Responder = require('../src/Responder');

const SENDER_ID = 123;
const APP_URL = 'http://goo.gl';
const TOKEN = 't';

function createAssets () {
    const sendFn = sinon.spy();
    const translator = sinon.spy(w => `-${w}`);
    return { sendFn, translator };
}

describe('Responder', function () {

    describe('#text()', function () {

        it('should send nice text', function () {
            const { sendFn, translator } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, APP_URL, TOKEN, translator);

            assert.strictEqual(res.text('Hello'), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);
            assert.equal(sendFn.firstCall.args[0].message.text, '-Hello');

            assert(translator.calledOnce);
        });

        it('should send nice text with quick replies', function () {
            const { sendFn, translator } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, APP_URL, TOKEN, translator);

            assert.strictEqual(res.text('Hello', {
                option: 'Text'
            }), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);
            assert.equal(sendFn.firstCall.args[0].message.text, '-Hello');
            assert.equal(sendFn.firstCall.args[0].message.quick_replies[0].title, '-Text');
            assert.equal(sendFn.firstCall.args[0].message.quick_replies[0].payload, 'option');

            assert(translator.calledTwice);
        });

        it('should send nice structured text with advanced quick replies', function () {
            const { sendFn, translator } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, APP_URL, TOKEN, translator);

            assert.strictEqual(res.text('Hello %s', 'string', {
                option: {
                    title: 'Text',
                    information: 1
                }
            }), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);
            assert.equal(sendFn.firstCall.args[0].message.text, '-Hello string');
            assert.equal(sendFn.firstCall.args[0].message.quick_replies[0].title, '-Text');
            assert.equal(sendFn.firstCall.args[0].message.quick_replies[0].payload, '{"action":"option","data":{"information":1}}');

            assert(translator.calledTwice);
        });

    });

    describe('#image()', function () {

        it('should send image url with base path', function () {
            const { sendFn, translator } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, APP_URL, TOKEN, translator);

            assert.strictEqual(res.image('/img.png'), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);

            const attachment = sendFn.firstCall.args[0].message.attachment;
            assert.equal(attachment.type, 'image');
            assert.equal(attachment.payload.url, `${APP_URL}/img.png`);
        });

        it('should send image url without base path', function () {
            const { sendFn, translator } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, APP_URL, TOKEN, translator);

            assert.strictEqual(res.image('http://goo.gl/img.png'), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);

            const attachment = sendFn.firstCall.args[0].message.attachment;
            assert.equal(attachment.type, 'image');
            assert.equal(attachment.payload.url, 'http://goo.gl/img.png');
        });

    });

    describe('#button()', function () {

        it('should send message with url', function () {
            const { sendFn, translator } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, APP_URL, TOKEN, translator);

            res.button('Hello')
                .postBackButton('Text', 'action')
                .urlButton('Url button', '/internal', true)
                .send();

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);

            const attachment = sendFn.firstCall.args[0].message.attachment;
            assert.equal(attachment.type, 'template');

            const payload = attachment.payload;
            assert.equal(payload.template_type, 'button');
            assert.equal(payload.buttons.length, 2);

            assert.equal(payload.buttons[0].title, '-Text');
            assert.equal(payload.buttons[0].type, 'postback');
            assert.equal(payload.buttons[0].payload.action, 'action');

            assert.equal(payload.buttons[1].title, '-Url button');
            assert.equal(payload.buttons[1].type, 'web_url');
            assert.equal(payload.buttons[1].url, 'http://goo.gl/internal#token=t&senderId=123');
            assert.equal(payload.buttons[1].messenger_extensions, true);

            assert(translator.calledThrice);
        });

    });

    describe('#receipt()', function () {

        it('should send message with receipt', function () {
            const { sendFn, translator } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, APP_URL, TOKEN, translator);

            res.receipt('Name', 'Cash', 'CZK', '1')
                .addElement('Element', 1, 2, '/inside.png', 'text')
                .send();

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);

            const attachment = sendFn.firstCall.args[0].message.attachment;
            assert.equal(attachment.type, 'template');

            const payload = attachment.payload;
            assert.equal(payload.template_type, 'receipt');
            assert.equal(payload.elements.length, 1);

            assert.equal(payload.elements[0].title, '-Element');
            assert.equal(payload.elements[0].subtitle, '-text');
            assert.equal(payload.elements[0].price, 1);
            assert.equal(payload.elements[0].image, 'http://goo.gl/inside.png');

            assert(translator.calledTwice);
        });

    });

});
