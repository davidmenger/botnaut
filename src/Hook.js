/*
 * @author David Menger
 */
'use strict';

const DEFAULT_RESPONSE = results => ({ ok: 1 }); // eslint-disable-line no-unused-vars

class Hook {

    constructor (processor, eventParser, responseParser = DEFAULT_RESPONSE) {
        this.processor = processor;
        this.eventParser = eventParser;
        this.responseParser = responseParser;
    }

    _process (messages, ret = []) {
        if (messages.length === 0) {
            return ret;
        }

        return this.processor.processMessage(...messages.pop())
            .then((res) => {
                ret.push(res);
                return this._process(messages, ret);
            });
    }

    onRequest (body = {}) {
        const messages = [];

        const waitForParse = this.eventParser(body, (data, pageId) => {
            messages.push([data, pageId]);
        });

        return Promise.resolve(waitForParse)
            .then(() => this._process(messages))
            .then(events => this.responseParser(events));
    }

}

module.exports = Hook;
