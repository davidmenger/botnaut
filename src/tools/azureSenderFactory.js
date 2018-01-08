/*
 * @author Juraj Hríb
 */
'use strict';

const request = require('request-promise-native');

const RES_HANDLER = (incomming, res, nextData) =>
    nextData && Object.assign(nextData, { meta: incomming.meta });

function wait (ms) {
    return new Promise(res => setTimeout(res, ms));
}

function createDefaultSender () {
    return function (data) {
        const payload = {
            uri: `${data.meta.serviceUrl}'v3/conversations/'${data.meta.conversation.id}'/activities/'${data.meta.replyToId || data.meta.id}`,
            headers: {
                Authorization: `Bearer ${data.meta.absToken}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: {
                text: data.message.text,
                type: 'message',
                from: data.meta.recipient,
                conversation: data.meta.conversation,
                recipient: data.meta.from,
                replyToId: data.meta.id,
                locale: data.meta.locale
            },
            json: true
        };
        return request(payload);
    };
}

function sendData (senderFn, token, data, queue, sent = [], handler = RES_HANDLER, res = null) {
    const next = handler(res, data);

    if (!next) {
        return sent;
    }

    let promise;
    if (next.wait) {
        promise = wait(next.wait);
    } else {
        sent.push(next);
        promise = senderFn(next, token);
    }
    return promise
        .then(result =>
            sendData(senderFn, token, queue.shift(), queue, sent, handler, result));
}

function getDisconnectedError (e) {
    if (!e.response || !e.response.body || !e.response.body.error) {
        return null;
    }
    if (e.response.statusCode !== 403 || e.response.body.error.code !== 200) {
        return null;
    }
    const err = new Error(e.response.body.error.message);
    err.code = 403;
    return err;
}

/**
 * Create an azure sender factory for responding to Azure Bot service
 *
 * @param {string} token - app token (not necessary right now, we can probably remove it)
 * @param {object} [logger] - console.* like logger object
 * @param {function} [onSenderError] - override default sender error logger
 * @param {function} [sender] - override default sender function
 */
function azureSenderFactory (token, logger = console, onSenderError = () => {}, sender = null) {
    let senderFn;

    if (typeof sender === 'string') {
        senderFn = createDefaultSender();
    } else if (typeof sender === 'function') {
        senderFn = sender;
    } else {
        senderFn = createDefaultSender();
    }

    const factoryFn = function factory (userId, incommingMessage, pageId, handler = RES_HANDLER) {
        const queue = [];
        let promise = null;
        let working = false;

        return function send (payload = null) {
            if (payload === null) {
                return promise;
            }
            if (working) {
                // store in queue
                queue.push(payload);
                return promise;
            }
            working = true;
            const sent = [];
            promise = sendData(senderFn, token, payload, queue, sent, (res, data) =>
                handler(incommingMessage, res, data))
                .then(() => {
                    working = false;
                    logger.log(userId, sent, incommingMessage);
                })
                .catch((e) => {
                    // detect disconnected users
                    const err = getDisconnectedError(e);

                    if (onSenderError(err || e, incommingMessage) !== true) {
                        logger.error(e, userId, sent, incommingMessage);
                    }
                });
            return promise;
        };
    };

    return factoryFn;
}

module.exports = {
    azureSenderFactory,
    azureSender: createDefaultSender()
};
