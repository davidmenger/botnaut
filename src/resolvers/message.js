/*
 * @author David Menger
 */
'use strict';

const Router = require('../Router');
const { customFn, getLanguageText, cachedTranslatedCompilator } = require('./utils');

function parseReplies (replies, linksMap) {
    return replies.map((reply) => {
        let { action } = reply;

        const replyData = Object.assign({}, reply);

        if (action) {
            delete replyData.action;
        } else {
            action = linksMap.get(reply.targetRouteId);
            delete replyData.targetRouteId;

            if (action === '/') {
                action = './';
            }
        }

        const condition = reply.hasCondition
            ? eval(reply.conditionFn) // eslint-disable-line no-eval
            : () => true;

        return Object.assign(replyData, {
            action,
            condition
        });
    });
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

        const stateData = Object.assign({}, req.state, res.state, res.data);
        const text = textTemplate(stateData);

        if (replies) {
            res.text(text, replies
                .filter(reply => reply.condition(req, res))
                .map(reply => Object.assign({}, reply, {
                    title: getLanguageText(reply.title, req.state.lang)
                })));
        } else {
            res.text(text);
        }

        return ret;
    };
}

module.exports = message;
