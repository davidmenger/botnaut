/*
 * @author David Menger
 */
'use strict';

const resolvers = require('./resolvers');

const PREFIX = 'botbuild';

function factoryResourceMap () {
    const map = new Map();

    Object.keys(resolvers)
        .forEach((name) => {
            map.set(`${PREFIX}.${name}`, resolvers[name]);
        });

    return map;
}

module.exports = factoryResourceMap;
