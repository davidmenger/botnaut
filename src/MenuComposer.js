/*
 * @author David Menger
 */
'use strict';

class MenuComposer {

    constructor (onDone) {
        this.onDone = onDone;
        this.callToActions = [];
    }

    /**
     * Add postback to menu
     *
     * @param {string} title
     * @param {string} action
     * @param {string} [data]
     * @returns {this}
     */
    addPostBack (title, action, data = {}) {
        this.callToActions.push({
            type: 'postback',
            title,
            payload: JSON.stringify({
                action,
                data
            })
        });
        return this;
    }

    /**
     * Add webview to menu
     *
     * @param {string} title
     * @param {string} url
     * @param {boolean} [hasExtension]
     * @param {string} [webviewHeight]
     * @returns {this}
     */
    addUrl (title, url, hasExtension = false, webviewHeight = null) {
        this.callToActions.push({
            type: 'web_url',
            title,
            url,
            webview_height_ratio: webviewHeight || (hasExtension ? 'tall' : 'full'),
            messenger_extensions: hasExtension
        });
        return this;
    }

    /**
     * Add Nested menu component
     *
     * @param {string} title
     * @returns {MenuComposer}
     */
    addNested (title) {
        return new MenuComposer((actions) => {
            this.callToActions.push({
                type: 'nested',
                title,
                call_to_actions: actions
            });
            return this;
        });
    }

    /**
     * Finish the menu
     *
     * @returns {this}
     */
    done () {
        return this.onDone(this.callToActions);
    }

}

module.exports = MenuComposer;
