/*
 * @author David Menger
 */
'use strict';

const request = require('request-promise-native');
const MenuComposer = require('./MenuComposer');
const deepEqual = require('deep-equal');

/**
 * Utility, which helps us to set up chatbot behavior
 *
 * @class Settings
 */
class Settings {

    /**
     * Creates an instance of Settings.
     *
     * @param {string} token
     * @param {{error:function}} [log]
     *
     * @memberOf Settings
     */
    constructor (token, log = console) {
        this.token = token;
        this.log = log;
    }

    _post (data) {
        request({
            uri: 'https://graph.facebook.com/v2.8/me/messenger_profile',
            qs: { access_token: this.token },
            method: 'POST',
            json: data
        }).catch(e => this.log.error('Bot settings failed', e));
    }

    _get (fields = null) {
        const queryString = { access_token: this.token };
        if (fields) {
            queryString.fields = fields.join(',');
        }
        return request({
            uri: 'https://graph.facebook.com/v2.8/me/messenger_profile',
            qs: queryString,
            method: 'GET',
            json: true
        }).catch((e) => {
            this.log.error('Bot settings failed', e);
            return Promise.reject(e);
        });
    }

    _delete (data) {
        request({
            uri: 'https://graph.facebook.com/v2.8/me/messenger_profile',
            qs: { access_token: this.token },
            method: 'DELETE',
            json: data
        }).catch(e => this.log.error('Bot settings failed', e));
    }

    /**
     * Sets or clears bot's greeting
     *
     * @param {string} [text=false] leave empty to clear
     * @returns {this}
     *
     * @memberOf Settings
     */
    greeting (text = false) {
        if (text) {
            this._post({
                greeting: [
                    {
                        locale: 'default',
                        text
                    }
                ]
            });
        } else {
            this._delete({
                fields: ['greeting']
            });
        }
        return this;
    }

    /**
     * Sets up the Get Started Button
     *
     * @param {string|object} [payload=false] leave blank to remove button, or provide the action
     * @returns {this}
     *
     * @example
     * const settings = new Settings(config.facebook.pageToken);
     * settings.getStartedButton('/start'); // just an action
     *
     * @memberOf Settings
     */
    getStartedButton (payload = false) {
        if (payload) {
            this._post({
                get_started: { payload }
            });
        } else {
            this._delete({
                fields: ['get_started']
            });
        }
        return this;
    }

    /**
     * Useful for using facebook extension in webviews
     *
     * @param {string|string[]} domains
     * @returns {this}
     *
     * @memberOf Settings
     */
    whitelistDomain (domains) {
        let list = domains;

        if (!Array.isArray(list)) {
            list = [domains];
        }

        list = list.map(dom => dom.replace(/\/$/, ''));

        this._post({
            whitelisted_domains: list
        });
        return this;
    }

    /**
     * Sets up the persistent menu
     *
     * @param {string} [locale]
     * @param {boolean} [inputDisabled]
     * @returns {MenuComposer}
     * @example
     *
     * const { Settings } = require('botnaut');
     *
     * const settings = new Settings('page-token-string');
     *
     * settings.menu()
     *     .addNested('Nested Menu')
     *         .addUrl('Go to google', 'https://google.com')
     *         .done()
     *     .addPostBack('Do something', '/the/action')
     *     .done();
     */
    menu (locale = 'default', inputDisabled = false) {
        return new MenuComposer((actions) => {
            this._get(['persistent_menu'])
                .then((result) => {

                    const existingMenu = result.data[0].persistent_menu;
                    const newMenu = [{
                        locale,
                        composer_input_disabled: inputDisabled,
                        call_to_actions: actions
                    }];

                    if (!deepEqual(newMenu, existingMenu)) {
                        this._post({
                            persistent_menu: newMenu
                        });
                    }
                }).catch(e => this.log.error('Bot settings failed', e));
            return this;
        });
    }
}

module.exports = Settings;
