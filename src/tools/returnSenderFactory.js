/*
 * @author David Menger
 */
'use strict';

const RES_HANDLER = (res, nextData) => nextData;

function returnSenderFactory (options, logger = console) {

    return function factory (userId, incommingMessage, pageId, handler = RES_HANDLER) {
        const queue = [];
        let logged = false;

        return function send (payload = null) {
            if (payload === null) {
                if (!logged) {
                    logged = true;
                    logger.log(userId, queue, incommingMessage);
                }
            } else {
                queue.push(handler(null, payload));
            }
            return Promise.resolve(queue);
        };
    };
}

module.exports = {
    returnSenderFactory
};
