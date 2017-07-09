/*
 * @author David Menger
 */
'use strict';

const Processor = require('./src/Processor');
const DynamoBotToken = require('./src/DynamoBotToken');
const DynamoState = require('./src/DynamoState');
const DynamoChatLog = require('./src/DynamoChatLog');
const serverlessHook = require('./src/serverlessHook');


/**
 * Create a chat event processor
 *
 * @param {function|Router} reducer - Root router object or processor function
 * @param {Object} processorOptions - settings for message processing
 * @param {string} [processorOptions.pageToken] - page token
 * @param {string} [processorOptions.appSecret] - bot application secret
 * @param {string} [processorOptions.appUrl] - where the bot application is deployed
 * @param {number} [processorOptions.timeout] - how long the state will be locked for single event
 * @param {Object} [processorOptions.log] - console.log/error/warn like object
 * @param {Object} [processorOptions.defaultState] - default conversation state
 * @param {DynamoChatLog} [processorOptions.chatLog] - discussion logger
 * @param {DynamoBotToken} [processorOptions.tokenStorage] - storage for chabot tokens
 * @param {Function} [processorOptions.senderFnFactory] - override default sender function
 * @param {Function} [processorOptions.securityMiddleware] - override webview calls authorizer
 * @param {string} [processorOptions.cookieName] - webview cookie (for default securityMiddleware)
 * @param {boolean} [processorOptions.loadUsers] - set false to not load user profiles
 * @param {Object} [processorOptions.userLoader] - override default user loader
 * @param {Function} [processorOptions.onSenderError] - override default sender error reporter
 * @param {Object|boolean} [processorOptions.autoTyping] - enable auto typing
 * @param {number} [processorOptions.autoTyping.time] - default typing time
 * @param {number} [processorOptions.autoTyping.perCharacters] - typing time per character
 * @param {number} [processorOptions.autoTyping.minTime] - auto typing lower threshold
 * @param {number} [processorOptions.autoTyping.maxTime] - auto typing upper threshold
 * @param {{ tablePrefix?: string }} [processorOptions.dynamo] - dynamo database options
 * @param {DynamoState} [stateStorage] - storage for states
 * @example
 * const express = require('express');
 * const bodyParser = require('body-parser');
 * const { createRouter, createProcessor } = require('botnaut/express');
 *
 * const handler = (req, res, postBack) => {
 *     res.typingOn()
 *         .wait();
 *
 *     switch (req.action()) {
 *         case 'hello':
 *             res.text('Hello world');
 *             return;
 *         default:
 *             // send one quick reply
 *             res.text('What you want?', {
 *                 hello: 'Say hello world'
 *             })
 *     }
 * };
 *
 * const processor = createProcessor(handler, {
 *     pageToken: 'stringhere',
 *     appSecret: 'botappsecret'
 * });
 *
 * app = express();
 *
 * app.use('/bot', createRouter(processor));
 *
 * app.listen(3000);
 */
function createProcessor (reducer, processorOptions, stateStorage = null) {

    const { tablePrefix, db } = processorOptions.dynamo;

    let state = stateStorage;
    if (state === null) {
        state = new DynamoState(db, `${tablePrefix || ''}states`);
    }

    if (!processorOptions.tokenStorage) {
        const tokenStorage = new DynamoBotToken(db, `${tablePrefix || ''}bottokens`);
        Object.assign(processorOptions, { tokenStorage });
    }

    if (!processorOptions.chatLog) {
        const chatLog = new DynamoChatLog(db, `${tablePrefix || ''}chatlog`);
        Object.assign(processorOptions, { chatLog });
    }

    return new Processor(reducer, processorOptions, state);
}

/**
 * Create an serverless handler for accepting messenger events
 *
 * @param {function|Router} processor - Root router object or processor function
 * @param {string} verifyToken - chatbot application token
 * @param {Object} [log] - console.* like logger object
 */
function createHandler (processor, verifyToken, log = console) {
    return serverlessHook(processor, verifyToken, log);
}

module.exports = {
    createProcessor,
    createHandler,
    State: DynamoState,
    BotToken: DynamoBotToken,
    ChatLog: DynamoChatLog
};
