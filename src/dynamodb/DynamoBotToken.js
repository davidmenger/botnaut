/*
 * @author Václav Oborník
 */
'use strict';

const AWS = require('aws-sdk');
const { generateToken } = require('../utils');

/**
 * Conversation DynamoDB state storage
 */
class DynamoBotToken {

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

    getOrCreateToken (senderId) {
        if (!senderId) {
            return Promise.reject(new Error('Missing sender ID'));
        }

        return this._getToken(senderId)
            .then((token) => {
                if (!token) {
                    return this._createAndGetToken(senderId);
                }
                return token;
            });
    }

    _getToken (senderId) {
        return this._documentClient.get({
            TableName: this._tableName,
            Key: { senderId }
        })
            .promise()
            .then((data) => {
                if (!data.Item) {
                    return null;
                }

                return data.Item;
            });
    }

    _createAndGetToken (senderId) {
        let tokenObject;
        return generateToken()
            .then((token) => {

                tokenObject = { senderId, token };

                return this._documentClient.put({
                    TableName: this._tableName,
                    Item: tokenObject,
                    ConditionExpression: 'attribute_not_exists(senderId)'
                }).promise();
            })
            .then(
                () => tokenObject,
                () => this._getToken(senderId) // probably collision, try read it
                    .then((token) => {
                        if (!token) {
                            throw new Error('Cant create token');
                        }
                        return token;
                    })
            );
    }

}

module.exports = DynamoBotToken;
