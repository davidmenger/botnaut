/*
 * @author David Menger
 */
'use strict';

function path (params) {
    if (typeof params.path !== 'string') {
        throw new Error('Missing path parameter');
    }
    return params.path;
}

module.exports = path;
