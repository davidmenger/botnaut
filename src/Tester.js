/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const ResponseAssert = require('./ResponseAssert');

class Tester {

    constructor (processor, senderId = null) {
        this.processor = processor;

        this.responses = [];

        this._collector = [];

        // replace sender
        this.processor.senderFnFactory = () => (data) => {
            // on send
            // @todo validate length of quick_responses to 20!!
            this._collector.push(data);
        };

        this.senderId = senderId || `${Math.random() * 1000}${Date.now()}`;

        // replace logger (throw instead of log)
        this.processor.log = {
            error: (e) => { throw e; },
            warn: e => console.warn(e), // eslint-disable-line
            log: e => console.log(e) // eslint-disable-line
        };
    }

    _request (data) {
        return this.processor.processMessage(data)
            .then(() => {
                this.responses = this._collector;
                this._collector = [];
            });
    }

    res (index = 0) {
        if (this.responses.length <= index) {
            assert.fail(`Response ${index} does not exists. There are ${this.responses.length} responses`);
        }

        return new ResponseAssert(this.responses[index]);
    }

    text (text) {
        return this._request({
            sender: {
                id: this.senderId
            },
            message: {
                text
            }
        });
    }

    quickReply (payload) {
        return this._request({
            sender: {
                id: this.senderId
            },
            message: {
                text: typeof payload === 'string' ? payload : 'Ha',
                quick_reply: { payload }
            }
        });
    }

    postBack (payload) {
        return this._request({
            sender: {
                id: this.senderId
            },
            postback: {
                payload
            }
        });
    }

}

module.exports = Tester;
