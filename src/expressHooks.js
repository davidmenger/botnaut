/*
 * @author David Menger
 */
'use strict';

const Hook = require('./Hook');
const { eventParser } = require('./connectors/facebook');
const BuildRouter = require('./BuildRouter');
const { validate } = require('./wingbot');

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

/**
 * Create validator handler for wingbot configurations
 *
 * listens for POST on `/validate`
 *
 * @param {object} config
 * @param {string} [config.token] - authorization token
 * @param {Blocks} [config.blocksResource] - code blocks
 * @param {function} [config.routerFactory] - creates blank router for testing purposes
 * @param {string} [config.testText] - text for router testing (null to disable)
 * @param {string} [config.testPostBack] - postback to test the bot (null to disable)
 * @param {object} [log] - console.* like logger object
 * @returns {array}
 */
function createValidator (bodyParser, config, log = console) {

    if (!config.blocksResource && !config.routerFactory) {
        throw new Error('routerFactory or blocksResource is required');
    }

    return [
        bodyParser.json(),
        (req, res) => {
            const body = req.body;
            const authHeader = req.get('Authorization');

            if (config.token && config.token !== authHeader) {
                log.error('Validation forbidden');
                res.status(403).send('Wrong authorization');
                return;
            }

            if (!Array.isArray(body.blocks)) {
                log.error('Bad input data', body);
                res.status(400).send('Bad input data');
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
                    res.status(200).send('OK');
                })
                .catch((e) => {
                    log.error(e);
                    res.status(400).send(e.message);
                });
        }
    ];
}

/**
 * Create updater handler for wingbot which resets buildrouter
 * > **DISCLAIMER:** this handler updates only this single bot instance
 * > (does not work in multi-instance environments)
 *
 * listens for POST on `/update`
 *
 * @param {BuildRouter} bot - instance of bot
 * @param {string} [token] - bot authorization token
 * @param {object} [log] - console.* like logger object
 */
function createUpdater (bot, token = null, log = console) {

    return (req, res) => {
        const authHeader = req.get('Authorization');

        if (token && token !== authHeader) {
            log.error('Update Forbidden');
            res.status(403).send('Forbidden');
            return;
        }

        bot.resetRouter();
        res.status(200).send('OK');
    };
}

module.exports = {
    postMiddlewares,
    getVerifierMiddleware,
    createValidator,
    createUpdater
};
