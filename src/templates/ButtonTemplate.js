/*
 * @author David Menger
 */
'use strict';

const BaseTemplate = require('./BaseTemplate');
const { makeAbsolute } = require('../utils');

/**
 * Helps with creating of button template
 * Instance of button template is returned by {Responder}
 *
 * @class ButtonTemplate
 * @extends {BaseTemplate}
 */
class ButtonTemplate extends BaseTemplate {

    constructor (onDone, context, text) {
        super(onDone, context);

        this.text = text;
        this.buttons = [];
    }

    _makeExtensionUrl (url, hasExtension) {
        if (hasExtension) {
            const hash = [
                `token=${encodeURIComponent(this.context.token)}`,
                `senderId=${encodeURIComponent(this.context.senderId)}`
            ];
            return `${this.context.appUrl || ''}${url}#${hash.join('&')}`;
        }
        return url;
    }

    /**
     * Adds button. When `hasExtension` is set to `true`, url will contain hash like:
     * `#token=foo&senderId=23344`
     *
     * @param {string} title button text
     * @param {string} linkUrl button url
     * @param {boolean} hasExtension includes token in url
     * @param {string} [webviewHeight=null] compact|tall|full
     * @returns {this}
     *
     * @memberOf ButtonTemplate
     */
    urlButton (title, linkUrl, hasExtension = false, webviewHeight = null) {
        this.buttons.push({
            type: 'web_url',
            title: this._t(title),
            url: this._makeExtensionUrl(linkUrl, hasExtension),
            webview_height_ratio: webviewHeight || (hasExtension ? 'tall' : 'full'),
            messenger_extensions: hasExtension
        });
        return this;
    }

    /**
     * Adds button, which makes another action
     *
     * @param {string} title Button title
     * @param {string} action Button action (can be absolute or relative)
     * @param {object} [data={}] Action data
     * @returns {this}
     *
     * @memberOf ButtonTemplate
     */
    postBackButton (title, action, data = {}) {
        this.buttons.push({
            type: 'postback',
            title: this._t(title),
            payload: JSON.stringify({
                action: makeAbsolute(action, this.context.path),
                data
            })
        });
        return this;
    }

    /**
     *
     * @returns {this}
     *
     * @memberOf ButtonTemplate
     */
    shareButton () {
        this.buttons.push({
            type: 'element_share'
        });
        return this;
    }

    getTemplate () {
        const res = {
            template_type: 'button',
            text: this._t(this.text),
            buttons: this.buttons
        };
        return res;
    }

}

module.exports = ButtonTemplate;
