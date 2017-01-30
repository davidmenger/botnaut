/*
 * @author David Menger
 */
'use strict';

const Hook = require('./src/Hook');
const Processor = require('./src/Processor');
const Router = require('./src/Router');
const Request = require('./src/Request');
const SecurityMiddleware = require('./src/SecurityMiddleware');
const bufferloader = require('./src/bufferloader');
const ReducerWrapper = require('./src/ReducerWrapper');
const Tester = require('./src/Tester');
const Settings = require('./src/Settings');
const { senderFactory, sender } = require('./src/senderFactory');
const asserts = require('./src/asserts');
const UserLoader = require('./src/UserLoader');

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

    // utilities
    Tester,
    bufferloader,
    asserts,

    // setup tools
    SecurityMiddleware,
    Settings
};
