/*
 * @author David Menger
 */
'use strict';

const ButtonTemplate = require('./ButtonTemplate');
const { makeAbsolute } = require('./pathUtils');

/**
 * Generic template utility
 *
 * @method urlButton
 * @method postBackButton
 *
 * @class GenericTemplate
 * @extends {ButtonTemplate}
 */
class GenericTemplate extends ButtonTemplate {

    constructor (onDone, context = {}) {
        super(onDone, context, null);

        this.elements = [];

        this._element = null;
    }

    /**
     * Adds element to generic template
     *
     * @param {string} title
     * @param {string} [subtitle=null]
     * @param {boolean} [dontTranslate=false]
     * @returns {this}
     *
     * @memberOf GenericTemplate
     */
    addElement (title, subtitle = null, dontTranslate = false) {
        this._attachAndClearButtons();
        const element = {
            title: dontTranslate ? title : this._t(title)
        };
        if (subtitle !== null) {
            Object.assign(element, { subtitle: dontTranslate ? subtitle : this._t(subtitle) });
        }

        this._element = element;
        this.elements.push(element);
        return this;
    }

    _attachAndClearButtons () {
        if (this._element !== null && this.buttons.length > 0) {
            Object.assign(this._element, {
                buttons: this.buttons
            });
        }
        this.buttons = [];
    }

    /**
     * Sets url of recently added element
     *
     * @param {any} url
     * @param {boolean} [hasExtension=false]
     * @returns {this}
     *
     * @memberOf GenericTemplate
     */
    setElementUrl (url, hasExtension = false) {
        Object.assign(this._element, {
            item_url: this._makeExtensionUrl(url, hasExtension)
        });
        return this;
    }

    /**
     * Sets image of recently added element
     *
     * @param {string} image
     * @returns {this}
     *
     * @memberOf GenericTemplate
     */
    setElementImage (image) {
        Object.assign(this._element, {
            image_url: this._imageUrl(image)
        });
        return this;
    }

    /**
     * Sets default action of recently added element
     *
     * @param {string} url button url
     * @param {boolean} hasExtension includes token in url
     * @param {string} [webviewHeight=null] compact|tall|full
     *
     * @memberOf GenericTemplate
     */
    setElementAction (url, hasExtension = false, webviewHeight = null) {
        Object.assign(this._element, {
            default_action: {
                type: 'web_url',
                url: this._makeExtensionUrl(url, hasExtension),
                webview_height_ratio: webviewHeight || (hasExtension ? 'tall' : 'full'),
                messenger_extensions: hasExtension
            }
        });
        return this;
    }

    getTemplate () {
        this._attachAndClearButtons();
        const res = {
            template_type: 'generic',
            elements: this.elements
        };
        return res;
    }
}

module.exports = GenericTemplate;
