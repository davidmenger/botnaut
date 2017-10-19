/*
* @author David Menger
*/
'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * @classdesc Chat logs storage
 *
 * @name ChatLog
 * @class
 */

const schema = new Schema({
    request: Object,
    responses: Array,
    err: String
});

// schema.index({  }, {  });

// statics


/**
 * Log single event
 *
 * @method
 * @name ChatLog#log
 * @param {string} userId
 * @param {Object[]} responses - list of sent responses
 * @param {Object} request - event request
 */

schema.statics.log = function (userId, responses, request) {
    this.insertMany([{
        userId,
        time: new Date(request.timestamp),
        request,
        responses
    }]);
};

/**
 * Log single event
 *
 * @method
 * @name ChatLog#error
 * @param {any} err - error
 * @param {string} userId
 * @param {Object[]} [responses] - list of sent responses
 * @param {Object} [request] - event request
 */

schema.statics.error = function (err, userId, responses = [], request = {}) {
    this.insertMany([{
        userId,
        time: new Date(request.timestamp || Date.now()),
        request,
        responses,
        err: `${err}`
    }]);
    // @todo add additional handler
};

module.exports = schema;
