/*
 * @author David Menger
 */
'use strict';

const { Tester, ai } = require('../index');
const BuildRouter = require('../src/BuildRouter');
const Blocks = require('../src/Blocks');
const co = require('co');
const testbot = require('./testbot.json');

describe('<BuildRouter>', function () {

    it('should behave as router', function () {
        const blocks = new Blocks();

        blocks.code('exampleBlock', function* (req, res) {
            yield res.run('responseBlockName');
        });

        const bot = BuildRouter.fromData(testbot.data, blocks);

        const t = new Tester(bot);

        return co(function* () {
            yield t.postBack('/start');

            t.passedAction('start');

            t.any()
                .genericTemplate(2)
                .contains('This is the first time, you\'re here')
                .attachmentType('image');

            yield t.postBack('/start');

            t.passedAction('start');

            t.any()
                .contains('This is your 1 visit')
                .quickReplyAction('subblock-include')
                .contains('Welcome in the bot');

            yield t.quickReply('subblock-include');

            t.passedAction('subblock-include');

            t.any()
                .buttonTemplate('text', 3)
                .contains('Want continue?')
                .quickReplyAction('back');

            yield t.quickReply('back');

            t.passedAction('back');
            t.passedAction('continued-action');

            t.any()
                .contains('Lets try to go deeper')
                .quickReplyAction('deep-entrypoint');

            yield t.quickReply('deep-entrypoint');

            t.passedAction('deep-entrypoint');

            t.any()
                .contains('Can go outside')
                .quickReplyAction('back');

            yield t.quickReply('back');

            t.passedAction('back');
            t.passedAction('continued-action');

            yield t.postBack('subblock-include');

            t.passedAction('subblock-include');

            ai.mockIntent('localIntent');

            yield t.text('anytext');

            t.any().contains('This is local AI reaction');

        });
    });

    it('should return translated messages', function () {
        const blocks = new Blocks();

        blocks.code('exampleBlock', function* (req, res) {
            yield res.run('responseBlockName');
        });

        const bot = BuildRouter.fromData(testbot.data, blocks);

        const t = new Tester(bot);

        t.setState({ lang: 'cz' });

        return co(function* () {
            yield t.postBack('/start');

            t.passedAction('start');

            t.any()
                .contains('To je poprvé');

        });

    });

});
