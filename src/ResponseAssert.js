/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');

class ResponseAssert {

    constructor (response = {}) {
        this.response = response;
    }

    _text () {
        return this.response.message && this.response.message.text;
    }

    _quickReplies () {
        return this.response.message && this.response.message.quick_replies;
    }

    isWaiting () {
        return typeof this.response.wait === 'number';
    }

    isText (textOrFunction = null) {
        if (textOrFunction === null) {
            assert.equal(typeof this._text(), 'string');
        } else if (typeof textOrFunction === 'function') {
            assert.ok(textOrFunction(this._text()));
        } else {
            assert.equal(this._text(), textOrFunction);
        }
        return this;
    }

    contains (search) {
        let text = this._text();
        if (typeof text !== 'string') {
            assert.fail('Text is empty');
        }
        let match;
        if (search instanceof RegExp) {
            match = new RegExp(match, 'i');
        } else {
            match = search.toLowerCase();
        }
        text = text.toLowerCase();
        assert(!!text.match(match));
        return this;
    }

    hasQuickReplies (expectedReplies = null) {
        assert.equal(typeof this._quickReplies(), 'array', 'Responses has not been found');
        if (Array.isArray(expectedReplies)) {
            const replies = this._quickReplies();
            expectedReplies.forEach((expect) => {
                const lowerExpect = `${expect}`.toLowerCase();
                const found = replies.some(reply => (
                    (typeof expect === 'string' && reply.payload === expect)
                        || (reply.title && reply.title.toLowerCase() === lowerExpect)
                ));
                if (!found) {
                    assert.fail(`Expected: ${JSON.stringify(expect)} not found in ${JSON.stringify(this._quickReplies())}`);
                }
            });
        } else if (typeof expectedReplies === 'function') {
            assert(expectedReplies(this._quickReplies()));
        }
        return this;
    }

}

module.exports = ResponseAssert;
