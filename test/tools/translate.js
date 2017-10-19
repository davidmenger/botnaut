'use strict';

const assert = require('assert');
const co = require('co');
const sinon = require('sinon');
const Translate = require('../../src/tools/Translate');
const Router = require('../../src/Router');
const Tester = require('../../src/Tester');


describe('<Translate>', function () {

    describe('#middleware()', function () {

        it('should work', co.wrap(function* () {
            const router = new Router();

            const t = new Translate({ sourcePath: __dirname });

            router.use(t.middleware(() => 'cs'));

            router.use('/test', (req, res) => {
                const { t: trans } = res;
                assert.equal(typeof trans, 'function');

                res.text(trans('key1'));
                res.text(res.t('unknown key'));
            });

            const tester = new Tester(router);

            yield tester.postBack('/test');

            tester.passedAction('/test');
            tester.any()
                .contains('value1') // translated key1
                .contains('unknown key');
        }));

        it('should fail with unknown locale', co.wrap(function* () {
            const router = new Router();

            const t = new Translate({ sourcePath: __dirname });

            router.use(t.middleware(() => 'pl'));

            const testRoute = sinon.spy();
            router.use('/test', testRoute);

            const tester = new Tester(router);

            yield tester.postBack('/test').then(() => {
                throw new Error('This should not happen');
            }, () => null);

            assert(testRoute.notCalled);
        }));

    });

    describe('#translator()', function () {

        it('throws error when bad arguments are used', function () {
            const t = new Translate({ sourcePath: __dirname });

            assert.throws(() => {
                t.translator(null);
            });

            assert.throws(() => {
                t.translator([null]);
            });

        });

        it('returns nice translation tool', function () {
            const t = new Translate({ sourcePath: __dirname });

            return t.translator(['cs'])
                .then((trans) => {
                    assert.strictEqual(trans.cs.t('key1'), 'value1');
                });

        });

    });

});
