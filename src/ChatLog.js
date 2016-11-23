/*
* @author David Menger
*/
'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema({
    request: Object,
    responses: Array,
    err: String
});

// schema.index({  }, {  });

// statics

schema.statics.log = function (responses, request) {
    this.insertMany([{
        request,
        responses
    }]);
};

schema.statics.error = function (err, responses = [], request = {}) {
    this.insertMany([{
        request,
        responses,
        err: `${err}`
    }]);
    // @todo add additional handler
};

const ChatLog = mongoose.model('ChatLog', schema);

module.exports = ChatLog;
