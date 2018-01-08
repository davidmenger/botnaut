/*
 * @author David Menger
 */
'use strict';

const Router = require('../Router');

const DEFAULT = 'default';

const ACTION = '_callbackAction';
const CONTEXT = '_callbackContext';
const TEXT = '_callbackText';

function sustainCallback () {
    return (req, res) => {
        if (req.state[ACTION]) {
            res.setState({
                [ACTION]: req.state[ACTION],
                [CONTEXT]: req.state[CONTEXT],
                [TEXT]: req.state[TEXT]
            });
        }
        return Router.CONTINUE;
    };
}

/**
 * Creates callback middleware, which allows to get user back to previous context
 *
 * @returns {function}
 * @module callbackMiddleware
 * @example
 * const { Router, callbackMiddleware, ai } = require('botnaut');
 *
 * const bot = new Router();
 *
 * bot.use(callbackMiddleware());
 *
 * bot.use(['fooRoute', /^foo$/], (req, res) => {
 *     if (!req.isFromCallback()) {
 *         // is hidden, when user is just comming back
 *         res.text('This is your FOO response');
 *     }
 *     if (!req.hasCallback()) {
 *         res.setCallback('fooRoute');
 *     }
 *
 *     // ability get back to previous content
 *     res.addCallbackQuickReply('Go back');
 *
 *     res.text('So, what you want?', {
 *         barRoute: 'Go to bar'
 *     });
 *  })
 *
 *  bot.use(['barRoute', /^bar$/], (req, res) => {
 *     if (!req.isFromCallback()) {
 *         res.text('This is your BAR response');
 *     }
 *     if (!req.hasCallback()) {
 *         res.setCallback('barRoute');
 *     }
 *
 *     if (!res.proceedCallback()) {
 *         res.text('So, what\'s next?', {
 *             fooRoute: 'Go to foo'
 *         });
 *     }
 *  });
 */
function callbackMiddleware () {

    /**
     * Sets action, where to go back, when user responds with text
     *
     * @param {string} action - relative or absolute action (usualy current action)
     * @param {string|null} [callbackContext] - context of callback
     * @param {string|null} [callbackText] - custom text response
     * @returns {this}
     * @alias module:callbackMiddleware
     * @typicalname res
     * @example
     *
     * bot.use('myAction', (req, res) => {
     *     res.setCallback('myAction'); // return back
     * });
     */
    function setCallback (action, callbackContext = null, callbackText = null) {
        const callbackAction = this.toAbsoluteAction(action);

        this.setState({
            [ACTION]: callbackAction,
            [CONTEXT]: callbackContext || DEFAULT,
            [TEXT]: callbackText
        });

        return this;
    }

    /**
     * Returns true, when callback has been prevously set.
     * It's usefull, when you don't want to bouce back the methods.
     *
     * @param {string} [callbackContext]
     * @returns {boolean}
     * @alias module:callbackMiddleware
     * @example
     * bot.use(['fooRoute', /^foo$/], (req, res) => {
     *     // set callback, only when this request does not have one
     *     if (!req.hasCallback()) {
     *         res.setCallback('fooRoute');
     *     }
     * });
     */
    function hasCallback (callbackContext = null) {
        if (!this.state[ACTION]
            || callbackContext === this.state[CONTEXT]
            || !this.isText()) {

            return false;
        }
        return true;
    }

    /**
     * Returns true, when user is comming back from callback
     * Comeback is initialised with `res.proceedCallback()` or quick reply
     * Usefull for hidding the text, user has already seen
     *
     * @param {string} [callbackContext]
     * @returns {boolean}
     * @alias module:callbackMiddleware
     * @example
     * bot.use(['fooRoute', /^foo$/], (req, res) => {
     *     // set callback, only when this request does not have one
     *     if (!req.isFromCallback()) {
     *         res.text('this is the response, you dont want to read again');
     *     }
     * });
     */
    function isFromCallback (callbackContext = null) {
        const fromCallback = this.action(true)._isFromCallback;

        if (callbackContext === null) {
            return !!fromCallback;
        }
        return fromCallback === callbackContext;
    }

    /**
     * Proceed a callback, when exists
     * (go to action, where the callback has been previously set)
     * Returns true, when postback will occur
     *
     * @param {string} [callbackContext] - the context
     * @returns {boolean}
     * @alias module:callbackMiddleware
     * @example
     * bot.use(['fooRoute', /^foo$/], (req, res) => {
     *     // set callback, only when this request does not have one
     *     if (!res.proceedCallback()) {
     *         res.text('this is the followup question', {
     *             followupAction: 'Continue'
     *         });
     *     }
     * });
     */
    function proceedCallback (state, isText, rootPostBack) {

        return function (callbackContext = null) {
            if (!state[ACTION]
                || !isText
                || callbackContext === state[CONTEXT]
                || state[ACTION] === `${this.path === '/' ? '' : this.path}${this.routePath}`) {

                return false;
            }
            rootPostBack(state[ACTION], {
                _isFromCallback: state[CONTEXT]
            });
            return true;
        };
    }

    /**
     * Adds "back" quick reply to other replies
     * (alternative to `proceedCallback()`)
     *
     * @param {string} replyText - the default text
     * @returns {this}
     * @alias module:callbackMiddleware
     * @example
     * bot.use(['fooRoute', /^foo$/], (req, res) => {
     *     // ability get back to previous context
     *     res.addCallbackQuickReply('Go back');
     *
     *     res.text('So, what you want?', {
     *         barRoute: 'Go to bar'
     *     });
     * });
     */
    function addCallbackQuickReply (state, isText) {
        return function (replyText) {
            if (!state[ACTION]
                    || !isText
                    || state[ACTION] === `${this.path === '/' ? '' : this.path}${this.routePath}`) {
                return this;
            }

            const text = state[TEXT] || replyText;

            if (!text) {
                return this;
            }

            return this.addQuickReply(state[ACTION], text, {
                _isFromCallback: state[CONTEXT]
            }, true);
        };
    }


    return (req, res, postBack) => {

        const isText = req.isText();

        Object.assign(res, {
            addCallbackQuickReply: addCallbackQuickReply(req.state, isText),
            proceedCallback: proceedCallback(req.state, isText, postBack),
            setCallback
        });

        Object.assign(req, {
            isFromCallback,
            hasCallback
        });

        if (req.state[ACTION]) {
            res.setState({
                [ACTION]: null,
                [CONTEXT]: null,
                [TEXT]: null
            });
        }

        return Router.CONTINUE;
    };
}

module.exports = {
    callbackMiddleware,
    sustainCallback
};
