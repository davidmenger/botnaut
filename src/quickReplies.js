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
 * @param {string[]|object[]} replies
 * @param {string} [path]
 * @param {function} [translate=w => w]
 * @returns {{ quickReplies: object[], expectedKeywords: object[] }}
 */
function makeQuickReplies (replies, path = '', translate = w => w) {

    const expectedKeywords = [];
    const quickReplies = Object.keys(replies)
        .map((relativeAction) => {
            const value = replies[relativeAction];
            let title = value;
            let payloadData = null;
            const action = makeAbsolute(relativeAction, path);
            let payload = action;
            let match;

            if (typeof value === 'object') {
                title = value.title;
                match = value.match;

                payload = {
                    action,
                    data: Object.assign({}, value)
                };
                delete payload.data.title;
                delete payload.data.match;
                payloadData = payload.data;
                payload = JSON.stringify(payload);
            }

            title = translate(title);

            expectedKeywords.push(makeExpectedKeyword(action, title, match, payloadData));

            return {
                content_type: 'text',
                title,
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
