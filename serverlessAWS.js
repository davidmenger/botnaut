/*
 * @author David Menger
 */
'use strict';

const Processor = require('./src/Processor');
const { DynamoBotToken, DynamoState, DynamoChatLog } = require('./src/dynamodb');
const {
    createValidator,
    createHandler,
    createUpdater
} = require('./src/serverlessHook');

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
 * @param {Object} [processorOptions.dynamo] - dynamodb configuration
 * @param {AWS.DynamoDB} [processorOptions.dynamo.db] - dynamodb db object
 * @param {string} [processorOptions.dynamo.tablePrefix] - dynamodb table prefix
 * @param {DynamoState} [stateStorage] - storage for states
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

module.exports = {
    createProcessor,
    createHandler,
    createValidator,
    createUpdater,
    State: DynamoState,
    BotToken: DynamoBotToken,
    ChatLog: DynamoChatLog
};
