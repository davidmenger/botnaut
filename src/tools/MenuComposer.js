/*
 * @author David Menger
 */
'use strict';

class MenuComposer {

    constructor (onDone, isTopLevel = true) {
        this.onDone = onDone;
        this.menus = [];
        this.callToActions = null;
        this.isTopLevel = isTopLevel;
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
        const nested = new MenuComposer(([{ call_to_actions }]) => {
            this.callToActions.push({
                type: 'nested',
                title,
                call_to_actions
            });
            return this;
        }, false);
        return nested.menu();
    }

    /**
     * Finish the menu
     *
     * Last call of "done" returns a promise
     *
     * @returns {this|Promise}
     */
    done () {
        return this.onDone(this.menus);
    }

    /**
     * Finish the menu for the locale and starts a new menu
     *
     * @param {string} [locale]
     * @param {boolean} [inputDisabled]
     * @returns {MenuComposer}
     */
    menu (locale = 'default', inputDisabled = false) {

        if (!this.isTopLevel && this.menus.length !== 0) {
            throw new Error('Call the .done() on nested menu before new menu creation');
        }

        this.callToActions = [];
        this.menus.push({
            locale,
            composer_input_disabled: inputDisabled,
            call_to_actions: this.callToActions
        });
        return this;
    }

}

module.exports = MenuComposer;
