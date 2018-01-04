/*
 * @author David Menger
 */
'use strict';

const Hook = require('./src/Hook');
const Processor = require('./src/Processor');
const Router = require('./src/Router');
const Request = require('./src/Request');
const SecurityMiddleware = require('./src/SecurityMiddleware');
const ReducerWrapper = require('./src/ReducerWrapper');
const Tester = require('./src/Tester');
const responderFactory = require('./src/responderFactory');
const Ai = require('./src/Ai');
const { asserts } = require('./src/testTools');
const BuildRouter = require('./src/BuildRouter');
const Blocks = require('./src/Blocks');
const facebook = require('./src/connectors/facebook');
const { callbackMiddleware, sustainCallback } = require('./src/middlewares/callback');

const {
    bufferloader,
    Settings,
    senderFactory,
    sender,
    returnSenderFactory,
    MemoryStateStorage,
    Translate,
    UserLoader
} = require('./src/tools');

module.exports = {
    // basic functionality
    Hook,
    Processor,
    Router,
    Request,
    ReducerWrapper,
    senderFactory,
    sender,
    UserLoader,
    responderFactory,

    // utilities
    Tester,
    bufferloader,
    asserts,
    MemoryStateStorage,
    Translate,
    returnSenderFactory,

    // Wingbot
    ai: Ai.ai,
    Blocks,
    BuildRouter,

    // setup tools
    SecurityMiddleware,
    Settings,

    // connectors
    facebook,

    // middlewares
    callbackMiddleware,
    sustainCallback
};
