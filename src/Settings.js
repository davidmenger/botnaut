/*
 * @author David Menger
 */
'use strict';

const request = require('request-promise');

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
            uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
            qs: { access_token: this.token },
            method: 'POST',
            json: data
        }).catch(e => this.log.error('Bot settings failed', e));
    }

    _delete (data) {
        request({
            uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
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
                setting_type: 'greeting',
                greeting: {
                    text
                }
            });
        } else {
            this._delete({
                setting_type: 'greeting'
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
                setting_type: 'call_to_actions',
                thread_state: 'new_thread',
                call_to_actions: [{ payload }]
            });
        } else {
            this._delete({
                setting_type: 'call_to_actions',
                thread_state: 'new_thread'
            });
        }
        return this;
    }

    /**
     * Useful for using facebook extension in webviews
     *
     * @param {string|string[]} domain
     * @returns {this}
     *
     * @memberOf Settings
     */
    whitelistDomain (domain) {
        let list = domain;

        if (!Array.isArray(list)) {
            list = [domain];
        }

        list = list.map(dom => dom.replace(/\/$/, ''));

        this._post({
            setting_type: 'domain_whitelisting',
            whitelisted_domains: list,
            domain_action_type: 'add'
        });
        return this;
    }
}

module.exports = Settings;
