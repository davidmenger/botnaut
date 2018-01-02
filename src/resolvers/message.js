/*
 * @author David Menger
 */
'use strict';

const Router = require('../Router');
const { customFn, getLanguageText } = require('./utils');

let handlebars;
try {
    handlebars = module.require('handlebars');
} catch (er) {
    handlebars = { compile: text => () => text };
}

function parseReplies (replies, linksMap) {
    return replies.map((reply) => {
        let { action } = reply;

        const replyData = Object.assign({}, reply);

        if (action) {
            delete replyData.action;
        } else {
            action = linksMap.get(reply.targetRouteId);
            delete replyData.targetRouteId;
        }

        return Object.assign(replyData, { action });
    });
}

function cachedTranslatedCompilator (text) {
    const cache = new Map();

    return (state) => {
        const { lang: key = '-', lang } = state;
        let renderer = cache.get(key);
        if (!renderer) {
            renderer = handlebars.compile(getLanguageText(text, lang));
            cache.set(key, renderer);
        }
        return renderer(state);
    };
}

function message (params, { isLastIndex, linksMap }) {
    if (typeof params.text !== 'string' && !Array.isArray(params.text)) {
        throw new Error('Message should be a text!');
    }

    const textTemplate = cachedTranslatedCompilator(params.text);

    let replies = null;

    if (params.replies && !Array.isArray(params.replies)) {
        throw new Error('Replies should be an array');
    } else if (params.replies.length > 0) {
        replies = parseReplies(params.replies, linksMap);
    }

    let condition = null;

    if (params.hasCondition) {
        condition = customFn(params.conditionFn);
    }

    const ret = isLastIndex ? Router.END : Router.CONTINUE;

    return (req, res) => {
        if (condition !== null && !condition(req, res)) {
            return ret;
        }

        const text = textTemplate(req.state);

        if (replies) {
            res.text(text, replies.map(reply => Object.assign({}, reply, {
                title: getLanguageText(reply.title, req.state.lang)
            })));
        } else {
            res.text(text);
        }

        return ret;
    };
}

module.exports = message;
