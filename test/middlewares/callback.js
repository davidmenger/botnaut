/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const co = require('co');
const Router = require('../../src/Router');
const Tester = require('../../src/Tester');
const { callbackMiddleware } = require('../../src/middlewares/callback');

describe('callback middeware', function () {

    beforeEach(function () {
        const bot = new Router();

        const DEFAULT_CALLBACK_BLOCK = 'default';

        bot.use(callbackMiddleware());

        bot.use(['fooRoute', /^foo$/], (req, res) => {
            if (!req.isFromCallback(DEFAULT_CALLBACK_BLOCK)) {
                // is hidden, when user is just comming back
                res.text('This is your FOO response');
            }
            if (!req.hasCallback(DEFAULT_CALLBACK_BLOCK)) {
                res.setCallback('fooRoute', DEFAULT_CALLBACK_BLOCK);
            }

            // ability to stay in context
            res.addCallbackQuickReply('Go back');

            res.text('So, what you want?', {
                barRoute: 'Go to bar'
            });
        });

        bot.use(['contextRoute', /^context$/], (req, res) => {
            if (!req.isFromCallback(DEFAULT_CALLBACK_BLOCK)) {
                // is hidden, when user is just comming back
                res.text('This is your CONTEXT response');
            }
            if (!req.hasCallback(DEFAULT_CALLBACK_BLOCK)) {
                res.setCallback('contextRoute', DEFAULT_CALLBACK_BLOCK);
            }

            // callbacks within same block will not be proceeded
            if (!res.proceedCallback(DEFAULT_CALLBACK_BLOCK)) {
                res.text('So, in context?', {
                    barRoute: 'Go to bar'
                });
            }
        });

        bot.use(['barRoute', /^bar$/], (req, res) => {
            if (!req.isFromCallback()) {
                res.text('This is your BAR response');
            }
            if (!req.hasCallback()) {
                res.setCallback('barRoute');
            }

            if (!res.proceedCallback()) {
                res.text('So, what\'s next?', {
                    fooRoute: 'Go to foo'
                });
            }
        });

        this.t = new Tester(bot);
    });

    it('should not show backlink to self', function () {
        const t = this.t;

        return co(function* () {
            yield t.text('foo');

            yield t.text('foo');

            assert.deepEqual(t.responses[1].message, {
                text: 'So, what you want?',
                quick_replies: [
                    { content_type: 'text', payload: '/barRoute', title: 'Go to bar' }
                ]
            });

        });
    });

    it('should not fail in circle', function () {
        const t = this.t;

        return co(function* () {
            yield t.text('bar');

            yield t.text('bar');

            assert.strictEqual(t.actions.length, 1);

        });
    });

    it('should return user back', function () {
        const t = this.t;

        return co(function* () {
            yield t.text('foo');

            t.passedAction('fooRoute')
                .any()
                .contains('This is your FOO response')
                .contains('So, what you want?')
                .quickReplyAction('barRoute');

            assert.throws(() => {
                t.passedAction('barRoute');
            });

            yield t.text('bar');

            t.passedAction('fooRoute')
                .passedAction('barRoute')
                .any()
                .contains('This is your BAR response')
                .contains('So, what you want?');

            assert.throws(() => t.any()
                .contains('This is your FOO response'));
            assert.throws(() => t.any()
                .contains('So, what\'s next?'));

        });
    });

    it('keeps context when provided', function () {
        const t = this.t;

        return co(function* () {
            yield t.text('foo');

            t.passedAction('fooRoute')
                .any()
                .contains('This is your FOO response')
                .contains('So, what you want?')
                .quickReplyAction('barRoute');

            assert.throws(() => {
                t.passedAction('barRoute');
            });

            yield t.text('context');

            t.passedAction('contextRoute')
                .any()
                .contains('This is your CONTEXT response')
                .contains('So, in context?');

            assert.throws(() => t.passedAction('fooRoute'));

        });
    });

    it('should display the back message', function () {
        const t = this.t;
        // const t = new Tester(() => {});

        return co(function* () {
            yield t.text('bar');

            t.passedAction('barRoute')
                .any()
                .contains('This is your BAR response')
                .contains('So, what\'s next?')
                .quickReplyAction('fooRoute');

            assert.throws(() => {
                t.passedAction('fooRoute');
            });

            yield t.text('foo');

            t.passedAction('fooRoute')
                .any()
                .contains('This is your FOO response');

            assert.deepEqual(t.responses[1].message, {
                text: 'So, what you want?',
                quick_replies: [
                    {
                        content_type: 'text',
                        payload: '{"action":"/barRoute","data":{"_isFromCallback":"default"}}',
                        title: 'Go back'
                    },
                    { content_type: 'text', payload: '/barRoute', title: 'Go to bar' }
                ]
            });

            assert.throws(() => t.any()
                .contains('This is your BAR response'));
            assert.throws(() => t.any()
                .contains('So, what\'s next?'));

        });
    });


});
