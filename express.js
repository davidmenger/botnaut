/*
 * @author David Menger
 */
'use strict';

const mongoose = require('mongoose');
const { Router } = require('express');
const bodyParser = require('body-parser');
const { postMiddlewares, getVerifierMiddleware } = require('./src/expressHooks');
const Processor = require('./src/Processor');
const BotToken = require('./src/BotToken');
const State = require('./src/State');
const ChatLog = require('./src/ChatLog');


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
 * @param {ChatLog} [processorOptions.chatLog] - discussion logger
 * @param {BotToken} [processorOptions.tokenStorage] - storage for chabot tokens
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
 * @param {State} [stateStorage] - storage for states
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
    let state = stateStorage;

    if (state === null) {
        state = mongoose.model('State', State);
    }

    if (!processorOptions.tokenStorage) {
        const tokenStorage = mongoose.model('BotToken', BotToken);
        Object.assign(processorOptions, { tokenStorage });
    }

    if (!processorOptions.chatLog) {
        const chatLog = mongoose.model('ChatLog', ChatLog);
        Object.assign(processorOptions, { chatLog });
    }

    return new Processor(reducer, processorOptions, state);
}

/**
 * Create an express route for accepting messenger events
 *
 * @param {function|Router} reducer - Root router object or processor function
 * @param {string} verifyToken - chatbot application token
 * @param {Object} [log] - console.* like logger object
 */
function createRouter (processor, verifyToken, log = console) {
    const app = new Router();

    app.post('/', ...postMiddlewares(bodyParser, processor, log));

    app.get('/', getVerifierMiddleware(verifyToken));

    return app;
}

module.exports = {
    createProcessor,
    createRouter,
    State,
    BotToken,
    ChatLog
};
