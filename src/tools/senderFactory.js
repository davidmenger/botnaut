/*
 * @author David Menger
 */
'use strict';

const request = require('request-promise-native');

const RES_HANDLER = (res, nextData) => nextData;
const DEFAULT_URI = 'https://graph.facebook.com/v2.8/me/messages';

function wait (ms) {
    return new Promise(res => setTimeout(res, ms));
}

function createDefaultSender (uri = DEFAULT_URI) {
    return function (data, token) {
        return request({
            uri,
            qs: { access_token: token },
            method: 'POST',
            body: data,
            json: true
        });
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

function senderFactory (token, logger = console, onSenderError = () => {}, sender = null) {
    let senderFn;

    if (typeof sender === 'string') {
        senderFn = createDefaultSender(sender);
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
            const responses = [];

            const handlerOverride = (res, nextData) => {
                if (res !== null) {
                    responses.push(res);
                }
                return handler(res, nextData);
            };

            promise = sendData(senderFn, token, payload, queue, sent, handlerOverride)
                .then(() => {
                    working = false;
                    logger.log(userId, sent, incommingMessage);
                    return { status: 200, responses };
                })
                .catch((e) => {
                    // detect disconnected users
                    const err = getDisconnectedError(e);

                    if (onSenderError(err || e, incommingMessage) !== true) {
                        logger.error(e, userId, sent, incommingMessage);
                    }

                    return { status: err ? 403 : 500, responses };
                });
            return promise;
        };
    };

    return factoryFn;
}

module.exports = {
    senderFactory,
    sender: createDefaultSender()
};
