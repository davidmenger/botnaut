'use strict';

const requestPromise = require('request-promise');

class IntentProvider {

    /**
     * @param {{ serviceUrl: string }} options
     */
    constructor (options) {
        this._options = options;
    }

    /**
     * @param {string} text - the user input
     * @param {string[]|Function|null} [allowed] - the array of desired intents or test function
     * @param {{ minScore?: number, matches?: number }} [options]
     * @returns {Promise.<null|string>}
     */
    resolve (text, allowed, options = {}) {

        if ((text || '').trim().length === 0) {
            return Promise.resolve(null);
        }

        const qs = { text };
        if (options.matches) {
            qs.matches = options.matches;
        }

        return requestPromise({
            uri: this._options.serviceUrl,
            qs,
            json: true
        }).then((response) => {

            if (response.error) {
                throw new Error(`IntentProvider response error: ${response.error}`);

            } else if (!Array.isArray(response.tags)) {
                throw new Error('IntentProvider unknown response from the service');
            }

            let tags = response.tags;

            if (typeof options.minScore === 'number') {
                tags = tags.filter(t => t.score >= options.minScore);
            }

            if (Array.isArray(allowed)) {
                tags = tags.filter(t => allowed.includes(t.tag));

            } else if (typeof allowed === 'function') {
                tags = tags.filter(t => allowed(t.tag));
            }

            if (!tags.length) {
                return null;
            }

            return tags[0].tag;
        });
    }

}

module.exports = IntentProvider;
