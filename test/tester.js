/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const co = require('co');
const Tester = require('../src/Tester');
const Router = require('../src/Router');

describe('Tester', function () {

    it('should be able to test', function () {

        const music = new Router();

        music.use('/', (req, res) => {
            res.text('Listen to the music!', {
                back: 'Go back',
                play: {
                    title: 'Play',
                    match: /(^|\s)(play|plej)(\s|$)/
                }
            });
        });

        music.use('/back', () => 'exit');

        music.use('/play', (req, res, postBack) => {
            res.image('/image.png');
            postBack('./');
        });

        const read = new Router();

        read.use('/', (req, res) => {
            res.text('Lets read');
            return Router.CONTINUE;
        });

        read.use('/', (req, res) => {
            res.button('button text')
                .postBackButton('Action', 'go')
                .send();

            res.text('What?', {
                go: {
                    title: 'Go',
                    match: /(^|\s)(faa|fee)(\s|$)/,
                    foo: 1
                }
            });
        });

        read.use('/go', (req, res) => {
            const { foo = 0 } = req.action(true);
            res.text('See: %s', foo);
            res.expected('out', { bar: 1 });
        });

        read.use('out', (req, res) => {
            const { bar = 0 } = req.action(true);
            res.text('Yeah: %s', bar);
            res.text(req.text());
        });

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

        r.use('/read', read)
            .onExit('exit', (data, req, res, postBack) => {
                postBack('/start');
            });


        const t = new Tester(r);

        return co(function* () {
            yield t.postBack('/start');

            t.passedAction('start');
            t.passedAction('/start');
            t.any()
                .contains('Go thru')
                .contains('Hello')
                .quickReplyAction('music')
                .quickReplyAction('read');
            t.lastRes()
                .contains('Hello')
                .quickReplyAction('music')
                .quickReplyAction('read');

            assert.throws(() => t.any().contains('nothing'));
            assert.throws(() => t.lastRes().contains('nothing'));
            assert.throws(() => t.any().quickReplyAction('nothing'));
            assert.throws(() => t.lastRes().quickReplyAction('nothing'));

            assert.throws(() => t.any().templateType('button'));
            assert.throws(() => t.any().attachmentType('image'));
            assert.throws(() => t.lastRes().templateType('button'));
            assert.throws(() => t.lastRes().attachmentType('image'));

            yield t.quickReply('music');

            t.passedAction('/music')
                .any()
                    .contains('Listen')
                    .quickReplyAction('play');

            yield t.text('plej');

            t.passedAction('play')
                .passedAction('/music');

            t.res(0).attachmentType('image');
            t.res(1).contains('Listen');

            t.any()
                .attachmentType('image')
                .contains('Listen');

            yield t.quickReply('back');

            t.passedAction('/music/back');
            t.passedAction('/start');

            yield t.quickReply('read');

            t.passedAction('/read');
            t.any().contains('Lets read');
            t.any().contains('what');
            t.any().templateType('button');

            yield t.text('faa');

            t.passedAction('go');
            t.any().contains('See: 1');
            assert.throws(() => t.any().contains('See: 0'));

            yield t.text('Random Text');

            t.passedAction('out');
            t.any().contains('Yeah: 1');
            t.any().contains('Random Text');

        });
    });

    it('should match path only when the end matches', () => {
        const nested = new Router();

        nested.use('in', (req, res) => {
            res.text('INNER');
        });

        const r = new Router();

        r.use('inner', nested);


        const t = new Tester(r);

        return co(function* () {

            yield t.postBack('/inner/in');

            t.any()
                .contains('INNER');

            t.passedAction('in');
        });
    });

    it('should work with optins', function () {

        const r = new Router();
        let i = 0;

        r.use('/start', (req, res, postBack) => {
            i++;
            res.text(`Hello ${req.state.i || '0'}`);
            res.text(req.isOptin() ? 'optin' : 'postback');
            res.text(req.senderId ? 'hasSender' : 'noSender');
            res.setState({ i });
            postBack('postBack');
        });

        r.use('/postBack', (req, res) => {
            i++;
            res.setState({ i });
            res.text(`Go ${req.state.i}`);
        });


        const t = new Tester(r);

        return co(function* () {

            yield t.postBack('/start');

            assert.deepEqual(t.getState().state, { i: 2 });
            t.any()
                .contains('postback')
                .contains('hasSender')
                .contains('Hello 0')
                .contains('Go 1');

            yield t.optin('/start');

            assert.deepEqual(t.getState().state, { i: 4 });
            t.any()
                .contains('optin')
                .contains('noSender')
                .contains('Hello 0')
                .contains('Go 3');

        });

    });

});
