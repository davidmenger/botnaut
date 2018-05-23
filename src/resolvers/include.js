/*
 * @author David Menger
 */
'use strict';

const BuildRouter = require('../BuildRouter');

function include (params, context, blocks) {
    const includedRouter = context.blocks
        .find(block => block.staticBlockId === params.staticBlockId);

    if (!includedRouter) {
        throw new Error(`Block ${params.staticBlockId} not found!`);
    }

    return new BuildRouter(includedRouter, blocks, context);
}

module.exports = include;
