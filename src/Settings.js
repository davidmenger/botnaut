/*
 * @author David Menger
 */
'use strict';

const request = require('request-promise');

class Settings {

    /**
     * Creates an instance of Settings.
     *
     * @param {string} token
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

    whitelistDomain (domain) {
        this._post({
            setting_type: 'domain_whitelisting',
            whitelisted_domains: [domain.replace(/\/$/, '')],
            domain_action_type: 'add'
        });
        return this;
    }
}

module.exports = Settings;
