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
     * Checks for generic template
     *
     * @param {number} itemCount - specified item count
     *
     * @memberOf ResponseAssert
     */
    genericTemplate (itemCount = null) {
        const ok = this.responses
            .some(res => asserts.genericTemplate(res, itemCount, false));
        assert.ok(ok, 'No response contains valid generic template');
        return this;
    }

    /**
     * Checks for button template
     *
     * @param {string} search
     * @param {number} buttonCount - specified button count
     *
     * @memberOf ResponseAssert
     */
    buttonTemplate (search, buttonCount = null) {
        const ok = this.responses
            .some(res => asserts.buttonTemplate(res, search, buttonCount, false));
        assert.ok(ok, 'No response contains valid button template');
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
        const ok = this.responses
            .some(res => asserts.passThread(res, appId, false));
        assert.ok(ok, 'No response contains pass control or pass control app mismatch');
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
