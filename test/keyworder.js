'use strict';

const { describe, it } = require('mocha');
const { Keyworder, Router, Tester } = require('../');
const co = require('co');
const assert = require('assert');
const { spy } = require('sinon');

describe('Keyworder', function () {

    const keyworder = new Keyworder({
        serviceUrl: 'https://quhmhbjyag.execute-api.eu-west-1.amazonaws.com/test',
        model: 't100',
        log: console
    });
    this.timeout(0);

    describe('#resolve', function () {

        it('should be able to request the service', co.wrap(function* () {
            const tag = yield keyworder.resolve('ticket');
            assert.equal(tag.tag, 'buy_ticket');
        }));

        it('should filter intents', co.wrap(function* () {
            const tag = yield keyworder.resolve('ticket', []);
            assert.equal(tag, null);
        }));

        it('should filter intents', co.wrap(function* () {
            const filter = spy(() => true);
            const tag = yield keyworder.resolve('ticket', filter);

            assert.equal(tag.tag, 'buy_ticket');
            assert.equal(filter.callCount, 1);
            assert.deepEqual(filter.args[0], ['buy_ticket']);
        }));

        it('should return null for the empty string', co.wrap(function* () {
            const tag = yield keyworder.resolve('');
            assert.equal(tag, null);
        }));

    });


    describe('middleware', function () {

        it('should pass the request if text match and reject the path if not', function () {
            const r = new Router();

            r.use(keyworder.middleware(), (req, res) => {
                assert(req.intent, 'The intent should be resolved');
                assert.equal(req.intent.tag, 'buy_ticket');
                res.text('Success!');
                return Router.END;
            });

            r.use((req, res) => {
                res.text('noMatch');
            });

            const t = new Tester(r);

            return co(function* () {
                yield t.text('aaa');
                t.lastRes().contains('noMatch');

                yield t.text('ticket');
                t.lastRes().contains('Success!');
            });
        });

        it('should offer multiple choices to the user in case of multiple intents', function () {

            const r = new Router();

            r.use(keyworder.middleware(), (req, res) => {
                assert(req.intent, 'The intent should be resolved');
                assert.equal(req.intent.tag, 'buy_ticket');
                res.text('Success!');
                return Router.END;
            });

            r.use((req, res) => {
                res.text('noMatch');
            });

            const t = new Tester(r);

            return co(function* () {
                yield t.text('tucket');
                t.lastRes()
                    .contains('What do you mean exactly?')
                    .quickReplyAction('buy_ticket');

                yield t.quickReply('buy_ticket');
                t.lastRes()
                    .contains('Success!');

            });

        });
    });

});
