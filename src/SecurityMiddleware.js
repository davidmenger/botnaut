/*
 * @author David Menger
 */
'use strict';

const crypto = require('crypto');

class SecurityMiddleware {

    /**
     * Creates an instance of SecurityMiddleware.
     *
     * @param {string} appSecret
     * @param {{getOrCreateToken:function, findByToken:function}} [tokenStorage] for webview tokens
     * @param {string} [cookieName] name of the cookie, where the token is stored
     *
     * @memberOf SecurityMiddleware
     */
    constructor (appSecret, tokenStorage = null, cookieName = 'botToken') {
        this.appSecret = appSecret;
        this.tokenStorage = tokenStorage;
        this.cookieName = cookieName;
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
                        throw this._getUnauthorizedError('Different senders!');
                    } else if (!senderId) {
                        senderId = examinedSenderId;
                    }

                });
            }
        });

        return senderId;
    }

    /**
     * @param {Buffer|string} body
     * @param {string} [signature]
     */
    verifySignature (body, signature) {

        if (!signature) {
            return;
        }

        const elements = signature.split('=');
        const signatureHash = elements[1];
        const expectedHash = crypto
            .createHmac('sha1', this.appSecret)
            .update(body)
            .digest('hex');

        if (signatureHash !== expectedHash) {
            throw this._getUnauthorizedError("Couldn't validate the request signature.");
        }
    }

    /**
     * Utility, which verifies presence of frontend token
     *
     * - the tokenstorage should be included
     *
     * @param {object} req express request
     * @returns Promise.<string>
     *
     * @memberOf SecurityMiddleware
     */
    verifyReq (req) {
        const signature = req.headers['x-hub-signature'] || '';
        const match = signature.match(/^sha1=(.+)$/);

        if (match) {
            // previously verified by middleware getSignatureVerifier()
            return Promise.resolve(null);
        } else if (this.tokenStorage && req.cookies && req.cookies[this.cookieName]) {

            // examine senderId
            let senderId;
            try {
                senderId = this._examineSender(req.body);
            } catch (e) {
                return Promise.reject(e);
            }

            if (!senderId) {
                return Promise.reject(this._getUnauthorizedError('No sender'));
            }

            return this.tokenStorage.findByToken(req.cookies[this.cookieName], senderId)
                .then((token) => {
                    if (!token) {
                        throw this._getUnauthorizedError('No token found');
                    }
                    return token;
                });
        }

        return Promise.reject(this._getUnauthorizedError('No authorization'));
    }

    /**
     * Fetch token for user to be used as cookie
     *
     * @param {string} senderId
     * @returns Promise.<string|null>
     *
     * @memberOf SecurityMiddleware
     */
    getOrCreateToken (senderId) {
        if (!this.tokenStorage) {
            return Promise.resolve(null);
        }

        return this.tokenStorage.getOrCreateToken(senderId)
            .then(token => token.token);
    }

}

module.exports = SecurityMiddleware;
