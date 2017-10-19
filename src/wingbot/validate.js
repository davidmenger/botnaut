/*
 * @author David Menger
 */
'use strict';

const co = require('co');
const Tester = require('../Tester');

/**
 * Test the bot configuration
 *
 * @param {function} botFactory
 * @param {string} [postBackTestAction]
 * @param {string} [testText]
 */
function validate (botFactory, postBackTestAction = 'start', testText = 'hello') {
    let bot;
    try {
        bot = botFactory();
    } catch (e) {
        return Promise.reject(e);
    }

    return co(function* () {
        const t = new Tester(bot);

        if (postBackTestAction) {
            try {
                yield t.postBack(postBackTestAction);
            } catch (e) {
                throw new Error(`Postback failed: ${e.message}`);
            }
        }

        if (testText) {
            try {
                yield t.postBack(testText);
            } catch (e) {
                throw new Error(`Text message failed: ${e.message}`);
            }
        }
    });
}

module.exports = validate;
