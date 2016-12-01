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
    const opts = { translator, appUrl: APP_URL };
    return { sendFn, opts };
}

describe('Responder', function () {

    describe('#text()', function () {

        it('should send nice text', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);

            assert.strictEqual(res.text('Hello'), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);
            assert.equal(sendFn.firstCall.args[0].message.text, '-Hello');

            assert(opts.translator.calledOnce);
        });

        it('should send nice text with quick replies', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);

            assert.strictEqual(res.text('Hello', {
                option: 'Text'
            }), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);
            assert.equal(sendFn.firstCall.args[0].message.text, '-Hello');
            assert.equal(sendFn.firstCall.args[0].message.quick_replies[0].title, '-Text');
            assert.equal(sendFn.firstCall.args[0].message.quick_replies[0].payload, 'option');

            assert(opts.translator.calledTwice);
        });

        it('should send nice structured text with advanced quick replies', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);
            res.path = '/foo';

            assert.strictEqual(res.text('Hello %s', 'string', {
                option: {
                    title: 'Text Title',
                    information: 1
                },
                another: {
                    title: 'Text2',
                    match: /some|another/
                },
                textMatch: {
                    title: 'Text2',
                    match: 'Custom Text'
                }
            }), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);
            assert.equal(sendFn.firstCall.args[0].message.text, '-Hello string');
            assert.equal(sendFn.firstCall.args[0].message.quick_replies[0].title, '-Text Title');
            assert.equal(sendFn.firstCall.args[0].message.quick_replies[0].payload, '{"action":"/foo/option","data":{"information":1}}');

            assert.equal(opts.translator.callCount, 4);

            assert.deepEqual(res.newState._expectedKeywords, [
                { action: '/foo/option', match: 'text-title', data: { information: 1 } },
                { action: '/foo/another', match: 'some|another', data: {} },
                { action: '/foo/textMatch', match: 'custom-text', data: {} }
            ]);
        });

    });

    describe('#image()', function () {

        it('should send image url with base path', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);

            assert.strictEqual(res.image('/img.png'), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);

            const attachment = sendFn.firstCall.args[0].message.attachment;
            assert.equal(attachment.type, 'image');
            assert.equal(attachment.payload.url, `${APP_URL}/img.png`);
        });

        it('should send image url without base path', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);

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
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);

            res.setPath('/hello');

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
            assert.equal(payload.buttons[0].payload.action, '/hello/action');

            assert.equal(payload.buttons[1].title, '-Url button');
            assert.equal(payload.buttons[1].type, 'web_url');
            assert.equal(payload.buttons[1].url, 'http://goo.gl/internal#token=t&senderId=123');
            assert.equal(payload.buttons[1].messenger_extensions, true);

            assert(opts.translator.calledThrice);
        });

    });

    describe('#receipt()', function () {

        it('should send message with receipt', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);

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

            assert(opts.translator.calledTwice);
        });

    });

    describe('#genericTemplate()', function () {

        it('should send message with generic template', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);

            res.setPath('/path');

            res.genericTemplate()
                .addElement('title', 'subtitle')
                    .setElementImage('/local.png')
                    .setElementUrl('https://www.seznam.cz')
                    .postBackButton('Button title', 'action', { actionData: 1 })
                .addElement('another', null, true)
                    .setElementImage('https://goo.gl/image.png')
                    .setElementAction('action', { actionData: 1 })
                    .urlButton('Local link with extension', '/local/path', true, 'compact')
                .send();

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);

            const attachment = sendFn.firstCall.args[0].message.attachment;
            assert.equal(attachment.type, 'template');

            const payload = attachment.payload;
            assert.equal(payload.template_type, 'generic');
            assert.equal(payload.elements.length, 2);

            assert.equal(payload.elements[0].title, '-title');
            assert.equal(payload.elements[0].subtitle, '-subtitle');
            assert.equal(payload.elements[0].image_url, `${APP_URL}/local.png`);
            assert.equal(payload.elements[0].item_url, 'https://www.seznam.cz');
            assert.equal(payload.elements[0].buttons.length, 1);

            assert.equal(payload.elements[1].title, 'another');
            assert.strictEqual(payload.elements[1].subtitle, undefined);
            assert.equal(payload.elements[1].image_url, 'https://goo.gl/image.png');
            assert.deepEqual(payload.elements[1].default_action, { action: '/path/action', data: { actionData: 1 } });
            assert.equal(payload.elements[1].buttons.length, 1);

            assert.notStrictEqual(payload.elements[0].buttons, payload.elements[1].buttons);

            assert.equal(opts.translator.callCount, 4);
        });

    });

    describe('#expected()', function () {

        it('should set state to absolute expected value', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);

            res.setPath('/relative');

            res.expected('makeAction');

            assert.deepEqual(res.newState, { _expected: { action: '/relative/makeAction', data: {} } });
        });

        it('should set state absolute expectation', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);

            res.setPath('/relative');

            res.expected('/absoule/path');

            assert.deepEqual(res.newState, { _expected: { action: '/absoule/path', data: {} } });
        });

        it('should null expected action with null', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);

            res.setPath('/relative');

            res.expected(null);

            assert.deepStrictEqual(res.newState, { _expected: null });
        });

    });


    describe('#wait()', function () {

        it('creates wait action', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(SENDER_ID, sendFn, TOKEN, opts);

            res.wait(100);

            assert(sendFn.calledOnce);
            const object = sendFn.firstCall.args[0];
            assert.deepStrictEqual(object, { wait: 100 });
        });

    });

});
