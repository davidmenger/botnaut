/*
 * @author David Menger
 */
'use strict';

const generateToken = require('./generateToken');
const { makeAbsolute, actionMatches, parseActionPayload } = require('./pathUtils');
const { makeQuickReplies, quickReplyAction } = require('./quickReplies');
const { senderFactory, sender } = require('./senderFactory');
const { replaceDiacritics, tokenize } = require('./tokenizer');

module.exports = {
    replaceDiacritics,
    tokenize,
    senderFactory,
    sender,
    makeQuickReplies,
    quickReplyAction,
    makeAbsolute,
    actionMatches,
    parseActionPayload,
    generateToken
};
