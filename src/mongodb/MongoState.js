/*
 * @author David Menger
 */
'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * @classdesc Conversation state storage
 *
 * @name State
 * @class
 */

const schema = new Schema({
    state: Object,
    lock: Number,
    senderId: String,
    lastInteraction: Date,
    lastSendError: Date,
    lastErrorMessage: String,
    off: Boolean
});

schema.index({ senderId: 1 }, { unique: true });

/**
 * Load state and lock for other requests
 *
 * @method
 * @name State#connectAndSubscribe
 * @param {*} senderId - user identifier
 * @param {Object} [defaultState=Object] - given default state
 * @param {number} [timeout=300] - given default state
 * @returns {Promise.<Object>}
 */

schema.statics.getOrCreateAndLock = function (senderId, defaultState = {}, timeout = 300) {
    const now = Date.now();
    return this.findOneAndUpdate({
        senderId,
        lock: { $lt: now - timeout }
    }, {
        $setOnInsert: {
            state: defaultState,
            lastSendError: null,
            off: false
        },
        $set: {
            lock: now
        }
    }, {
        new: true,
        upsert: true
    }).exec();
};

/**
 * Called after load for postprocessing purposes
 *
 * @method
 * @name State#onAfterStateLoad
 * @param {Request} req - chat request
 * @param {Object} state - given default state
 * @returns {Promise.<Object>}
 */

schema.statics.onAfterStateLoad = function (req, state) {
    return Promise.resolve(state);
};

/**
 * Called for saving state
 *
 * @method
 * @name State#saveState
 * @param {Object} state - given default state
 * @returns {Promise}
 */

schema.statics.saveState = function (state) {
    return state.save();
};

module.exports = schema;
