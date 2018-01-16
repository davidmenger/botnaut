/*
 * @author David Menger
 */
'use strict';

function postback (params, { linksMap }) {
    let action = params.postBack;

    if (!action && params.routeId) {
        action = linksMap.get(params.routeId);

        if (action === '/') {
            action = './';
        }
    }

    return (req, res, postBack) => {
        postBack(action);
    };
}

module.exports = postback;
