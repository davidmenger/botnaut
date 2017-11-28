/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const Request = require('../src/Request');

const SENDER_ID = 'abcde';
const ACTION = 'action ACTION';
const FILE_URL = 'http://goo.gl';
const DATA = { a: 1 };
const STATE = {};
const REF_ACTION = 'action REF_ACTION';
const REF_DATA = { b: 2 };

describe('Request', function () {

    it('should have senderId and recipientId and pageId', function () {

        const postBack = Request.postBack(SENDER_ID, ACTION, DATA);

        postBack.recipient = {
            id: 789
        };

        const req = new Request(postBack, STATE, 456);

        assert.strictEqual(req.senderId, SENDER_ID);
        assert.strictEqual(req.pageId, 456);
        assert.strictEqual(req.recipientId, 789);
    });

    describe('#isPostBack()', function () {

        it('should know, whats postback', function () {
            const req = new Request(Request.postBack(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.isPostBack(), true);
        });

        it('should know, whats referral postback', function () {
            const req = new Request(
                Request.postBack(SENDER_ID, ACTION, DATA, REF_ACTION, REF_DATA),
                STATE
            );
            assert.strictEqual(req.isPostBack(), true);
        });

    });

    describe('#isReferral()', function () {

        it('should know, whats referral', function () {
            const req = new Request(Request.referral(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.isReferral(), true);
        });

        it('should know, whats referral', function () {
            const req = new Request(
                Request.postBack(SENDER_ID, ACTION, DATA, REF_ACTION, REF_DATA),
                STATE
            );
            assert.strictEqual(req.isReferral(), true);
        });

    });

    describe('#isOptin()', function () {

        it('should know, whats optin', function () {
            const req = new Request(Request.optin(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.isOptin(), true);
        });

    });

    describe('#.state', function () {

        it('should have state', function () {
            const req = new Request(Request.postBack(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.state, STATE);
        });

    });

    describe('#action()', function () {

        it('should return action name from postback', function () {
            const req = new Request(Request.postBack(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.action(), ACTION);
        });

        it('should return action data from postback', function () {
            const req = new Request(Request.postBack(SENDER_ID, ACTION, DATA), STATE);
            assert.deepEqual(req.action(true), DATA);
        });

        it('should return referral action name from postback', function () {
            const req = new Request(
                Request.postBack(SENDER_ID, ACTION, DATA, REF_ACTION, REF_DATA),
                STATE
            );
            assert.strictEqual(req.action(), REF_ACTION);
        });

        it('should return referral action data from postback', function () {
            const req = new Request(
                Request.postBack(SENDER_ID, ACTION, DATA, REF_ACTION, REF_DATA),
                STATE
            );
            assert.deepEqual(req.action(true), REF_DATA);
        });

        it('should return action name from referral', function () {
            const req = new Request(Request.referral(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.action(), ACTION);
        });

        it('should return action data from postback', function () {
            const req = new Request(Request.referral(SENDER_ID, ACTION, DATA), STATE);
            assert.deepEqual(req.action(true), DATA);
        });

        it('should return action name from optin', function () {
            const req = new Request(Request.optin(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.action(), ACTION);
        });

        it('should return action data from optin', function () {
            const req = new Request(Request.optin(SENDER_ID, ACTION, DATA), STATE);
            assert.deepEqual(req.action(true), DATA);
        });

        it('should return action name from quick reply', function () {
            const req = new Request(Request.quickReply(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.action(), ACTION);
        });

        it('should return action data from quick reply', function () {
            const req = new Request(Request.quickReply(SENDER_ID, ACTION, DATA), STATE);
            assert.deepEqual(req.action(true), DATA);
        });

        it('should return action name from _expected state', function () {
            const data = Request.quickReply(SENDER_ID, null);
            const req = new Request(data, { _expected: ACTION });
            assert.strictEqual(req.action(), ACTION);
        });

        it('should return action data from _expected state', function () {
            const data = Request.quickReply(SENDER_ID, null);
            const req = new Request(data, { _expected: ACTION });
            assert.deepEqual(req.action(true), {});
        });

        it('should return action name from _expected text', function () {
            const data = Request.text(SENDER_ID, 'Foo Bar');
            const req = new Request(data, {
                _expectedKeywords: [{ action: ACTION, match: 'foo-bar' }]
            });
            assert.strictEqual(req.action(), ACTION);
        });

        it('should return default action from pass thread event', function () {
            const req = new Request(Request.passThread(SENDER_ID, 'some-app'), STATE);
            assert.strictEqual(req.action(), 'pass-thread');
        });

        it('should return specified action from pass thread event', function () {
            const req = new Request(Request.passThread(SENDER_ID, 'some-app', ACTION), STATE);
            assert.strictEqual(req.action(), ACTION);
        });

        it('should return default action from pass thread event when random data given', function () {
            const data = { random: 'data' };
            const req = new Request(Request.passThread(SENDER_ID, 'some-app', data), STATE);
            assert.strictEqual(req.action(), 'pass-thread');
        });

        it('should return the data from pass thread event when given', function () {
            const data = { random: 'data' };
            const req = new Request(Request.passThread(SENDER_ID, 'some-app', data), STATE);
            assert.deepStrictEqual(req.action(true), data);
        });

    });

    describe('#postBack()', function () {

        it('should return action name', function () {
            const req = new Request(Request.postBack(SENDER_ID, ACTION), STATE);
            assert.strictEqual(req.postBack(), ACTION);
        });

        it('should return action data', function () {
            const req = new Request(Request.postBack(SENDER_ID, ACTION, DATA), STATE);
            assert.deepEqual(req.postBack(true), DATA);
        });

        it('should return referral action name', function () {
            const req = new Request(
                Request.postBack(SENDER_ID, ACTION, REF_ACTION, REF_DATA),
                STATE
            );
            assert.strictEqual(req.postBack(), ACTION);
        });

        it('should return referral action data', function () {
            const req = new Request(
                Request.postBack(SENDER_ID, ACTION, DATA, REF_ACTION, REF_DATA),
                STATE
            );
            assert.deepEqual(req.postBack(true), DATA);
        });

        it('should return null, when the message is not a postback', function () {
            const req = new Request(Request.quickReply(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.postBack(), null);
        });

    });

    describe('#quickReply()', function () {

        it('should return action name', function () {
            const req = new Request(Request.quickReply(SENDER_ID, ACTION), STATE);
            assert.strictEqual(req.quickReply(), ACTION);
        });

        it('should return action data', function () {
            const req = new Request(Request.quickReply(SENDER_ID, ACTION, DATA), STATE);
            assert.deepEqual(req.quickReply(true), DATA);
        });

        it('should return null, when the message is not a quick reply', function () {
            const req = new Request(Request.postBack(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.quickReply(), null);
        });
    });

    describe('#text() / #isMessage()', function () {

        it('should return original text', function () {
            let req = new Request(Request.quickReply(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.text(), ACTION);
            assert.strictEqual(req.isMessage(), true);

            req = new Request(Request.postBack(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.text(), '');
            assert.strictEqual(req.isMessage(), false);

            req = new Request(Request.fileAttachment(SENDER_ID, FILE_URL), STATE);
            assert.strictEqual(req.text(), '');
            assert.strictEqual(req.isMessage(), true);
        });

        it('should return tokenized text', function () {
            const req = new Request(Request.quickReply(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.text(true), 'action-action');
        });

    });

    describe('#isPassThread()', function () {

        it('should know, what is pass thread message', function () {
            const req = new Request(Request.passThread(SENDER_ID, 'app', DATA), STATE);
            assert.ok(req.isPassThread());
        });

    });

    describe('#isFile() / #isImage() / #isAttachment()', function () {

        it('should validate file type', function () {
            const req = new Request(Request.fileAttachment(SENDER_ID, FILE_URL), STATE);

            assert.strictEqual(req.isFile(), true);
            assert.strictEqual(req.isImage(), false);
            assert.strictEqual(req.isAttachment(), true);
        });

        it('should validate image type', function () {
            const req = new Request(Request.fileAttachment(SENDER_ID, FILE_URL, 'image'), STATE);

            assert.strictEqual(req.isFile(), false);
            assert.strictEqual(req.isImage(), true);
            assert.strictEqual(req.isAttachment(), true);
        });

        it('should return false when theres no message', function () {
            const req = new Request(Request.quickReply(SENDER_ID, ACTION, DATA), STATE);

            assert.strictEqual(req.isFile(), false);
            assert.strictEqual(req.isImage(), false);
            assert.strictEqual(req.isAttachment(), false);
        });

    });

    describe('#attachmentUrl() / #attachment()', function () {

        it('should validate file type', function () {
            const req = new Request(Request.fileAttachment(SENDER_ID, FILE_URL), STATE);

            assert.strictEqual(req.attachmentUrl(), FILE_URL);
            assert.strictEqual(req.attachmentUrl(2), null);
            assert.strictEqual(typeof req.attachment(), 'object');
        });

        it('should validate image type', function () {
            const req = new Request(Request.fileAttachment(SENDER_ID, FILE_URL, 'image'), STATE);

            assert.strictEqual(req.attachmentUrl(), FILE_URL);
            assert.strictEqual(typeof req.attachment(), 'object');
        });

        it('should return false when theres no message', function () {
            const req = new Request(Request.quickReply(SENDER_ID, ACTION, DATA), STATE);

            assert.strictEqual(req.attachmentUrl(), null);
            assert.strictEqual(req.attachment(), null);
        });

    });


});
