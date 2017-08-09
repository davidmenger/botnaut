/*
 * @author Václav Oborník
 */
'use strict';

const { marshalItem, unmarshalItem } = require('dynamodb-marshaler');
const transform = require('lodash.transform');

const ISODatePattern = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;

function deepMap (obj, iterator, context) {
    return transform(obj, (result, val, key) => {
        // eslint-disable-next-line no-param-reassign
        result[key] = typeof val === 'object' && !(val instanceof Date) && val !== null ?
            deepMap(val, iterator, context) :
            iterator.call(context, val, key, obj);
    });
}


/**
 * Conversation DynamoDB state storage
 */
class DynamoStateStorage {

    /**
     * @param {AWS.DynamoDB} dynamoDb
     * @param {string} tableName
     */
    constructor (dynamoDb, tableName) {

        this._dynamodb = dynamoDb;

        this._tableName = tableName;
    }

    /**
     *
     * @param {any} senderId - sender identifier
     * @param {Object} defaultState - default state of the conversation
     * @param {number} [timeout=300] - given default state
     * @returns {Promise.<Object>} - conversation state
     */
    getOrCreateAndLock (senderId, defaultState = {}, timeout = 300) {
        const now = Date.now();

        return this._dynamodb.updateItem({
            TableName: this._tableName,
            Key: marshalItem({ senderId }),
            ExpressionAttributeNames: {
                '#LOCK': 'lock'
            },
            UpdateExpression: 'SET #LOCK = :now',
            ConditionExpression: 'attribute_not_exists(senderId) OR (#LOCK < :lockTime)',
            ExpressionAttributeValues: marshalItem({
                ':now': now,
                ':lockTime': now - timeout
            }),
            ReturnValues: 'ALL_NEW'
        })
            .promise()
            .then((data) => {

                let state = unmarshalItem(data.Attributes);
                if (!state.state) {
                    state.state = defaultState;
                }

                state = deepMap(state, (value) => {
                    if (typeof value === 'string' && ISODatePattern.test(value)) {
                        return new Date(value);
                    }
                    return value;
                });

                return state;
            });
    }

    /**
     *
     * @param {Request} req - chat request
     * @param {Object} state - conversation state
     * @returns {Promise.<Object>} - conversation state
     */
    onAfterStateLoad (req, state) {
        return Promise.resolve(state);
    }

    /**
     *
     * @param {Object} state - conversation state
     * @returns {Promise}
     */
    saveState (state) {

        const stateToSave = deepMap(state, (value) => {
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        });

        return this._dynamodb.putItem({
            TableName: this._tableName,
            Item: marshalItem(stateToSave)
        })
            .promise()
            .then(() => state);
    }

}

module.exports = DynamoStateStorage;
