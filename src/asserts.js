/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const { actionMatches, parseActionPayload } = require('./pathUtils');

/**
 * Format message
 *
 * @private
 * @param {any} text
 * @param {any} [actual=null]
 * @param {any} [expected=null]
 * @returns {string}
 */
function m (text, actual = null, expected = null) {
    if (text === false) {
        return '';
    }
    let result = '';
    if (expected !== null) {
        result = `. Expected: "${expected}", received: ${actual}`;
    } else if (actual !== null) {
        result = `. ${actual}`;
    }
    return `${text}${result}`;
}

function getText (response) {
    return response && response.message && response.message.text;
}

function getQuickReplies (response) {
    return (response.message && response.message.quick_replies) || [];
}

function getAttachment (response) {
    return response.message && response.message.attachment;
}

/**
 * Checks attachment type
 *
 * @param {object} response
 * @param {string} type
 * @param {string|false} [message='Attachment type does not match'] use false for no asserts
 * @returns {boolean}
 */
function attachmentType (response, type, message = 'Attachment type does not match') {
    const attachment = getAttachment(response);
    if (message === false && !attachment) {
        return false;
    }
    assert.ok(attachment, m(message, 'there is no attachment'));
    const matches = attachment.type === type;
    if (message === false) {
        return matches;
    }
    assert.ok(matches, m(message, attachment.type, type));
    return true;
}

/**
 * Checks, that response is a text
 *
 * @param {object} response
 * @param {string|false} [message='Should be a text'] use false for no asserts
 * @returns {boolean}
 */
function isText (response, message = 'Should be a text') {
    const is = typeof getText(response) === 'string' && !response.message.quick_reply;
    if (message === false) {
        return is;
    }
    assert(is, message);
    return true;
}

/**
 * Checks, that text contain a message
 *
 * @param {object} response
 * @param {string} search
 * @param {string|false} [message='Should contain a text'] use false for no asserts
 * @returns {boolean}
 */
function contains (response, search, message = 'Should contain a text') {
    const text = getText(response);
    const typeIsText = typeof text === 'string';
    if (message === false && !typeIsText) {
        return false;
    }
    assert.ok(typeIsText, m(message, search, 'not a message'));
    let match = false;
    if (search instanceof RegExp) {
        match = text.match(search);
    } else {
        match = text.toLowerCase().match(search.toLowerCase());
    }
    if (message === false) {
        return match;
    }
    assert.ok(match, m(message, text, search));
    return true;
}

/**
 * Checks quick response action
 *
 * @param {object} response
 * @param {string} action
 * @param {string|false} [message='Should contain the action'] use false for no asserts
 * @returns {boolean}
 */
function quickReplyAction (response, action, message = 'Should contain the action') {
    const replies = getQuickReplies(response);
    const hasItems = replies.length > 0;
    if (message === false && !hasItems) {
        return false;
    }
    assert.ok(hasItems, m(message, action, 'Theres no quick response'));
    const has = replies.some((reply) => {
        const { action: route } = parseActionPayload(reply);
        return actionMatches(route, action);
    });
    if (message === false) {
        return has;
    }
    assert.ok(has, m(message, action));
    return true;
}

/**
 * Checks template type
 *
 * @param {object} response
 * @param {string} expectedType
 * @param {string|false} [message='Template type does not match'] use false for no asserts
 * @returns {boolean}
 */
function templateType (response, expectedType, message = 'Template type does not match') {
    if (message === false && !attachmentType(response, 'template', message)) {
        return false;
    }
    const attachment = getAttachment(response);
    const actualType = attachment.payload && attachment.payload.template_type;
    const typeMatches = actualType === expectedType;
    if (message === false) {
        return typeMatches;
    }
    assert.ok(typeMatches, m(message, actualType, expectedType));
    return true;
}

/**
 * Looks for waiting message
 *
 * @param {object} response
 * @param {string|false} [message='Should be waiting placeholder'] use false for no asserts
 * @returns {boolean}
 */
function waiting (response, message = 'Should be waiting placeholder') {
    const is = typeof response.wait === 'number';
    if (message === false) {
        return is;
    }
    assert.ok(is, m(message, 'Not a waiting response'));
    return true;
}

module.exports = {
    contains,
    isText,
    quickReplyAction,
    templateType,
    attachmentType,
    waiting,
    getQuickReplies
};
