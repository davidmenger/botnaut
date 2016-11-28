/*
 * @author David Menger
 */
'use strict';

const Hook = require('./Hook');

function postMiddlewares (bodyParser, processor, log = console) {
    const hook = new Hook(processor);

    const bodyParserMiddleware = bodyParser.json({
        verify: processor.secure.getSignatureVerifier()
    });

    const processMiddleware = (req, res) => {
        processor.secure.verifyReq(req)
            .then(() => hook.onRequest(req.body))
            .catch(e => log.error(e));

        res.send('OK');
    };
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
