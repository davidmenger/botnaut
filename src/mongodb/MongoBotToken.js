/*
* @author David Menger
*/
'use strict';

const mongoose = require('mongoose');
const { generateToken } = require('../utils');

const { Schema } = mongoose;

const schema = new Schema({
    token: { type: String, required: true },
    senderId: { type: String, required: true }
});

schema.index({ token: true }, { unique: true });
schema.index({ senderId: true }, { unique: true });

function updateToken (tokenObject) {
    return generateToken().then((token) => {
        const ret = tokenObject;
        ret.token = token;
        return ret.save();
    });
}

function wait (ms) {
    return new Promise(res => setTimeout(res, ms));
}

schema.statics.findByToken = function (token, senderId) {
    return this.findOne({ token, senderId })
        .exec();
};

schema.statics.getOrCreateToken = function (senderId) {
    if (!senderId) {
        return Promise.reject(new Error('Missing sender ID'));
    }
    const temporaryInsecureToken = `>${Math.random() * 0.9}${Date.now()}`;
    return this.findOneAndUpdate({
        senderId
    }, {
        $setOnInsert: {
            token: temporaryInsecureToken
        }
    }, {
        upsert: true,
        new: true
    })
        .exec()
        .then((res) => {
            if (res.token === temporaryInsecureToken) {
                return updateToken(res);
            } else if (res.token.match(/^>[0-9.]+$/)) {
                // probably collision, try it again
                return wait(400)
                    .then(() => this.findOne({ senderId }).exec())
                    .then((token) => {
                        if (!token) {
                            throw new Error('Cant create token');
                        }
                        return token;
                    });
            }
            return res;
        });
};

module.exports = schema;
