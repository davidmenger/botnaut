/*
 * @author David Menger
 */
'use strict';

const ReceiptTemplate = require('./ReceiptTemplate');
const ButtonTemplate = require('./ButtonTemplate');
const util = require('util');

class Responder {

    constructor (senderId, sendFn, appUrl = null, token = null, translator = w => w) {
        this._send = sendFn;
        this.senderId = senderId;
        this.appUrl = appUrl;
        this.translator = translator;
        this.token = token;
        this.newState = {};
    }

    text (text, ...args) {
        const messageData = {
            recipient: {
                id: this.senderId
            },
            message: {
                text: null
            }
        };

        let replies = null;
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && args[args.length - 1] !== null) {
            replies = args.pop();
        }

        const translatedText = this.translator(text);

        if (args.length > 0) {
            messageData.message.text = util.format(translatedText, ...args);
        } else {
            messageData.message.text = translatedText;
        }

        if (replies) {
            messageData.message.quick_replies = Object.keys(replies)
                .map((action) => {
                    const value = replies[action];
                    let title = value;
                    let payload = action;

                    if (typeof value === 'object') {
                        title = value.title;
                        payload = {
                            action,
                            data: Object.assign({}, value)
                        };
                        delete payload.data.title;
                        payload = JSON.stringify(payload);
                    }

                    return {
                        content_type: 'text',
                        title: this.translator(title),
                        payload
                    };
                });
        }

        this._send(messageData);
        return this;
    }

    setState (object) {
        Object.assign(this.newState, object);
        return this;
    }

    image (imageUrl) {
        let url = imageUrl;

        if (!imageUrl.match(/^https?:\/\//)) {
            url = `${this.appUrl}${imageUrl}`;
        }

        const messageData = {
            recipient: {
                id: this.senderId
            },
            message: {
                attachment: {
                    type: 'image',
                    payload: {
                        url
                    }
                }
            }
        };
        this._send(messageData);
        return this;
    }

    template (payload) {
        const messageData = {
            recipient: {
                id: this.senderId
            },
            message: {
                attachment: {
                    type: 'template',
                    payload
                }
            }
        };

        this._send(messageData);
        return this;
    }

    receipt (recipientName, paymentMethod = 'Cash', currency = 'USD', uniqueCode = null) {
        return new ReceiptTemplate(
            payload => this.template(payload),
            this._createContext(),
            this.translator,
            recipientName,
            paymentMethod,
            currency,
            uniqueCode
        );
    }

    button (text) {
        const btn = new ButtonTemplate(
            payload => this.template(payload),
            this._createContext(),
            this.translator,
            text
        );
        return btn;
    }

    wait (ms = 700) {
        this._send({ wait: ms });
        return this;
    }

    typingOn () {
        this._senderAction('typing_on');
        return this;
    }

    typingOff () {
        this._senderAction('typing_off');
        return this;
    }

    seen () {
        this._senderAction('mark_seen');
        return this;
    }

    _senderAction (action) {
        const messageData = {
            recipient: {
                id: this.senderId
            },
            sender_action: action
        };

        this._send(messageData);
        return this;
    }

    _createContext () {
        return {
            appUrl: this.appUrl,
            token: this.token,
            senderId: this.senderId
        };
    }
}

module.exports = Responder;
