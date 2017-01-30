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

describe('Request', function () {

    it('should have senderId and recipientId and pageId', function () {

        const postBack = Request.createPostBack(SENDER_ID, ACTION, DATA);

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
            const req = new Request(Request.createPostBack(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.isPostBack(), true);
        });

    });

    describe('#.state', function () {

        it('should have state', function () {
            const req = new Request(Request.createPostBack(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.state, STATE);
        });

    });

    describe('#action()', function () {

        it('should return action name from postback', function () {
            const req = new Request(Request.createPostBack(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.action(), ACTION);
        });

        it('should return action data from postback', function () {
            const req = new Request(Request.createPostBack(SENDER_ID, ACTION, DATA), STATE);
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

    });

    describe('#postBack()', function () {

        it('should return action name', function () {
            const req = new Request(Request.createPostBack(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.postBack(), ACTION);
        });

        it('should return action data', function () {
            const req = new Request(Request.createPostBack(SENDER_ID, ACTION, DATA), STATE);
            assert.deepEqual(req.postBack(true), DATA);
        });

    });

    describe('#quickReply()', function () {

        it('should return action name', function () {
            const req = new Request(Request.quickReply(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.quickReply(), ACTION);
        });

        it('should return action data', function () {
            const req = new Request(Request.quickReply(SENDER_ID, ACTION, DATA), STATE);
            assert.deepEqual(req.quickReply(true), DATA);
        });

    });

    describe('#text() / #isMessage()', function () {

        it('should return original text', function () {
            let req = new Request(Request.quickReply(SENDER_ID, ACTION, DATA), STATE);
            assert.strictEqual(req.text(), ACTION);
            assert.strictEqual(req.isMessage(), true);

            req = new Request(Request.createPostBack(SENDER_ID, ACTION, DATA), STATE);
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
