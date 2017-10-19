/*
 * @author David Menger
 */
'use strict';

const Router = require('../Router');

function path (params) {
    if (typeof params.exitName !== 'string') {
        throw new Error('Missing exitName parameter');
    }
    return () => Router.exit(params.exitName);
}

module.exports = path;
