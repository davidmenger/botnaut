/*
 * @author David Menger
 */
'use strict';

const co = require('co');
const Tester = require('./Tester');

function roboTest (processor) {
    const tester = new Tester(processor);
    return fn => co.wrap(fn)(tester);
}

module.exports = {
    roboTest
};
