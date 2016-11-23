/*
 * @author David Menger
 */
'use strict';

const crypto = require('crypto');
const BotToken = require('./BotToken');

class SecurityMiddleware {

    /**
     * Creates an instance of SecurityMiddleware.
     *
     * @param {string} appSecret
     *
     * @memberOf SecurityMiddleware
     */
    constructor (appSecret) {
        this.appSecret = appSecret;
    }

    _getUnauthorizedError (message) {
        const err = new Error(`Unauthorized: ${message}`);
        err.code = 401;
        err.status = 401;
        return err;
    }

    _examineSender (body = {}) {
        let senderId = null;
        let examinedSenderId = null;

        body.entry.forEach((event) => {
            if (Array.isArray(event.messaging)) {
                event.messaging.forEach((message) => {
                    examinedSenderId = message && message.sender && message.sender.id;

                    if (!examinedSenderId) {
                        return;
                    }

                    if (senderId && senderId !== examinedSenderId) {
                        throw new Error('Different senders!');
                    } else if (!senderId) {
                        senderId = examinedSenderId;
                    }

                });
            }
        });

        return senderId;
    }

    getSignatureVerifier () {
        const appSecret = this.appSecret;
        const err = this._getUnauthorizedError;
        return function verifier (req, res, buf) {
            const signature = req.headers['x-hub-signature'];
            let verified = true;

            if (signature) {
                const elements = signature.split('=');
                const signatureHash = elements[1];
                const expectedHash = crypto
                                    .createHmac('sha1', appSecret)
                                    .update(buf)
                                    .digest('hex');

                verified = signatureHash === expectedHash;
            }

            if (!verified) {
                throw err("Couldn't validate the request signature.");
            }
        };
    }

    verifyReq (req) {
        const signature = req.headers['x-hub-signature'] || '';
        const match = signature.match(/^sha1=(.+)$/);

        if (match) {
            // previously verified by middleware getSignatureVerifier()
            return Promise.resolve();
        } else if (req.cookies.botToken) {

            // examine senderId
            const senderId = this._examineSender(req.body);

            if (!senderId) {
                throw this._getUnauthorizedError('No sender');
            }

            return BotToken.findOne({ token: req.cookies.botToken, senderId })
                .exec()
                .then((token) => {
                    if (!token) {
                        throw this._getUnauthorizedError('No token found');
                    }
                    return null;
                });
        }

        throw this._getUnauthorizedError('No authorization');
    }

    getOrCreateToken (senderId) {
        return BotToken.getOrCreateToken(senderId)
            .then(token => token.token);
    }

}

module.exports = SecurityMiddleware;
