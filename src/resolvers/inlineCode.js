/*
 * @author David Menger
 */
'use strict';

const { customFn } = require('./utils');

function inlineCode (params) {
    return customFn(params.code, params.description);
}

module.exports = inlineCode;
