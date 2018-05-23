/*
 * @author David Menger
 */
'use strict';

const request = require('request-promise-native');

class UserLoader {

    constructor (token) {
        this.token = token;
        this.apiVersion = 'v2.8';
    }

    /**
     *
     *
     * @param {string} id
     * @returns Promise<{ firstName: string }>
     *
     * @memberOf UserLoader
     */
    loadUser (id) {
        if (!this.token || !id) {
            return Promise.resolve(null);
        }
        return this._loadUser(id, this.token);
    }

    _loadUser (id, token) {
        return request({
            uri: `https://graph.facebook.com/${this.apiVersion}/${id}`,
            qs: { access_token: token },
            method: 'GET',
            json: true
        })
            .then(res => this._postProcess(res));
    }

    _postProcess (res) {
        return res
            ? {
                firstName: res.first_name,
                lastName: res.last_name,
                profilePic: res.profile_pic,
                locale: res.locale,
                gender: res.gender
            }
            : null;
    }

}

module.exports = UserLoader;
