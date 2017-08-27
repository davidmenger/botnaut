'use strict';

const request = require('request-promise-native');
const assert = require('assert');
const Router = require('./Router');

/**
 * @typedef {{ tag: string, score: number }} Intent
 */

/**
 * @class
 */
class Keyworder {

    /**
     * @param {Object} options
     * @param {string} options.serviceUrl
     * @param {string} options.model
     * @param {{ error: Function }} [options.log]
     */
    constructor (options) {
        assert.equal(typeof options.serviceUrl, 'string', 'The serviceUrl option has to be string');
        assert.equal(typeof options.model, 'string', 'The model option has to be string');
        this._options = options;
    }

    /**
     * @param {string} text - the user input
     * @param {string[]|Function|null} [allowed] - the array of desired intents or test function
     * @param {Object} [options={}]
     * @param {number} [options.threshold]
     * @param {number} [options.matched]
     * @returns {Promise.<null|{tag: string, score: number}|Array.<{tag: string, score: number}>>}
     */
    resolve (text, allowed, options = {}) {

        if ((text || '').trim().length === 0) {
            return Promise.resolve(null);
        }

        const qs = { text };
        if (options.matches) {
            qs.matches = options.matches;
        }

        return request({
            uri: `${this._options.serviceUrl}/${this._options.model}`,
            qs,
            json: true
        }).then((response) => {

            if (response.error) {
                throw new Error(`IntentProvider response error: ${response.error}`);

            } else if (!Array.isArray(response.tags)) {
                throw new Error('IntentProvider unknown response from the service');
            }

            let intents = this._filterByThreshold(response.tags, options.threshold);

            if (Array.isArray(allowed)) {
                intents = intents.filter(i => allowed.includes(i.tag));

            } else if (typeof allowed === 'function') {
                intents = intents.filter(i => allowed(i.tag));
            }

            if (!intents.length) {
                return null;

            } else if (intents.length === 1) {
                return intents[0];
            }

            return intents;
        });
    }

    /**
     * @param {Intent[]} intents
     * @param {number|null} [threshold]
     */
    _filterByThreshold (intents, threshold) {
        const t = typeof threshold === 'number' ? threshold : 0.95;
        return intents.filter(intent => intent.score >= t);
    }

    /**
     * @param {string[]|Function|null} [allowed] - the array of desired intents or test function
     * @param {Object} [options={}]
     * @param {number} [options.threshold=0.95] - select first tag resolved
     *                                            with this or higher score
     * @param {number} [options.lowThreshold] - let the user select from all tags
     *                                          with this or higher score
     * @param {number} [options.matches=5] - how many matches should be considered
     * @return {Function}
     *
     * @example
     * const { Keyworder } = require('botnaut');
     * const keyworder = new Keyworder('http://example-ai-api.com/', 'modelName');
     *
     * router.use(keyworder.middleware('hello-intent'), (req, res) => {
     *     // the matched intent is available in req.intent now
     *     res.text('Welcome too!');
     * });
     *
     */
    middleware (allowed, options = {}) {

        const threshold = typeof options.threshold === 'number' ? options.threshold : 0.95;
        const lowThreshold = typeof options.lowThreshold === 'number' ? options.lowThreshold : threshold;
        const matches = typeof options.matches === 'number' ? options.matches : 5;

        return (req, res) => {

            if (req.isQuickReply()) {
                const { intent } = req.quickReply(true);
                if (!intent) {
                    return Router.BREAK;
                }
                Object.assign(req, { intent });
                return Router.CONTINUE;

            } else if (!req.isText()) {
                return Router.BREAK;
            }

            return this.resolve(req.text(), allowed, { matches, threshold: lowThreshold })
                .then((result) => {

                    if (result === null) {
                        return Router.BREAK;
                    }

                    const intent = Array.isArray(result)
                        ? this._filterByThreshold(result, threshold)[0]
                        : result;

                    if (intent) {
                        Object.assign(req, { intent });
                        return Router.CONTINUE;
                    }

                    const t = res.t || (w => w);
                    res.text(t('What do you mean exactly?'), result.reduce((replies, choice) => Object.assign(replies, {
                        [choice.tag]: {
                            title: t(`INTENT_${choice.tag}`),
                            intent: choice
                        }
                    }), {})).expected(req.expected() || '/');

                    return Router.END;

                }, (err) => {
                    if (this._options.log) {
                        this._options.log.error(err);
                    }
                    return Router.BREAK; // the service is not available, just not match the path
                });
        };
    }

}

module.exports = Keyworder;
