/*
 * @author David Menger
 */
'use strict';

class BaseTemplate {

    /**
     * Creates an instance of BaseTemplate.
     *
     * @param {function} onDone
     * @param {{appUrl: string, token: string, senderId: string}} context
     * @param {function} translator
     *
     * @memberOf BaseTemplate
     */
    constructor (onDone, context = {}, translator = w => w) {
        this.onDone = onDone;

        this.context = {
            appUrl: '',
            token: '',
            senderId: ''
        };

        this.translator = translator;

        Object.assign(this.context, context);
    }

    getTemplate () {
        throw new Error('NOT IMPLEMENTED!');
    }

    send () {
        this.onDone(this.getTemplate());
    }

}

module.exports = BaseTemplate;
