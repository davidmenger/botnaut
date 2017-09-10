/*
 * @author Václav Oborník
 */
'use strict';

const AWS = require('aws-sdk');
const uuidV1 = require('uuid').v1;


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
            service: dynamoDb
        });

        this._tableName = tableName;
    }


    /**
     * Log single event
     *
     * @method
     * @name ChatLog#log
     * @param {Object[]} responses - list of sent responses
     * @param {Object} request - event request
     */
    log (responses, request) {
        this._documentClient.put({
            TableName: this._tableName,
            Item: {
                id: uuidV1(),
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
     * @param {Object[]} [responses] - list of sent responses
     * @param {Object} [request] - event request
     */
    error (err, responses = [], request = {}) {
        this._documentClient.put({
            TableName: this._tableName,
            Item: {
                id: uuidV1(),
                request,
                responses,
                err: `${err}`
            }
        }).send();
        // @todo add additional handler
    }

}

module.exports = DynamoChatLog;
