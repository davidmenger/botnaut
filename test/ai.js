/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const co = require('co');
const Ai = require('../src/Ai');
const Tester = require('../src/Tester');
const Router = require('../src/Router');
const Request = require('../src/Request');

const DEFAULT_SCORE = 0.96;

function createResponse (tag = 'hello', score = 0.96) {
    return { tags: tag ? [{ tag, score }] : [] };
}

function fakeReq (text = 'text') {
    return [
        {
            data: { timestamp: Date.now() },
            text () { return text; },
            isText () { return !!text; }
        },
        {},
        sinon.spy()
    ];
}

let syncRes;

const ai = new Ai();

describe('<Ai>', function () {

    beforeEach(function () {
        syncRes = Promise.resolve(createResponse());

        this.fakeRequest = sinon.spy(() => syncRes);

        ai.register('test', { request: this.fakeRequest });
    });

    describe('match()', function () {

        it('should use cache for responding requests', co.wrap(function* () {
            ai.register('test', { request: this.fakeRequest, cacheSize: 1 });

            const mid = ai.match('hello');
            const mid2 = ai.match(['hello']);
            let args = fakeReq();
            let res = yield mid(...args);

            assert.ok(this.fakeRequest.calledOnce);
            assert.strictEqual(res, Router.CONTINUE);
            assert.strictEqual(args[0].confidences.hello, DEFAULT_SCORE);

            args = fakeReq();

            yield mid2(...args);
            res = yield mid(...args);

            assert.ok(this.fakeRequest.calledOnce);
            assert.strictEqual(res, Router.CONTINUE);
            assert.strictEqual(args[0].confidences.hello, DEFAULT_SCORE);

            syncRes = Promise.resolve(createResponse(null));
            args = fakeReq('unknown');
            res = yield mid(...args);

            assert.ok(this.fakeRequest.calledTwice);
            assert.strictEqual(res, Router.BREAK);
            assert.strictEqual(args[0].confidences, undefined);
        }));

        it('should skip request without texts', co.wrap(function* () {
            const mid = ai.match('hello', 0.1);
            const args = fakeReq(null);
            const res = mid(...args);

            assert.ok(!this.fakeRequest.called);
            assert.strictEqual(res, Router.BREAK);
            assert.strictEqual(args[0].confidences, undefined);
        }));

        it('should skip request when the confidence is low', co.wrap(function* () {
            const mid = ai.match('hello', 1);
            const args = fakeReq('hello');
            const res = yield mid(...args);

            assert.ok(this.fakeRequest.called);
            assert.strictEqual(res, Router.BREAK);
            assert.strictEqual(args[0].confidences, undefined);
        }));

        it('mutes errors', co.wrap(function* () {
            syncRes = Promise.reject(new Error());
            const mid = ai.match('hello', 0.1);
            const args = fakeReq();
            const res = yield mid(...args);

            assert.ok(this.fakeRequest.calledOnce);
            assert.strictEqual(res, Router.BREAK);
            assert.strictEqual(args[0].confidences, undefined);
        }));

        it('mutes bad responses', co.wrap(function* () {
            syncRes = Promise.resolve({});
            const mid = ai.match('hello', 0.1);
            const args = fakeReq();
            const res = yield mid(...args);

            assert.ok(this.fakeRequest.calledOnce);
            assert.strictEqual(res, Router.BREAK);
            assert.strictEqual(args[0].confidences, undefined);
        }));

    });

    describe('mockIntent', function () {

        it('should mock all intents', () => {
            const testAi = new Ai();

            testAi.mockIntent('testIntent');

            const match = testAi.match('testIntent');

            const req = { isText: () => true, data: { timestamp: Date.now() } };

            return match(req, {})
                .then((res) => {
                    assert.strictEqual(res, Router.CONTINUE);
                    const { aiIntent, aiIntentScore, aiHandled } = req;

                    assert.strictEqual(aiIntent, 'testIntent');
                    assert.strictEqual(aiIntentScore, ai.confidence);
                    assert.strictEqual(aiHandled, true);
                });
        });

        it('should mock mock intent with request', () => {
            const testAi = new Ai();

            testAi.mockIntent();

            const match = testAi.match('testIntent');

            const data = Request.intent('any', 'hoho', 'testIntent');
            const req = { isText: () => true, data };

            return match(req, {})
                .then((res) => {
                    assert.strictEqual(res, Router.CONTINUE);
                    const { aiIntent, aiIntentScore, aiHandled } = req;

                    assert.strictEqual(aiIntent, 'testIntent');
                    assert.strictEqual(aiIntentScore, ai.confidence);
                    assert.strictEqual(aiHandled, true);
                });
        });

    });

    ['makeSure', 'navigate'].forEach((method) => {

        describe(`${method}()`, function () {

            it('proceeds to next resolver, when confidence is unsure', co.wrap(function* () {
                const mid = ai[method]({ hello: 'helloAction', dropIntent: 'drop' }, 0.5, 0.97);
                const args = fakeReq('text');
                const res = yield mid(...args);

                assert.ok(this.fakeRequest.calledOnce);
                assert.strictEqual(res, Router.CONTINUE);
                assert.strictEqual(args[0].confidences.hello, DEFAULT_SCORE);

                assert.deepEqual(args[1].ensures({
                    helloAction: 'Yes',
                    drop: 'No',
                    leave: 'Yes'
                }), {
                    helloAction: {
                        title: 'Yes',
                        _aiIntentMatched: 'hello',
                        _aiFromText: 'text',
                        _aiTs: args[0].data.timestamp,
                        _aiMeta: null
                    },
                    leave: 'Yes'
                });
            }));

            it('skips resolver, when there is bad confidence', co.wrap(function* () {
                const mid = ai[method]({ hello: 'helloAction', dropIntent: 'drop' }, 0.99, 0.99);
                const args = fakeReq('text');
                const res = yield mid(...args);

                assert.ok(this.fakeRequest.calledOnce);
                assert.strictEqual(res, Router.BREAK);
            }));

            it('skips resolver, when there no matching actions', co.wrap(function* () {
                const mid = ai[method](['unknownAction'], 0.1, 0.1);
                const mid2 = ai[method](['unknownAction']);
                const mid3 = ai[method](['unknownAction'], 0.97, 0.98);
                const args = fakeReq('text');
                const res = yield mid(...args);
                const res2 = yield mid2(...args);
                const res3 = yield mid3(...args);

                assert.ok(this.fakeRequest.calledOnce);
                assert.strictEqual(res, Router.BREAK);
                assert.strictEqual(res2, Router.BREAK);
                assert.strictEqual(res3, Router.BREAK);
            }));

            if (method === 'makeSure') {
                it('skips resolver, when there is high confidence', co.wrap(function* () {
                    const mid = ai[method]({ hello: 'helloAction', dropIntent: 'drop' }, 0.5, 0.5);
                    const args = fakeReq('text');
                    const res = yield mid(...args);

                    assert.ok(this.fakeRequest.calledOnce);
                    assert.strictEqual(res, Router.BREAK);
                }));
            } else if (method === 'navigate') {
                it('makes a postback high confidence', co.wrap(function* () {
                    const mid = ai[method]({ hello: 'helloAction', dropIntent: 'drop' }, 0.5, 0.5);
                    const args = fakeReq('text');
                    const res = yield mid(...args);

                    assert.ok(this.fakeRequest.calledOnce);
                    assert.strictEqual(res, Router.END);
                    assert.ok(args[2].calledOnce);
                    assert.deepEqual(args[2].firstCall.args, ['helloAction']);
                }));
            }

        });

    });

    describe('#onConfirmMiddleware()', function () {

        it('should be trigged, when user confirms an intent', function () {
            const r = new Router();
            const onConfirmSpy = sinon.spy();

            r.use(ai.onConfirmMiddleware(onConfirmSpy, req => ({
                aiIntentScore: req.aiIntentScore
            })));

            r.use(ai.makeSure(['testIntent']), (req, res) => {
                res.text('NAVI', res.ensures({
                    testIntent: 'quick reply'
                }));
            });

            r.use('testIntent', (req, res) => {
                res.text('RESPONSE');
            });

            const t = new Tester(r);

            return co(function* () {
                ai.mockIntent('testIntent', 0.7);
                yield t.text('Any text');

                t.any()
                    .quickReplyAction('testIntent')
                    .contains('NAVI');

                assert.strictEqual(onConfirmSpy.callCount, 0);

                yield t.quickReply('testIntent');

                t.any()
                    .contains('RESPONSE');

                assert.strictEqual(onConfirmSpy.callCount, 1);
                assert.deepEqual(onConfirmSpy.firstCall.args, [
                    t.senderId,
                    'testIntent',
                    'Any text',
                    onConfirmSpy.firstCall.args[3],
                    { aiIntentScore: 0.7 }
                ]);

            });
        });

    });

});
