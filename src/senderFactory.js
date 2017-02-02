/*
 * @author David Menger
 */
'use strict';

const request = require('request-promise');

const RES_HANDLER = (res, nextData) => nextData;

function wait (ms) {
    return new Promise(res => setTimeout(res, ms));
}

function sender (data, token) {
    return request({
        uri: 'https://graph.facebook.com/v2.8/me/messages',
        qs: { access_token: token },
        method: 'POST',
        body: data,
        json: true
    });
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

function senderFactory (token, logger = console, senderFn = sender) {
    const factoryFn = function factory (incommingMessage, pageId, handler = RES_HANDLER) {
        const queue = [];
        let working = false;

        return function send (payload) {
            if (working) {
                // store in queue
                queue.push(payload);
            } else {
                working = true;
                const sent = [];
                sendData(senderFn, token, payload, queue, sent, handler)
                    .then(() => {
                        working = false;
                        logger.log(sent, incommingMessage);
                    })
                    .catch((e) => {
                        logger.error(e, sent, incommingMessage);
                    });
            }
        };
    };

    return factoryFn;
}

module.exports = {
    senderFactory,
    sender
};
