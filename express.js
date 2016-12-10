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

function createRouter (processor, botToken, log = console) {
    const app = new Router();

    app.post('/', ...postMiddlewares(bodyParser, processor, log));

    app.get('/', getVerifierMiddleware(botToken));

    return app;
}

module.exports = {
    createProcessor,
    createRouter
};
