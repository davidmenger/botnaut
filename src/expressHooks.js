/*
 * @author David Menger
 */
'use strict';

const Hook = require('./Hook');
const { eventParser } = require('./connectors/facebook');

function postMiddlewares (bodyParser, processor, log = console) {

    let hook;

    if (processor instanceof Hook) {
        hook = processor;
    } else {
        hook = new Hook(processor, eventParser);
    }

    let bodyParserMiddleware;
    let processMiddleware;

    if (processor.secure) {
        bodyParserMiddleware = bodyParser.json({
            verify: (req, res, buf) =>
                processor.secure.verifySignature(buf, req.headers['x-hub-signature'])
        });

        processMiddleware = (req, res) => {
            let response;
            processor.secure.verifyReq(req)
                .then(() => hook.onRequest(req.body))
                .then((r) => { response = r; })
                .catch(e => log.error(e))
                .then(() => res.send(response || 'OK'));
        };
    } else {
        bodyParserMiddleware = bodyParser.json();

        processMiddleware = (req, res) => {
            let response;
            hook.onRequest(req.body)
                .then((r) => { response = r; })
                .catch(e => log.error(e))
                .then(() => res.send(response || 'OK'));
        };
    }

    return [bodyParserMiddleware, processMiddleware];
}

function getVerifierMiddleware (botToken) {
    return (req, res) => {
        if (req.query['hub.verify_token'] === botToken) {
            res.send(req.query['hub.challenge']);
        } else {
            res.send('Error, wrong validation token');
        }
    };
}

module.exports = {
    postMiddlewares,
    getVerifierMiddleware
};
