/*
 * @author Václav Oborník
 */
'use strict';

const transform = require('lodash.transform');
const AWS = require('aws-sdk');

const ISODatePattern = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;

function deepMap (obj, iterator) {
    return transform(obj, (result, val, key) => {
        const goDeeper = typeof val === 'object'
            && !(val instanceof Date)
            && (val !== null)
            && (val !== undefined);

        // eslint-disable-next-line no-param-reassign
        result[key] = goDeeper ? deepMap(val, iterator) : iterator(val, key, obj);
    });
}


/**
 * Conversation DynamoDB state storage
 */
class DynamoStateStorage {

    /**
     * @param {AWS.DynamoDB.DocumentClient} dynamoDb
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
     *
     * @param {any} senderId - sender identifier
     * @param {Object} defaultState - default state of the conversation
     * @param {number} [timeout=300] - given default state
     * @returns {Promise.<Object>} - conversation state
     */
    getOrCreateAndLock (senderId, defaultState = {}, timeout = 300) {
        const now = Date.now();

        return this._documentClient.update({
            TableName: this._tableName,
            Key: { senderId },
            ExpressionAttributeNames: {
                '#LOCK': 'lock'
            },
            UpdateExpression: 'SET #LOCK = :now',
            ConditionExpression: 'attribute_not_exists(senderId) OR (#LOCK < :lockTime)',
            ExpressionAttributeValues: {
                ':now': now,
                ':lockTime': now - timeout
            },
            ReturnValues: 'ALL_NEW'
        })
            .promise()
            .then((data) => {

                let state = data.Attributes;
                if (!state.state) {
                    state.state = defaultState;
                }

                state = this._decodeState(state);

                return state;
            })
            .catch((e) => {
                if (e.code === 'ConditionalCheckFailedException') {
                    Object.assign(e, { code: 11000 });
                }
                throw e;
            });
    }

    _decodeState (state) {
        return deepMap(state, (value) => {
            if (typeof value === 'string' && ISODatePattern.test(value)) {
                return new Date(value);
            }
            return value;
        });
    }

    _encodeState (state) {
        return deepMap(state, (value) => {
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
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

        const stateToSave = this._encodeState(state);

        return this._documentClient.put({
            TableName: this._tableName,
            Item: stateToSave
        })
            .promise()
            .then(() => state);
    }

}

module.exports = DynamoStateStorage;
