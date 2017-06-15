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
 * @param {Object[]} responses - list of sent responses
 * @param {Object} request - event request
 */

schema.statics.log = function (responses, request) {
    this.insertMany([{
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
 * @param {Object[]} [responses] - list of sent responses
 * @param {Object} [request] - event request
 */

schema.statics.error = function (err, responses = [], request = {}) {
    this.insertMany([{
        request,
        responses,
        err: `${err}`
    }]);
    // @todo add additional handler
};

module.exports = schema;
