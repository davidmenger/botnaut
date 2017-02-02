/*
 * @author David Menger
 */
'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema({
    state: Object,
    lock: Number,
    senderId: String,
    lastInteraction: Date
});

schema.index({ senderId: 1 }, { unique: true });

schema.statics.getOrCreateAndLock = function (senderId, defaultState = {}, timeout = 300) {
    const now = Date.now();
    return this.findOneAndUpdate({
        senderId,
        lock: { $lt: now - timeout }
    }, {
        $setOnInsert: {
            state: defaultState
        },
        $set: {
            lock: now
        }
    }, {
        new: true,
        upsert: true
    }).exec();
};

schema.statics.onAfterStateLoad = function (isRef, senderId, state) {
    return Promise.resolve(state);
};

schema.statics.saveState = function (state) {
    return state.save();
};

module.exports = schema;
