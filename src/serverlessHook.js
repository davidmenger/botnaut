'use strict';

const Hook = require('./Hook');

function processValidationEvent (event, verifyToken, callback) {
    if (event.queryStringParameters['hub.verify_token'] === verifyToken) {
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

function serverlessHook (processor, verifyToken, log = console, onDispatch = () => {}) {

    const hook = new Hook(processor);

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

            hook.onRequest(JSON.parse(event.body))
                .catch(e => log.error(e))
                .then(() => onDispatch())
                .catch(e => log.error(e));

            callback(null, {
                statusCode: 200,
                body: 'OK'
            });
        }

    };

}

module.exports = serverlessHook;
