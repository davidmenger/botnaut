/*
 * @author David Menger
 */
'use strict';

const { makeAbsolute } = require('./pathUtils');
const { tokenize } = require('./tokenizer');

function makeExpectedKeyword (action, title, matcher = null, payloadData = {}) {
    let match = null;

    if (matcher instanceof RegExp) {
        match = matcher.toString().replace(/^\/|\/$/g, '');
    } else if (typeof matcher === 'string') {
        match = `^${tokenize(matcher)}$`;
    } else {
        // make matcher from title
        match = `^${tokenize(title)}$`;
    }

    return {
        action,
        match,
        data: payloadData
    };
}

/**
 *
 *
 * @param {object|object[]} replies
 * @param {string} [path]
 * @param {function} [translate=w => w]
 * @param {Object[]} [quickReplyCollector]
 * @returns {{ quickReplies: object[], expectedKeywords: object[] }}
 */
function makeQuickReplies (replies, path = '', translate = w => w, quickReplyCollector = []) {

    const expectedKeywords = [];

    let iterate = replies;

    if (!Array.isArray(iterate)) {
        iterate = Object.keys(replies)
            .map((action) => {
                const value = replies[action];

                if (typeof value === 'object') {
                    return Object.assign({}, value, { action });
                }

                return { title: value, action };
            });
    }

    let unshift = 0;
    quickReplyCollector.forEach((reply) => {
        if (reply._prepend) {
            delete reply._prepend; // eslint-disable-line no-param-reassign
            iterate.splice(unshift++, 0, reply);
        } else {
            iterate.push(reply);
        }
    });

    const quickReplies = iterate
        .map((reply) => {
            const { title, action, match } = reply;
            const absoluteAction = makeAbsolute(action, path);

            let payload = absoluteAction;
            const data = Object.assign({}, reply);

            delete data.title;
            delete data.action;
            delete data.match;

            if (Object.keys(data).length > 0) {
                payload = {
                    action: absoluteAction,
                    data
                };
                payload = JSON.stringify(payload);
            }

            const translatedTitle = translate(title);
            const expect = makeExpectedKeyword(absoluteAction, translatedTitle, match, data);
            expectedKeywords.push(expect);

            return {
                content_type: 'text',
                title: translatedTitle,
                payload
            };
        });

    return { quickReplies, expectedKeywords };
}

/**
 *
 *
 * @param {object[]} expectedKeywords
 * @param {string} normalizedText
 * @returns {null|object}
 */
function quickReplyAction (expectedKeywords, normalizedText) {
    if (!normalizedText) {
        return null;
    }
    const found = expectedKeywords
        .filter(keyword => normalizedText.match(new RegExp(keyword.match)));

    if (found.length !== 1) {
        return null;
    }

    return found[0] || null;
}

module.exports = {
    makeQuickReplies,
    quickReplyAction
};
