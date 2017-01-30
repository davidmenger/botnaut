/*
 * @author David Menger
 */
'use strict';

const request = require('request-promise');

function wait (ms) {
    return new Promise(res => setTimeout(res, ms));
}

function sendData (token, data, queue, sent = []) {
    let promise;
    if (data.wait) {
        promise = wait(data.wait);
    } else {
        sent.push(data);
        promise = request({
            uri: 'https://graph.facebook.com/v2.8/me/messages',
            qs: { access_token: token },
            method: 'POST',
            json: data
        });
    }
    return promise
        .then(() => {
            const next = queue.shift();

            if (!next) {
                return sent;
            }

            return sendData(token, next, queue, sent);
        });
}

function senderFactory (token, logger = console) {
    const factoryFn = function factory (incommingMessage) {
        const queue = [];
        let working = false;

        return function send (payload) {
            if (working) {
                // store in queue
                queue.push(payload);
            } else {
                working = true;
                const sent = [];
                sendData(token, payload, queue, sent)
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

module.exports = senderFactory;
