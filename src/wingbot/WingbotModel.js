'use strict';

const request = require('request-promise-native');
const assert = require('assert');

const DEFAULT_CACHE_SIZE = 10;
const DEFAULT_MATCHES = 4;

/**
 * @typedef {{ tag: string, score: number }} Intent
 */

/**
 * @class
 */
class WingbotModel {

    /**
     * @param {Object} options
     * @param {string} options.serviceUrl
     * @param {string} options.model
     * @param {number} options.cacheSize
     * @param {number} options.matches
     * @param {{ warn: Function }} [log]
     */
    constructor (options, log = console) {
        assert.equal(typeof options.serviceUrl, 'string', 'The serviceUrl option has to be string');
        assert.equal(typeof options.model, 'string', 'The model option has to be string');
        this._options = options;
        this._log = log;

        this._matches = options.matches || DEFAULT_MATCHES;
        this._cacheSize = options.cacheSize || DEFAULT_CACHE_SIZE;
        this._cache = [];
        this._cacheMap = new Map();
        this._request = options.request || request;
    }

    /**
     * @param {string} text - the user input
     * @param {number} matches - the number of matches
     * @returns {Promise.<Array.<{tag: string, score: number}>>}
     */
    resolve (text) {
        if (this._cacheMap.has(text)) {
            return this._cacheMap.get(text);
        }

        const promise = this._resolve(text)
            .then((res) => {
                // clean the cache
                while (this._cache.length > this._cacheSize) {
                    const clean = this._cache.shift();
                    this._cacheMap.delete(clean);
                }

                return res;
            });


        this._cache.push(text);
        this._cacheMap.set(text, promise);

        return promise;
    }

    _resolve (text) {

        if ((text || '').trim().length === 0) {
            return Promise.resolve([]);
        }

        const qs = { text, matches: this._matches };

        return this._request({
            uri: `${this._options.serviceUrl}/${this._options.model}`,
            qs,
            json: true,
            timeout: 20000
        }).then((response) => {

            if (response.error || !Array.isArray(response.tags)) {
                this._log.warn(response.error);
                return [];
            }

            return response.tags;
        }).catch((err) => {
            this._log.warn(err);
            return [];
        });
    }

}

module.exports = WingbotModel;
