/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const co = require('co');
const sinon = require('sinon');
const Tester = require('../src/Tester');
const Router = require('../src/Router');

function delay (job) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(job());
        }, 5);
    });
}

describe('Router extended functions', function () {

    it('should accept or with nested router', function () {
        const matcherForSpy = sinon.spy(() => delay(() => false));

        const nested = new Router();

        nested.use((req, res) => delay(() => {
            res.text('FIRST');
            return Router.exit('point');
        }));

        const r = new Router();

        r.use('/start', [matcherForSpy, nested])
            .onExit('point', (data, req, res, postBack) => postBack('follow'));

        r.use([/^hello$/, 'follow'], (req, res) => res.text('FOLLOW'));

        r.use((req, res) => res.text('SHOULD NOT'));


        const t = new Tester(r);

        return co(function* () {
            yield t.postBack('/start');

            assert(matcherForSpy.calledOnce);

            t.any()
                .contains('FIRST')
                .contains('FOLLOW');

        });
    });

    it('should proceed deep link into the nested router', function () {
        const nested = new Router();

        nested.use('/', (req, res) => delay(() => {
            res.text('FIRST');
        }));

        nested.use('deep', (req, res) => delay(() => {
            res.text('DEEP');
        }));

        const r = new Router();

        r.use('/start', (req, res) => {
            res.text('START', {
                'nested/deep': 'Test'
            });
        });

        r.use('nested', nested);


        const t = new Tester(r);

        return co(function* () {
            yield t.postBack('/start');

            t.any()
                .contains('START');

            yield t.quickReply('nested/deep');

            t.passedAction('deep');

            t.res(0).contains('DEEP');

        });
    });

    it('should be able to use array as OR condition', function () {

        const nested = new Router();

        nested.use((req, res) => res.text('SHOULD PROCESS'));

        const music = new Router();

        music.use(['play', /^play$/], (req, res) => {
            res.text('PLAYING');
            res.expected('expectedTest');
        });

        music.use('/', (req, res) => {
            res.text('Listen to the music!', {
                back: 'Go back',
                play: 'Play'
            }).expected('./'); // stay in this router
        });

        music.use('expectedTest', /^start$/, (req, res) => {
            res.text('START TEST');
            res.expected('expectedTest');
        });

        music.use('expectedTest', /^stop$/, (req, res) => {
            res.text('STOP TEST');
            res.expected('expectedTest');
        });

        music.use('/back', () => 'exit');

        const goThru = new Router();

        goThru.use('/start', (req, res) => {
            res.text('Go thru');
            return Router.CONTINUE;
        });

        const r = new Router();

        r.use(goThru);

        r.use('/start', (req, res) => {
            res.text('Hello!', {
                music: {
                    title: 'Listen music'
                },
                read: 'Read books'
            });
        });

        r.use('/music', music)
            .onExit('exit', (data, req, res, postBack) => {
                postBack('/start');
            });


        const t = new Tester(r);

        return co(function* () {
            yield t.postBack('/start');
            yield t.quickReply('music');

            t.passedAction('/music')
                .any()
                .contains('Listen')
                .quickReplyAction('play');

            yield t.text('play');

            t.any()
                .contains('PLAY');
            t.passedAction('play');

            yield t.text('stop');

            assert.strictEqual(t.responses.length, 1);
            t.any()
                .contains('stop test');


            yield t.text('start');

            assert.strictEqual(t.responses.length, 1);
            t.any()
                .contains('start test');
        });
    });

    it('should match the text from quick reply', () => {
        const r = new Router();

        r.use('/start', (req, res) => {
            res.text('START', {
                rt: 'Test'
            });
            res.expected('fallback');
        });

        r.use('rt', (req, res) => {
            res.text('DEEP');
            res.expected('fallback');
        });

        r.use('fallback', (req, res) => {
            res.text('FB');
        });

        const t = new Tester(r);

        return co(function* () {
            yield t.postBack('/start');

            t.any()
                .contains('START');

            yield t.text('test');

            t.passedAction('rt');

            t.res(0).contains('DEEP');

            yield t.text('test');

            t.passedAction('fallback');

            yield t.postBack('/start');

            t.any()
                .contains('START');

            yield t.text('test test');

            t.passedAction('fallback');
        });
    });

});
