/*
 * @author David Menger
 */
'use strict';

const Router = require('../Router');
const { customFn } = require('./utils');

let handlebars;
try {
    handlebars = module.require('handlebars');
} catch (er) {
    handlebars = null;
}

function parseReplies (replies, linksMap) {
    return replies.reduce((obj, reply) => {
        let action = reply.action;

        const replyData = Object.assign({}, reply);

        if (action) {
            delete replyData.action;
        } else {
            action = linksMap.get(reply.targetRouteId);
            delete replyData.targetRouteId;
        }

        Object.assign(obj, {
            [action]: replyData
        });

        return obj;
    }, {});
}

function message (params, { isLastIndex, linksMap }) {
    if (typeof params.text !== 'string') {
        throw new Error('Message should be a text!');
    }

    const textTemplate = handlebars
        ? handlebars.compile(params.text)
        : () => params.text;

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
            res.text(text, replies);
        } else {
            res.text(text);
        }

        return ret;
    };
}

module.exports = message;
