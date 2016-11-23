/*
 * @author David Menger
 */
'use strict';

const request = require('request-promise');

class UserLoader {

    constructor (token) {
        this.token = token;
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
        return request({
            uri: `https://graph.facebook.com/v2.6/${id}`,
            qs: { access_token: this.token },
            method: 'GET',
            json: true
        })
            .then(res => (res ? {
                firstName: res.first_name,
                lastName: res.last_name,
                profilePic: res.profile_pic,
                locale: res.locale,
                gender: res.gender
            } : null));
    }

}

module.exports = UserLoader;
