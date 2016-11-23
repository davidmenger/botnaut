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

const State = mongoose.model('State', schema);

module.exports = State;
