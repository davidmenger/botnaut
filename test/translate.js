'use strict';

const assert = require('assert');
const co = require('co');
const sinon = require('sinon');
const Router = require('../').Router;
const translate = require('../').translate;
const Tester = require('../').Tester;


describe('translate', function () {

    it('should work', co.wrap(function* () {
        const router = new Router();

        router.use(translate(() => 'cs', { sourcePath: __dirname }));
        router.use('/test', (req, res) => {
            const { t } = res;
            assert.equal(typeof t, 'function');

            res.text(t('key1'));
            res.text(t('unknown key'));
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

        router.use(translate(() => 'pl', { sourcePath: __dirname }));
        const testRoute = sinon.spy();
        router.use('/test', testRoute);

        const tester = new Tester(router);

        yield tester.postBack('/test').then(() => {
            throw new Error('This should not happen');
        }, () => null);

        assert(testRoute.notCalled);
    }));
});
