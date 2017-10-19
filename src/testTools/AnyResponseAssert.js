/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const asserts = require('./asserts');

/**
 * Utility for searching among responses
 *
 * @class AnyResponseAssert
 */
class AnyResponseAssert {

    constructor (responses = []) {
        this.responses = responses;
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
        const ok = this.responses
            .some(res => asserts.contains(res, search, false));
        assert.ok(ok, `No response contains: "${search}"`);
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
        const ok = this.responses
            .some(res => asserts.quickReplyAction(res, action, false));
        assert.ok(ok, `No quick action matches: "${action}"`);
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
        const ok = this.responses
            .some(res => asserts.templateType(res, type, false));
        assert.ok(ok, `No response contains template type: "${type}"`);
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
        const ok = this.responses
            .some(res => asserts.attachmentType(res, type, false));
        assert.ok(ok, `No response contains attachment type: "${type}"`);
        return this;
    }

}

module.exports = AnyResponseAssert;
