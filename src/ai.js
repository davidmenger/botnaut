/*
 * @author David Menger
 */
'use strict';

const WingbotModel = require('./WingbotModel');
const Router = require('./Router');
const assert = require('assert');

const SERVICE_URL = 'https://model.wingbot.ai';
const DEFAULT_PREFIX = 'default';

/**
 * @class Ai
 */
class Ai {

    constructor () {
        this._keyworders = new Map();

        /**
         * Upper threshold - for match method and for navigate method
         *
         * @type {number}
         * @memberOf Ai
         */
        this.confidence = 0.95;

        /**
         * Lower threshold - for navigate and makeSure methods
         *
         * @type {number}
         * @memberOf Ai
         */
        this.threshold = 0.8;

        /**
         * The logger (console by default)
         *
         * @type {Object}
         * @memberOf Ai
         */
        this.logger = console;
    }

    /**
     * Registers Wingbot AI model
     *
     * @param {string} model - model name
     * @param {Object} options - the configuration
     * @param {number} options.cacheSize - remember number of caches
     * @param {number} options.matches - ask AI for number of matches
     * @param {string} prefix - model prefix
     */
    register (model, options = {}, prefix = 'default', Model = WingbotModel) {
        const opts = Object.assign({
            serviceUrl: SERVICE_URL,
            model
        }, options);

        const keyworder = new Model(opts, this.logger);

        this._keyworders.set(prefix, keyworder);
    }

    /**
     * Returns matching middleware
     *
     * @param {string|Array} intent
     * @param {number} [confidence]
     * @param {string} [prefix]
     * @returns {function} - the middleware
     * @example
     * const { Router, ai } = require('botnaut');
     *
     * ai.register('app-model');
     *
     * bot.use(ai.match('intent1'), (req, res) => {
     *     console.log(req.confidences); // { intent1: 0.9604 }
     *
     *     res.text('Oh, intent 1 :)');
     * });
     */
    match (intent, confidence = this.confidence, prefix = DEFAULT_PREFIX) {
        const intents = Array.isArray(intent) ? intent : [intent];
        return this._middlewareFactory(prefix, intents, null, confidence);
    }

    /**
     * Create AI middleware, which resolves multiple replies
     * and **makes postback, when it's confident**
     * Confidence should be between `threshold` and `confidence` to proceed
     * to next resolver
     *
     * @param {Array|Object} knownIntents - list or map of accepted intents
     * @param {number} [threshold] - lower threshold
     * @param {number} [confidence] - upper threshold for confidence
     * @param {string} [prefix] - model name
     * @returns {function} - the middleware
     * @example
     * const { Router, ai } = require('botnaut');
     *
     * bot.use(ai.navigate(['intent1', 'intent2']), (req, res) => {
     *     console.log(req.confidences); // { intent1: 0.8604, intent2: undefined }
     *
     *     res.text('What you mean?', res.ensures({
     *         intent1: 'Intent one?',
     *         intent2: 'Intent two?',
     *         anyOther: 'Niether'
     *     }));
     * });
     */
    navigate (
        knownIntents,
        threshold = this.threshold,
        confidence = this.confidence,
        prefix = DEFAULT_PREFIX) {

        const filterFn = tag => confidence > tag.score && tag.score >= threshold;

        return this._middlewareFactory(prefix, knownIntents, filterFn, confidence);
    }

    /**
     * Create AI middleware, which resolves multiple replies.
     * Confidence should be between `threshold` and `confidence` to proceed
     * to next resolver
     *
     * @param {Array|Object} knownIntents - list or map of accepted intents
     * @param {number} [threshold] - lower threshold
     * @param {number} [confidence] - upper threshold for confidence
     * @param {string} prefix - model name
     * @returns {function} - the middleware
     * @example
     * const { Router, ai } = require('botnaut');
     *
     * bot.use(ai.makeSure(['intent1', 'intent2']), (req, res) => {
     *     console.log(req.confidences); // { intent1: 0.8604, intent2: undefined }
     *
     *     res.text('What you mean?', res.ensures({
     *         intent1: 'Intent one?',
     *         intent2: 'Intent two?',
     *         anyOther: 'Niether'
     *     }));
     * });
     */
    makeSure (
        knownIntents,
        threshold = this.threshold,
        confidence = this.confidence,
        prefix = DEFAULT_PREFIX) {

        const filterFn = tag => confidence > tag.score && tag.score >= threshold;

        return this._middlewareFactory(prefix, knownIntents, filterFn);
    }

    _middlewareFactory (prefix, knownIntents, filterFn = null, postBackConfidence = null) {
        const acceptIntents = Array.isArray(knownIntents)
            ? knownIntents
            : Object.keys(knownIntents);

        const actionMap = Array.isArray(knownIntents)
            ? knownIntents.reduce((o, i) => Object.assign(o, { i }), {})
            : knownIntents;

        return (req, res, postBack) => {
            if (!req.isText()) {
                return Router.BREAK;
            }

            const model = this._keyworders.get(prefix);
            assert.ok(!!model, 'The model should be registered!');

            return model.resolve(req.text(true).replace(/-/g, ' '))
                .then((tags) => {
                    if (tags.length === 0) {
                        return Router.BREAK;
                    }

                    const firstTag = tags[0];

                    if (postBackConfidence !== null
                            && acceptIntents.indexOf(firstTag.tag) !== -1
                            && firstTag.score >= postBackConfidence) {

                        if (filterFn !== null) {
                            postBack(actionMap[firstTag.tag]);
                            return Router.END;
                        }

                        Object.assign(req, {
                            confidences: {
                                [firstTag.tag]: firstTag.score
                            }
                        });

                        return Router.CONTINUE;
                    }

                    if (filterFn === null) {
                        return Router.BREAK;
                    }

                    const matchedIntents = tags
                        .filter(tag => acceptIntents.indexOf(tag.tag) !== -1 && filterFn(tag));

                    const confidences = matchedIntents
                        .reduce((o, tag) => Object.assign(o, { [tag.tag]: tag.score }), {});

                    const dropActions = acceptIntents
                        .filter(intent => typeof confidences[intent] === 'undefined')
                        .map(intent => actionMap[intent]);

                    if (matchedIntents.length === 0) {
                        return Router.BREAK;
                    }

                    Object.assign(req, {
                        confidences
                    });

                    Object.assign(res, {
                        ensures: this._createEnsuresMethod(dropActions)
                    });

                    return Router.CONTINUE;
                });
        };
    }

    _createEnsuresMethod (dropActions) {
        return function ensures (replies) {
            const ret = Object.assign({}, replies);

            dropActions.forEach((action) => {
                if (typeof ret[action] !== 'undefined') {
                    delete ret[action];
                }
            });

            return ret;
        };
    }

}

module.exports = new Ai();
