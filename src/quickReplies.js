/*
 * @author David Menger
 */
'use strict';

const { makeAbsolute } = require('./pathUtils');
const { tokenize } = require('./tokenizer');

function makeExpectedKeyword (action, title, matcher = null) {
    let match = null;

    if (matcher instanceof RegExp) {
        match = matcher.toString().replace(/^\/|\/$/g, '');
    } else if (typeof matcher === 'string') {
        match = tokenize(matcher);
    } else {
        // make matcher from title
        match = tokenize(title);
    }

    return {
        action,
        match
    };
}

/**
 *
 *
 * @param {string[]|object[]} replies
 * @param {string} [path]
 * @param {function} [translate=w => w]
 * @returns { quickReplies: object[], expectedKeywords: object[] }
 */
function makeQuickReplies (replies, path = '', translate = w => w) {

    const expectedKeywords = [];
    const quickReplies = Object.keys(replies)
        .map((relativeAction) => {
            const value = replies[relativeAction];
            let title = value;
            let payload = relativeAction;
            const action = makeAbsolute(relativeAction, path);
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
                payload = JSON.stringify(payload);
            }

            title = translate(title);

            // add expectations
            expectedKeywords.push(makeExpectedKeyword(action, title, match));

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
 * @returns {null|string}
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

    return found[0].action;
}

module.exports = {
    makeQuickReplies,
    quickReplyAction
};
