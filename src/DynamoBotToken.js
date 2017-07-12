/*
 * @author Václav Oborník
 */
'use strict';

const { marshalItem, unmarshalItem } = require('dynamodb-marshaler');
const generateToken = require('./generateToken');

/**
 * Conversation DynamoDB state storage
 */
class DynamoBotToken {

    /**
     * @param {AWS.DynamoDB} dynamoDb
     * @param {string} tableName
     */
    constructor (dynamoDb, tableName) {

        this._dynamodb = dynamoDb;

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
        return this._dynamodb.getItem({
            TableName: this._tableName,
            Key: marshalItem({ senderId })
        })
            .promise()
            .then((data) => {
                if (!data.Item) {
                    return null;
                }

                return unmarshalItem(data.Item);
            });
    }

    _createAndGetToken (senderId) {
        let tokenObject;
        return generateToken()
            .then((token) => {

                tokenObject = { senderId, token };

                return this._dynamodb.putItem({
                    TableName: this._tableName,
                    Item: marshalItem(tokenObject),
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
