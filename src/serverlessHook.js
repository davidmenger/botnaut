'use strict';

const AWS = require('aws-sdk');
const Hook = require('./Hook');
const BuildRouter = require('./BuildRouter');
const { validate } = require('./wingbot');
const { eventParser } = require('./connectors/facebook');

const lambda = new AWS.Lambda();

function getLambda (lambdaName) {
    return new Promise((resolve, reject) => {
        lambda.getFunctionConfiguration({
            FunctionName: lambdaName
        }, (err, res) => {
            if (!err) {
                resolve(res);
            } else {
                reject(err);
            }
        });
    });
}

function updateLambda (lambdaName, env) {
    return new Promise((resolve, reject) => {
        lambda.updateFunctionConfiguration({
            FunctionName: lambdaName,
            Environment: env
        }, (err, res) => {
            if (!err) {
                resolve(res);
            } else {
                reject(err);
            }
        });
    });
}

/**
 * Create updater handler for wingbot which deploys new lambda version
 *
 * listens for POST on `/update`
 *
 * @param {string} lambdaName - bot handler name
 * @param {string} [token] - bot authorization token
 * @param {object} [log] - console.* like logger object
 */
function createUpdater (lambdaName, token = null, log = console) {

    return (event, context, callback) => {
        const authHeader = event.headers && event.headers.Authorization;

        if (token && token !== authHeader) {
            log.error('Update Forbidden');
            callback(null, { statusCode: 403, body: 'Forbidden' });
            return;
        }

        getLambda(lambdaName)
            .then((fn) => {
                const newEnv = Object.assign({}, fn.Environment, {
                    Variables: Object.assign({}, fn.Environment.Variables, {
                        WINGBOT_DEPLOYED_AT: Date.now().toString()
                    })
                });
                return updateLambda(lambdaName, newEnv);
            })
            .then(() => {
                callback(null, { statusCode: 200, body: 'OK' });
            })
            .catch((e) => {
                log.error(e);
                callback(null, { statusCode: 500, body: `Error: ${e.message}` });
            });
    };
}

function processValidationEvent (event, verifyToken, callback) {
    if (event.queryStringParameters
            && event.queryStringParameters['hub.verify_token'] === verifyToken) {
        callback(null, {
            statusCode: 200,
            body: event.queryStringParameters['hub.challenge']
        });
    } else {
        callback(null, {
            statusCode: 400,
            body: 'Error, wrong validation token'
        });
    }
}
/**
 * Create an serverless handler for accepting messenger events
 *
 * @param {Processor|Hook} processor - Root router object or processor function
 * @param {string} verifyToken - chatbot application token
 * @param {object} [log] - console.* like logger object
 * @param {function} [onDispatch] - will be called after dispatch of all events
 */
function createHandler (processor, verifyToken, log = console, onDispatch = () => {}) {

    let hook;

    if (processor instanceof Hook) {
        hook = processor;
    } else {
        hook = new Hook(processor, eventParser);
    }

    return (event, context, callback) => {
        if (event.httpMethod === 'GET') {
            processValidationEvent(event, verifyToken, callback);
            onDispatch();
        } else {

            if (processor.secure) {
                try {
                    processor.secure.verifySignature(event.body, event.headers['X-Hub-Signature']);
                } catch (err) {
                    callback(err);
                    return;
                }
            }

            let res = 'OK';

            hook.onRequest(JSON.parse(event.body))
                .then((response) => {
                    if (response) {
                        res = response;
                    }
                })
                .catch(e => log.error(e))
                .then(() => {
                    onDispatch();
                    let body = res;
                    let contentType = 'text/plain';

                    if (typeof res === 'object') {
                        body = JSON.stringify(res);
                        contentType = 'application/json';
                    }

                    const response = {
                        statusCode: 200,
                        headers: {
                            'Content-Type': contentType
                        },
                        body
                    };
                    process.nextTick(() => {
                        callback(null, response);
                    });
                });


        }

    };
}

function error (statusCode, body, callback, onDispatch, log) {
    log.error(body);
    callback(null, {
        statusCode,
        body
    });
    onDispatch();
}

/**
 * Create validator handler for wingbot configurations
 *
 * listens for POST on `/validate`
 *
 * @param {object} config
 * @param {string} [config.token] - authorization token
 * @param {Blocks} [config.blocksResource] - authorization token
 * @param {function} [config.routerFactory] - creates blank router for testing purposes
 * @param {string} [config.testText] - text for router testing (null to disable)
 * @param {string} [config.testPostBack] - postback to test the bot (null to disable)
 * @param {object} [log] - console.* like logger object
 * @param {function} [onDispatch]
 */
function createValidator (config, log = console, onDispatch = () => {}) {

    if (!config.blocksResource && !config.routerFactory) {
        throw new Error('routerFactory or blocksResource is required');
    }

    return (event, context, callback) => {
        const body = event.body ? JSON.parse(event.body) : null;
        const authHeader = event.headers && event.headers.Authorization;

        if (config.token && config.token !== authHeader) {
            error(403, 'Wrong authorization', callback, onDispatch, log);
            return;
        }

        if (!Array.isArray(body.blocks)) {
            error(400, 'Bad input data', callback, onDispatch, log);
            return;
        }

        validate(
            () => {
                if (config.routerFactory) {
                    const router = config.routerFactory();
                    router.buildWithSnapshot(body.blocks);
                    return router;
                }
                return BuildRouter.fromData(body.blocks, config.blocksResource);
            },
            config.testPostBack,
            config.testText
        )
            .then(() => {
                callback(null, {
                    statusCode: 200,
                    body: 'OK'
                });
            })
            .catch(e => error(400, e.message, callback, onDispatch, log))
            .then(() => onDispatch())
            .catch(e => log.error(e));
    };
}

module.exports = { createValidator, createHandler, createUpdater };
