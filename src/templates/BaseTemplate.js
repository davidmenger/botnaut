/*
 * @author David Menger
 */
'use strict';

class BaseTemplate {

    /**
     * Creates an instance of BaseTemplate.
     *
     * @param {function} onDone
     * @param {{appUrl:string, token:string, senderId:string, translator:function}} context
     * @param {function} translator
     *
     * @memberOf BaseTemplate
     */
    constructor (onDone, context = {}) {
        this.onDone = onDone;

        this.context = {
            appUrl: '',
            token: '',
            senderId: '',
            translator: w => w,
            path: ''
        };

        Object.assign(this.context, context);

        this._t = this.context.translator;
    }

    getTemplate () {
        throw new Error('NOT IMPLEMENTED!');
    }

    send () {
        this.onDone(this.getTemplate());
    }

    _imageUrl (image) {
        return image.match(/^https?:/)
            ? image
            : `${this.context.appUrl}${image}`;
    }

}

module.exports = BaseTemplate;
