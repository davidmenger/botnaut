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
            const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);

            assert.strictEqual(res.text('Hello'), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);
            assert.equal(sendFn.firstCall.args[0].message.text, '-Hello');

            assert(opts.translator.calledOnce);
        });

        it('should send nice text with quick replies', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(true, SENDER_ID, sendFn, TOKEN, opts);

            assert.strictEqual(res.text('Hello', {
                option: 'Text'
            }), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.user_ref, SENDER_ID);
            assert.equal(sendFn.firstCall.args[0].message.text, '-Hello');
            assert.equal(sendFn.firstCall.args[0].message.quick_replies[0].title, '-Text');
            assert.equal(sendFn.firstCall.args[0].message.quick_replies[0].payload, 'option');

            assert(opts.translator.calledTwice);
        });

        it('should send nice structured text with advanced quick replies', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);
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
                { action: '/foo/option', match: '^text-title$', data: { information: 1 } },
                { action: '/foo/another', match: 'some|another', data: {} },
                { action: '/foo/textMatch', match: '^custom-text$', data: {} }
            ]);
        });

        it('should send typing off and seen messages', function () {
            const { sendFn, opts } = createAssets();

            const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);

            res.typingOn();
            res.typingOff();
            res.seen();

            assert(sendFn.callCount, 3);
            assert.equal(sendFn.getCall(0).args[0].sender_action, 'typing_on');
            assert.equal(sendFn.getCall(1).args[0].sender_action, 'typing_off');
            assert.equal(sendFn.getCall(2).args[0].sender_action, 'mark_seen');
        });

        it('should send "typing" and "wait" in case of autoTyping is on', function () {
            const { sendFn, opts } = createAssets();
            opts.autoTyping = true;

            const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);

            res.text('Hahahaaaa');
            res.text('You are so funny!! So funny I need to write this veeeeeeery long message to test typing_on is longer for long texts.');

            assert(sendFn.callCount, 6);
            assert.equal(sendFn.getCall(0).args[0].sender_action, 'typing_on');
            assert.equal(typeof sendFn.getCall(1).args[0].wait, 'number');
            assert.equal(sendFn.getCall(2).args[0].message.text, '-Hahahaaaa');
            assert.equal(sendFn.getCall(3).args[0].sender_action, 'typing_on');
            assert.equal(typeof sendFn.getCall(4).args[0].wait, 'number');
            assert.equal(typeof sendFn.getCall(5).args[0].message.text, 'string');

            assert(
                sendFn.getCall(4).args[0].wait > sendFn.getCall(1).args[0].wait,
                'The wait time should be longer for long texts.'
            );
        });

    });

    [
        { media: 'image' },
        { media: 'video' },
        { media: 'file' }
    ].forEach(({ media }) => {

        describe(`#${media}()`, function () {

            it(`should send ${media} url with base path`, function () {
                const { sendFn, opts } = createAssets();
                const res = new Responder(true, SENDER_ID, sendFn, TOKEN, opts);

                assert.strictEqual(res[media]('/img.png'), res, 'should return self');

                assert(sendFn.calledOnce);
                assert.equal(sendFn.firstCall.args[0].recipient.user_ref, SENDER_ID);

                const attachment = sendFn.firstCall.args[0].message.attachment;
                assert.equal(attachment.type, media);
                assert.equal(attachment.payload.url, `${APP_URL}/img.png`);
            });

            it(`should send ${media} url without base path`, function () {
                const { sendFn, opts } = createAssets();
                const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);

                assert.strictEqual(res[media]('http://goo.gl/img.png'), res, 'should return self');

                assert(sendFn.calledOnce);
                assert.equal(sendFn.firstCall.args[0].recipient.id, SENDER_ID);

                const attachment = sendFn.firstCall.args[0].message.attachment;
                assert.equal(attachment.type, media);
                assert.equal(attachment.payload.url, 'http://goo.gl/img.png');
            });

        });

    });

    describe('#button()', function () {

        it('should send message with url', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(true, SENDER_ID, sendFn, TOKEN, opts);

            res.setPath('/hello');

            res.button('Hello')
                .postBackButton('Text', 'action')
                .urlButton('Url button', '/internal', true)
                .send();

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.user_ref, SENDER_ID);

            const attachment = sendFn.firstCall.args[0].message.attachment;
            assert.equal(attachment.type, 'template');

            const payload = attachment.payload;
            assert.equal(payload.template_type, 'button');
            assert.equal(payload.buttons.length, 2);

            assert.equal(payload.buttons[0].title, '-Text');
            assert.equal(payload.buttons[0].type, 'postback');
            assert.equal(payload.buttons[0].payload, '{"action":"/hello/action","data":{}}');

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
            const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);

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

    describe('#toAbsoluteAction()', function () {

        it('converts relative ation to absolute', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);

            assert.equal(res.toAbsoluteAction('xyz'), 'xyz');
            assert.equal(res.toAbsoluteAction('/xyz'), '/xyz');

            res.setPath('abs');

            assert.equal(res.toAbsoluteAction('xyz'), 'abs/xyz');
            assert.equal(res.toAbsoluteAction('/xyz'), '/xyz');

            res.setPath('/abs');

            assert.equal(res.toAbsoluteAction('xyz'), '/abs/xyz');
            assert.equal(res.toAbsoluteAction('/xyz'), '/xyz');

        });

    });

    describe('#setMessgingType()', function () {

        it('sends default message type', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);

            assert.strictEqual(res.text('Hello'), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].messaging_type, 'RESPONSE');

            assert(opts.translator.calledOnce);
        });

        it('sets message type to message', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);

            res.setMessgingType(Responder.TYPE_NON_PROMOTIONAL_SUBSCRIPTION);

            assert.strictEqual(res.text('Hello'), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(
                sendFn.firstCall.args[0].messaging_type,
                Responder.TYPE_NON_PROMOTIONAL_SUBSCRIPTION
            );

            assert(opts.translator.calledOnce);
        });

        it('sets message tag to message', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);

            res.setMessgingType(Responder.TYPE_MESSAGE_TAG, 'TAG');

            assert.strictEqual(res.text('Hello'), res, 'should return self');

            assert(sendFn.calledOnce);
            assert.equal(
                sendFn.firstCall.args[0].messaging_type,
                Responder.TYPE_MESSAGE_TAG
            );
            assert.equal(
                sendFn.firstCall.args[0].tag,
                'TAG'
            );

            assert(opts.translator.calledOnce);
        });

    });

    describe('#genericTemplate()', function () {

        it('should send message with generic template', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(true, SENDER_ID, sendFn, TOKEN, opts);

            res.setPath('/path');

            res.genericTemplate()
                .addElement('title', 'subtitle')
                .setElementImage('/local.png')
                .postBackButton('Button title', 'action', { actionData: 1 })
                .addElement('another', null, true)
                .setElementImage('https://goo.gl/image.png')
                .setElementAction('/localUrl', true)
                .urlButton('Local link with extension', '/local/path', true, 'compact')
                .send();

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.user_ref, SENDER_ID);

            const attachment = sendFn.firstCall.args[0].message.attachment;
            assert.equal(attachment.type, 'template');

            const payload = attachment.payload;
            assert.equal(payload.template_type, 'generic');
            assert.equal(payload.elements.length, 2);

            assert.equal(payload.elements[0].title, '-title');
            assert.equal(payload.elements[0].subtitle, '-subtitle');
            assert.equal(payload.elements[0].image_url, `${APP_URL}/local.png`);
            assert.equal(payload.elements[0].buttons.length, 1);

            assert.equal(payload.elements[1].title, 'another');
            assert.strictEqual(payload.elements[1].subtitle, undefined);
            assert.equal(payload.elements[1].image_url, 'https://goo.gl/image.png');
            assert.deepEqual(payload.elements[1].default_action, {
                type: 'web_url',
                url: 'http://goo.gl/localUrl#token=t&senderId=123',
                webview_height_ratio: 'tall',
                messenger_extensions: true
            });
            assert.equal(payload.elements[1].buttons.length, 1);

            assert.notStrictEqual(payload.elements[0].buttons, payload.elements[1].buttons);

            assert.equal(opts.translator.callCount, 4);
        });

    });

    describe('#list()', function () {

        it('should send message with generic template', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(true, SENDER_ID, sendFn, TOKEN, opts);

            res.setPath('/path');

            res.list()
                .addElement('title', 'subtitle')
                .setElementImage('/local.png')
                .setElementUrl('https://www.seznam.cz')
                .postBackButton('Button title', 'action', { actionData: 1 })
                .addElement('another', null, true)
                .setElementImage('https://goo.gl/image.png')
                .setElementAction('/localUrl', true)
                .urlButton('Local link with extension', '/local/path', true, 'compact')
                .send();

            assert(sendFn.calledOnce);
            assert.equal(sendFn.firstCall.args[0].recipient.user_ref, SENDER_ID);

            const attachment = sendFn.firstCall.args[0].message.attachment;
            assert.equal(attachment.type, 'template');

            const payload = attachment.payload;
            assert.equal(payload.template_type, 'list');
            assert.equal(payload.elements.length, 2);

            assert.equal(payload.elements[0].title, '-title');
            assert.equal(payload.elements[0].subtitle, '-subtitle');
            assert.equal(payload.elements[0].image_url, `${APP_URL}/local.png`);
            assert.equal(payload.elements[0].item_url, 'https://www.seznam.cz');
            assert.equal(payload.elements[0].buttons.length, 1);

            assert.equal(payload.elements[1].title, 'another');
            assert.strictEqual(payload.elements[1].subtitle, undefined);
            assert.equal(payload.elements[1].image_url, 'https://goo.gl/image.png');
            assert.deepEqual(payload.elements[1].default_action, {
                type: 'web_url',
                url: 'http://goo.gl/localUrl#token=t&senderId=123',
                webview_height_ratio: 'tall',
                messenger_extensions: true
            });
            assert.equal(payload.elements[1].buttons.length, 1);

            assert.notStrictEqual(payload.elements[0].buttons, payload.elements[1].buttons);

            assert.equal(opts.translator.callCount, 4);
        });

    });

    describe('#expected()', function () {

        it('should set state to absolute expected value', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);

            res.setPath('/relative');

            res.expected('makeAction');

            assert.deepEqual(res.newState, { _expected: { action: '/relative/makeAction', data: {} } });
        });

        it('should set state absolute expectation', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(true, SENDER_ID, sendFn, TOKEN, opts);

            res.setPath('/relative');

            res.expected('/absoule/path');

            assert.deepEqual(res.newState, { _expected: { action: '/absoule/path', data: {} } });
        });

        it('should null expected action with null', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(false, SENDER_ID, sendFn, TOKEN, opts);

            res.setPath('/relative');

            res.expected(null);

            assert.deepStrictEqual(res.newState, { _expected: null });
        });

    });


    describe('#wait()', function () {

        it('creates wait action', function () {
            const { sendFn, opts } = createAssets();
            const res = new Responder(true, SENDER_ID, sendFn, TOKEN, opts);

            res.wait(100);

            assert(sendFn.calledOnce);
            const object = sendFn.firstCall.args[0];
            assert.deepStrictEqual(object, { wait: 100, messaging_type: 'RESPONSE' });
        });

    });

});
