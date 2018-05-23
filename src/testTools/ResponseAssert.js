/*
 * @author David Menger
 */
'use strict';

const asserts = require('./asserts');

/**
 * Utility for asserting single response
 *
 * @class ResponseAssert
 */
class ResponseAssert {

    constructor (response = {}) {
        this.response = response;
    }

    waiting () {
        asserts.waiting(this.response);
        return this;
    }

    /**
     * Checks, that response contains text
     *
     * @param {string} search
     * @returns {this}
     *
     * @memberOf ResponseAssert
     */
    contains (search) {
        asserts.contains(this.response, search);
        return this;
    }

    /**
     * Checks quick response action
     *
     * @param {string} action
     * @returns {this}
     *
     * @memberOf ResponseAssert
     */
    quickReplyAction (action) {
        asserts.quickReplyAction(this.response, action);
        return this;
    }

    /**
     * Checks template type
     *
     * @param {string} type
     * @returns {this}
     *
     * @memberOf ResponseAssert
     */
    templateType (type) {
        asserts.templateType(this.response, type);
        return this;
    }

    /**
     * Checks pass thread control
     *
     * @param {string} [appId]
     * @returns {this}
     *
     * @memberOf ResponseAssert
     */
    passThread (appId = null) {
        asserts.passThread(this.response, appId);
        return this;
    }

    /**
     * Checks attachment type
     *
     * @param {string} type
     * @returns {this}
     *
     * @memberOf ResponseAssert
     */
    attachmentType (type) {
        asserts.attachmentType(this.response, type);
        return this;
    }


}

module.exports = ResponseAssert;
