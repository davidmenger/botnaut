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
 * Mark request as handled - usefull for AI analytics
 *
 * @param {boolean} [aiHandled] true by default
 * @returns {Request}
 * @example
 * bot.use('some other query', (req, res) => {
 *     req.markAsHandled();
 * });
 */
function markAsHandled (aiHandled = true) {
    Object.assign(this, { aiHandled });
    return this;
}

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
         */
        this.confidence = 0.94;

        /**
         * Lower threshold - for navigate and makeSure methods
         *
         * @type {number}
         */
        this.threshold = 0.6;

        /**
         * The logger (console by default)
         *
         * @type {Object}
         */
        this.logger = console;

        /**
         * The prefix translator - for request-specific prefixes
         *
         * @param {string} prefix
         * @param {Request} req
         */
        this.prefixTranslator = (prefix, req) => prefix; // eslint-disable-line

        this._mockIntent = null;
    }

    /**
     * Usefull method for testing AI routes
     *
     * @param {string} [intent] intent name
     * @param {number} [confidence] the confidence of the top intent
     * @returns {this}
     * @example
     * const { Tester, ai, Route } = require('bontaut');
     *
     * const bot = new Route();
     *
     * bot.use(['intentAction', ai.match('intentName')], (req, res) => {
     *     res.text('PASSED');
     * });
     *
     * describe('bot', function () {
     *     it('should work', function () {
     *         ai.mockIntent('intentName');
     *
     *         const t = new Tester(bot);
     *
     *         return t.text('Any text')
     *             .then(() => {
     *                 t.actionPassed('intentAction');
     *
     *             t.any()
     *                 .contains('PASSED');
     *         })
     *     });
     * });
     */
    mockIntent (intent = null, confidence = null) {
        if (intent === null) {
            this._mockIntent = null;
        } else {
            this._mockIntent = { intent, confidence };
        }
        return true;
    }

    /**
     * When user confirms their intent, this handler will be called
     * Its useful for updating training data for AI
     *
     * @param {function} onIntentConfirmed - handler, which will be called when intent is confirmed
     * @returns {function}
     * @example
     * const { Router, ai } = require('botnaut');
     *
     * bot.use(ai.onConfirmMiddleware((senderId, intent, text, timestamp) => {
     *     // log this information
     * }));
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
    onConfirmMiddleware (onIntentConfirmed, getMeta = null) {
        return (req) => {
            if (getMeta) {
                Object.assign(req, { getMeta });
            }

            if (!req.isQuickReply()) {
                return Router.CONTINUE;
            }

            const { _aiIntentMatched, _aiFromText, _aiTs, _aiMeta } = req.action(true);

            if (_aiIntentMatched) {
                onIntentConfirmed(req.senderId,
                    _aiIntentMatched,
                    _aiFromText,
                    _aiTs,
                    _aiMeta
                );
            }

            return Router.CONTINUE;
        };
    }

    /**
     * Registers Wingbot AI model
     *
     * @param {string} model - model name
     * @param {Object} options - the configuration
     * @param {number} options.cacheSize - remember number of caches
     * @param {number} options.matches - ask AI for number of matches
     * @param {string} prefix - model prefix
     * @memberOf Ai
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
     * @memberOf Ai
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
    match (intent, confidence = null, prefix = DEFAULT_PREFIX) {
        const intents = Array.isArray(intent) ? intent : [intent];
        return this._middlewareFactory(prefix, intents, null, confidence || true);
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
     * @memberOf Ai
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
        threshold = null,
        confidence = null,
        prefix = DEFAULT_PREFIX) {

        const filterFn = tag => (confidence || this.confidence) > tag.score
            && tag.score >= (threshold || this.threshold);

        return this._middlewareFactory(prefix, knownIntents, filterFn, confidence || true);
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
     * @memberOf Ai
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
        threshold = null,
        confidence = null,
        prefix = DEFAULT_PREFIX) {

        const filterFn = tag => (confidence || this.confidence) > tag.score
            && tag.score >= (threshold || this.threshold);

        return this._middlewareFactory(prefix, knownIntents, filterFn);
    }

    _queryModel (prefix, req) {
        if (this._mockIntent !== null) {
            return Promise.resolve([{
                tag: this._mockIntent.intent,
                score: this._mockIntent.confidence || this.confidence
            }]);
        }
        const prefixForRequest = this.prefixTranslator(prefix, req);

        const model = this._keyworders.get(prefixForRequest);
        assert.ok(!!model, 'The model should be registered!');

        return model.resolve(req.text(true).replace(/-/g, ' '));
    }

    _setAiMetadata (req, firstTag = null, aiHandled = false) {
        if (aiHandled && !req.aiHandled) {
            Object.assign(req, { aiHandled: true });
        }
        if (req.aiIntent) {
            // skip
        } else if (firstTag) {
            Object.assign(req, {
                aiIntent: firstTag.tag,
                aiIntentScore: firstTag.score,
                markAsHandled,
                aiHandled
            });
        } else if (typeof req.aiIntent === 'undefined') {
            Object.assign(req, {
                aiIntent: null,
                aiIntentScore: null,
                markAsHandled,
                aiHandled
            });
        }
    }

    _middlewareFactory (prefix, knownIntents, filterFn = null, postBackConfidence = null) {
        const acceptIntents = Array.isArray(knownIntents)
            ? knownIntents
            : Object.keys(knownIntents);

        const actionMap = Array.isArray(knownIntents)
            ? knownIntents.reduce((o, i) => Object.assign(o, { [i]: i }), {})
            : knownIntents;

        return (req, res, postBack) => {
            this._setAiMetadata(req);
            if (!req.isText()) {
                return Router.BREAK;
            }

            return this._queryModel(prefix, req)
                .then((tags) => {
                    this._setAiMetadata(req, tags[0]);
                    if (tags.length === 0) {
                        return Router.BREAK;
                    }

                    const firstTag = tags[0];

                    const useConfidence = postBackConfidence === true
                        ? this.confidence
                        : postBackConfidence;

                    if (postBackConfidence !== null
                            && acceptIntents.indexOf(firstTag.tag) !== -1
                            && firstTag.score >= useConfidence) {

                        this._setAiMetadata(req, tags[0], true);

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
                        ensures: this._createEnsuresMethod(
                            dropActions, matchedIntents, actionMap, req
                        )
                    });

                    return Router.CONTINUE;
                });
        };
    }

    _createEnsuresMethod (dropActions, matchedIntents, actionMap, req) {
        return function ensures (replies) {
            const ret = Object.assign({}, replies);

            dropActions.forEach((action) => {
                if (typeof ret[action] !== 'undefined') {
                    delete ret[action];
                }
            });

            matchedIntents.forEach((intent) => {
                const action = actionMap[intent.tag];
                let assign = null;

                if (typeof ret[action] === 'string') {
                    assign = {
                        title: ret[action]
                    };
                } else if (typeof ret[action] === 'object') {
                    assign = ret[action];
                }
                if (assign !== null) {
                    Object.assign(assign, {
                        _aiIntentMatched: intent.tag,
                        _aiTs: req.data.timestamp,
                        _aiFromText: req.text(),
                        _aiMeta: req.getMeta(req)
                    });
                    Object.assign(ret, { [action]: assign });
                }
            });

            return ret;
        };
    }

}

module.exports = Ai;
