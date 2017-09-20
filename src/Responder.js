/*
 * @author David Menger
 */
'use strict';

const ReceiptTemplate = require('./ReceiptTemplate');
const ButtonTemplate = require('./ButtonTemplate');
const GenericTemplate = require('./GenericTemplate');
const ListTemplate = require('./ListTemplate');
const { makeAbsolute } = require('./pathUtils');
const { makeQuickReplies } = require('./quickReplies');
const util = require('util');

/**
 * Instance of responder is passed as second parameter of handler (res)
 *
 * @class Responder
 */
class Responder {

    constructor (isRef, senderId, sendFn, token = null, options = {}) {
        this._send = sendFn;
        this._senderId = senderId;
        this._isRef = isRef;
        this.token = token;

        this.newState = {};

        this.path = '';
        this.routePath = '';

        this.options = {
            translator: w => w,
            appUrl: ''
        };

        Object.assign(this.options, options);
        if (this.options.autoTyping) {
            this.options.autoTyping = Object.assign({
                time: 450,
                perCharacters: 'Sample text Sample texts'.length,
                minTime: 400,
                maxTime: 1400
            }, this.options.autoTyping);
        }

        this._t = this.options.translator;
    }

    setPath (absolutePath, routePath = '') {
        this.path = absolutePath;
        this.routePath = routePath;
    }

    /**
     * Send text as a response
     *
     * @param {string} text text to send to user, can contain placeholders (%s)
     * @param {object.<string, string>} [quickReplys]
     * @returns {this}
     *
     * @example
     * res.text('Hello %s', name, {
     *     action: 'Quick reply',
     *     complexAction: {
     *         title: 'Another quick reply', // required
     *         match: 'string' || /regexp/, // optional
     *         someData: 'Will be included in payload data' // optional
     *     }
     * })
     *
     * @memberOf Responder
     */
    text (text, ...args) {
        const messageData = {
            recipient: {
                id: this._senderId
            },
            message: {
                text: null
            }
        };

        if (this._isRef) {
            messageData.recipient = { user_ref: this._senderId };
        }

        let replies = null;
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && args[args.length - 1] !== null) {
            replies = args.pop();
        }

        const translatedText = this._t(text);

        if (args.length > 0) {
            messageData.message.text = util.format(
                translatedText,
                // filter undefined and null values
                ...args.map(a => (a !== null && typeof a !== 'undefined' ? a : ''))
            );
        } else {
            messageData.message.text = translatedText;
        }

        if (replies) {
            const { quickReplies, expectedKeywords }
                = makeQuickReplies(replies, this.path, this._t);

            messageData.message.quick_replies = quickReplies;
            this.setState({ _expectedKeywords: expectedKeywords });
        }

        this._autoTypingIfEnabled(messageData.message.text);
        this._send(messageData);
        return this;
    }

    /**
     * Sets new attributes to state (with Object.assign())
     *
     * @param {object} object
     * @returns {this}
     *
     * @example
     * res.setState({ visited: true });
     *
     * @memberOf Responder
     */
    setState (object) {
        Object.assign(this.newState, object);
        return this;
    }

    /**
     * When user writes some text as reply, it will be processed as action
     *
     * @param {string} action desired action
     * @returns {this}
     *
     * @memberOf Responder
     */
    expected (action, data = {}) {
        if (!action) {
            return this.setState({ _expected: null });
        }
        return this.setState({
            _expected: {
                action: makeAbsolute(action, this.path),
                data
            }
        });
    }

    /**
     * Converts relative action to absolute action path
     *
     * @param {string} action relative action to covert to absolute
     * @returns {string} absolute action path
     */
    toAbsoluteAction (action) {
        return makeAbsolute(action, this.path);
    }

    /**
     * Sends image as response. Requires appUrl option to send images from server
     *
     * @param {string} imageUrl relative or absolute url
     * @returns {this}
     *
     * @example
     * // image on same server (appUrl option)
     * res.image('/img/foo.png');
     *
     * // image at url
     * res.image('https://google.com/img/foo.png');
     *
     * @memberOf Responder
     */
    image (imageUrl) {
        let url = imageUrl;

        if (!imageUrl.match(/^https?:\/\//)) {
            url = `${this.options.appUrl}${imageUrl}`;
        }

        const messageData = {
            recipient: {
                id: this._senderId
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

        if (this._isRef) {
            messageData.recipient = { user_ref: this._senderId };
        }

        this._autoTypingIfEnabled(null);
        this._send(messageData);
        return this;
    }

    template (payload) {
        const messageData = {
            recipient: {
                id: this._senderId
            },
            message: {
                attachment: {
                    type: 'template',
                    payload
                }
            }
        };

        if (this._isRef) {
            messageData.recipient = { user_ref: this._senderId };
        }

        this._autoTypingIfEnabled(null);
        this._send(messageData);
        return this;
    }

    /**
     * Sets delay between two responses
     *
     * @param {number} [ms=600]
     * @returns {this}
     *
     * @memberOf Responder
     */
    wait (ms = 600) {
        this._send({ wait: ms });
        return this;
    }

    /**
     * Sends "typing..." information
     *
     * @returns {this}
     *
     * @memberOf Responder
     */
    typingOn () {
        this._senderAction('typing_on');
        return this;
    }

    /**
     * Stops "typing..." information
     *
     * @returns {this}
     *
     * @memberOf Responder
     */
    typingOff () {
        this._senderAction('typing_off');
        return this;
    }

    /**
     * Reports last message from user as seen
     *
     * @returns {this}
     *
     * @memberOf Responder
     */
    seen () {
        this._senderAction('mark_seen');
        return this;
    }

    /**
     * Sends Receipt template
     *
     * @param {string} recipientName
     * @param {string} [paymentMethod='Cash'] should not contain more then 4 numbers
     * @param {string} [currency='USD'] sets right currency
     * @param {string} [uniqueCode=null] when omitted, will be generated randomly
     * @returns {ReceiptTemplate}
     *
     * @example
     * res.receipt('Name', 'Cash', 'CZK', '1')
     *     .addElement('Element name', 1, 2, '/inside.png', 'text')
     *     .send();
     *
     * @memberOf Responder
     */
    receipt (recipientName, paymentMethod = 'Cash', currency = 'USD', uniqueCode = null) {
        return new ReceiptTemplate(
            payload => this.template(payload),
            this._createContext(),
            recipientName,
            paymentMethod,
            currency,
            uniqueCode
        );
    }

    /**
     * Sends nice button template. It can redirect user to server with token in url
     *
     * @param {string} text
     * @returns {ButtonTemplate}
     *
     * @example
     * res.button('Hello')
     *     .postBackButton('Text', 'action')
     *     .urlButton('Url button', '/internal', true) // opens webview with token
     *     .urlButton('Other button', 'https://goo.gl') // opens in internal browser
     *     .send();
     *
     * @memberOf Responder
     */
    button (text) {
        const btn = new ButtonTemplate(
            payload => this.template(payload),
            this._createContext(),
            text
        );
        return btn;
    }

    /**
     * Creates a generic template
     *
     * @param {boolean} [shareable] - ability to share template
     * @param {boolean} [isSquare] - use square aspect ratio for images
     * @example
     * res.genericTemplate()
     *     .addElement('title', 'subtitle')
     *         .setElementImage('/local.png')
     *         .setElementUrl('https://www.seznam.cz')
     *         .postBackButton('Button title', 'action', { actionData: 1 })
     *     .addElement('another', 'subtitle')
     *         .setElementImage('https://goo.gl/image.png')
     *         .setElementAction('action', { actionData: 1 })
     *         .urlButton('Local link with extension', '/local/path', true, 'compact')
     *     .send();
     *
     * @returns {GenericTemplate}
     *
     * @memberOf Responder
     */
    genericTemplate (shareable = false, isSquare = false) {
        return new GenericTemplate(
            payload => this.template(payload),
            this._createContext(),
            shareable,
            isSquare
        );
    }

    /**
     * Creates a generic template
     *
     * @example
     * res.list('compact')
     *     .postBackButton('Main button', 'action', { actionData: 1 })
     *     .addElement('title', 'subtitle')
     *         .setElementImage('/local.png')
     *         .setElementUrl('https://www.seznam.cz')
     *         .postBackButton('Button title', 'action', { actionData: 1 })
     *     .addElement('another', 'subtitle')
     *         .setElementImage('https://goo.gl/image.png')
     *         .setElementAction('action', { actionData: 1 })
     *         .urlButton('Local link with extension', '/local/path', true, 'compact')
     *     .send();
     *
     * @param {'large'|'compact'} [topElementStyle='large']
     * @returns {ListTemplate}
     *
     * @memberOf Responder
     */
    list (topElementStyle = 'large') {
        return new ListTemplate(
            topElementStyle,
            payload => this.template(payload),
            this._createContext()
        );
    }

    _senderAction (action) {
        const messageData = {
            recipient: {
                id: this._senderId
            },
            sender_action: action
        };

        if (this._isRef) {
            messageData.recipient = { user_ref: this._senderId };
        }

        this._send(messageData);
        return this;
    }

    _createContext () {
        const { translator, appUrl } = this.options;
        return {
            translator,
            appUrl,
            token: this.token || '',
            senderId: this._senderId,
            path: this.path
        };
    }

    _autoTypingIfEnabled (text) {
        if (!this.options.autoTyping) {
            return;
        }
        const typingTime = this._getTypingTimeForText(text);
        this.typingOn().wait(typingTime);
    }

    _getTypingTimeForText (text) {

        const textLength = typeof text === 'string'
            ? text.length
            : this.options.autoTyping.perCharacters;

        const timePerCharacter = this.options.autoTyping.time
            / this.options.autoTyping.perCharacters;

        return Math.min(
            Math.max(
                textLength * timePerCharacter,
                this.options.autoTyping.minTime
            ),
            this.options.autoTyping.maxTime
        );
    }

}

module.exports = Responder;
