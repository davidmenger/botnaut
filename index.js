/*
 * @author David Menger
 */
'use strict';

const Hook = require('./src/Hook');
const Processor = require('./src/Processor');
const Router = require('./src/Router');
const SecurityMiddleware = require('./src/SecurityMiddleware');
const bufferloader = require('./src/bufferloader');
const ChatLog = require('./src/ChatLog');
const ReducerWrapper = require('./src/ReducerWrapper');
const Tester = require('./src/Tester');
const Settings = require('./src/Settings');
const State = require('./src/Settings');
const BotToken = require('./src/BotToken');
const senderFactory = require('./src/senderFactory');

module.exports = {
    // basic functionality
    Hook,
    Processor,
    Router,
    ReducerWrapper,
    senderFactory,

    // utilities
    Tester,
    bufferloader,

    // setup tools
    SecurityMiddleware,
    Settings,

    // entities
    BotToken,
    ChatLog,
    State
};
