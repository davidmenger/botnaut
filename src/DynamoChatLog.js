/*
 * @author Václav Oborník
 */
'use strict';

const { marshalItem } = require('dynamodb-marshaler');
const uuidV1 = require('uuid/v1');


/**
 * Conversation DynamoDB state storage
 */
class DynamoChatLog {

    /**
     * @param {AWS.DynamoDB} dynamoDb
     * @param {string} tableName
     */
    constructor (dynamoDb, tableName) {

        this._dynamodb = dynamoDb;

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
        this._dynamodb.putItem({
            TableName: this._tableName,
            Item: marshalItem({
                id: uuidV1(),
                request,
                responses
            })
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
        this._dynamodb.putItem({
            TableName: this._tableName,
            Item: marshalItem({
                id: uuidV1(),
                request,
                responses,
                err: `${err}`
            })
        }).send();
        // @todo add additional handler
    }

}

module.exports = DynamoChatLog;
