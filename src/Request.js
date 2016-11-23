/*
 * @author David Menger
 */
'use strict';

const { tokenize } = require('./tokenizer');

class Request {

    constructor (data, state) {
        this.data = data;

        this.message = data.message || null;

        this._postback = data.postback || null;

        this.attachments = (data.message && data.message.attachments) || [];

        this.senderId = data.sender && data.sender.id;

        this.path = '';

        this.state = state;
    }

    isAttachment () {
        return this.attachments.length > 0;
    }

    _checkAttachmentType (type, attachmentIndex = 0) {
        if (this.attachments.length <= attachmentIndex) {
            return false;
        }
        return this.attachments[attachmentIndex].type === type;
    }

    isImage (attachmentIndex = 0) {
        return this._checkAttachmentType('image', attachmentIndex);
    }

    isFile (attachmentIndex = 0) {
        return this._checkAttachmentType('file', attachmentIndex);
    }

    attachment (attachmentIndex = 0) {
        if (this.attachments.length <= attachmentIndex) {
            return null;
        }
        return this.attachments[attachmentIndex];
    }

    attachmentUrl (attachmentIndex = 0) {
        if (this.attachments.length <= attachmentIndex) {
            return null;
        }
        const { payload } = this.attachments[attachmentIndex];
        if (!payload) {
            return null;
        }
        return payload && payload.url;
    }

    isMessage () {
        return this.message !== null;
    }

    text (tokenized = false) {
        if (this.message === null) {
            return '';
        }

        if (tokenized && this.message.text) {
            return tokenize(this.message.text);
        }

        return this.message.text || '';
    }

    quickReply (getData = false) {
        if (this.message === null
            || !this.message.quick_reply) {
            return null;
        }

        return this._processPayload(this.message.quick_reply, getData);
    }

    isPostBack () {
        return this._postback !== null;
    }

    action (getData = false) {
        let res = null;
        if (this._postback !== null) {
            res = this._processPayload(this._postback, getData);
        }
        if (!res && this.message !== null && this.message.quick_reply) {
            res = this._processPayload(this.message.quick_reply, getData);
        }
        return res || (getData ? {} : null);
    }

    postBack (getData = false) {
        if (this._postback === null) {
            return null;
        }
        return this._processPayload(this._postback, getData);
    }

    _processPayload (object = {}, getData = false) {
        let { payload } = object;
        let isObject = typeof payload === 'object' && payload !== null;
        const byDefault = getData ? {} : null;

        if (typeof payload === 'string' && payload.match(/^\{.*\}$/)) {
            payload = JSON.parse(payload);
            isObject = true;
        }

        if (getData && isObject) {
            return payload.data || payload;
        } if (isObject) {
            return payload.action;
        }

        return payload || byDefault;
    }

}

Request.createPostBack = function (senderId, action, data = {}) {
    return {
        sender: {
            id: senderId
        },
        postback: {
            payload: {
                action,
                data
            }
        }
    };
};

Request.quickReply = function (senderId, action, data = {}) {
    return {
        sender: {
            id: senderId
        },
        message: {
            text: action,
            quick_reply: {
                payload: JSON.stringify({
                    action,
                    data
                })
            }
        }
    };
};

Request.fileAttachment = function (senderId, url, type = 'file') {
    return {
        sender: {
            id: senderId
        },
        message: {
            attachments: [{
                type,
                payload: {
                    url
                }
            }]
        }
    };
};

module.exports = Request;
