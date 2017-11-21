/*
 * @author Vašek Strnad
 */
'use strict';

const Responder = require('./Responder');
const { senderFactory } = require('./tools');

function responderFactory (options = { token: null }, senderLogger = console, sender = undefined) {

    const senderFnFactory = senderFactory(
        options.token,
        senderLogger,
        undefined,
        sender
    );

    const factoryFn = function factory (
        senderId,
        senderFn = null,
        pageId = undefined,
        senderHandler = undefined) {

        const sendFn = senderFn || senderFnFactory(null, pageId, senderHandler);
        return new Responder(false, senderId, sendFn, options.token, options);
    };

    return factoryFn;
}

module.exports = responderFactory;
