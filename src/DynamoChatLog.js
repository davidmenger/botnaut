/*
 * @author Václav Oborník
 */
'use strict';

const AWS = require('aws-sdk');


/**
 * Conversation DynamoDB state storage
 */
class DynamoChatLog {

    /**
     * @param {AWS.DynamoDB} dynamoDb
     * @param {string} tableName
     */
    constructor (dynamoDb, tableName) {

        this._documentClient = new AWS.DynamoDB.DocumentClient({
            service: dynamoDb,
            convertEmptyValues: true
        });

        this._tableName = tableName;
    }


    /**
     * Log single event
     *
     * @method
     * @name ChatLog#log
     * @param {string} userId
     * @param {Object[]} responses - list of sent responses
     * @param {Object} request - event request
     */
    log (userId, responses, request) {
        this._documentClient.put({
            TableName: this._tableName,
            Item: {
                userId,
                time: new Date(request.timestamp).toISOString(),
                request,
                responses
            }
        }).send();
    }

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
    error (err, userId, responses = [], request = {}) {
        this._documentClient.put({
            TableName: this._tableName,
            Item: {
                userId,
                time: new Date(request.timestamp || Date.now()).toISOString(),
                request,
                responses,
                err: `${err}`
            }
        }).send();
        // @todo add additional handler
    }

}

module.exports = DynamoChatLog;
