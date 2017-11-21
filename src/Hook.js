/*
 * @author David Menger
 */
'use strict';

const DEFAULT_RESPONSE = results => 'OK'; // eslint-disable-line no-unused-vars

class Hook {

    constructor (processor, eventParser, responseParser = DEFAULT_RESPONSE) {
        this.processor = processor;
        this.eventParser = eventParser;
        this.responseParser = responseParser;
    }

    onRequest (body = {}) {
        const wait = [];

        this.eventParser(body, (data, pageId) => {
            const then = this.processor.processMessage(data, pageId);
            wait.push(then);
        });

        return Promise.all(wait)
            .then(events => this.responseParser(events));
    }

}

module.exports = Hook;
