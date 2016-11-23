/*
 * @author David Menger
 */
'use strict';

const BaseTemplate = require('./BaseTemplate');

class ButtonTemplate extends BaseTemplate {

    constructor (onDone, context, translator, text) {
        super(onDone, context, translator);

        this.text = text;
        this.buttons = [];
    }

    /**
     *
     *
     * @param {string} title
     * @param {string} url
     * @param {string} [webviewHeight=null] compact|tall|full
     * @returns
     *
     * @memberOf ButtonTemplate
     */
    urlButton (title, linkUrl, hasExtension = false, webviewHeight = null) {
        let url = linkUrl;

        if (hasExtension) {
            const hash = [
                `token=${encodeURIComponent(this.context.token)}`,
                `senderId=${encodeURIComponent(this.context.senderId)}`
            ];
            url = `${this.context.appUrl || ''}${url}#${hash.join('&')}`;
        }

        this.buttons.push({
            type: 'web_url',
            title: this.translator(title),
            url,
            webview_height_ratio: webviewHeight || (hasExtension ? 'tall' : 'full'),
            messenger_extensions: hasExtension
        });
        return this;
    }

    postBackButton (title, action, data = {}) {
        this.buttons.push({
            type: 'postback',
            title: this.translator(title),
            payload: {
                action,
                data
            }
        });
        return this;
    }

    getTemplate () {
        const res = {
            template_type: 'button',
            text: this.translator(this.text),
            buttons: this.buttons
        };
        return res;
    }

}

module.exports = ButtonTemplate;
