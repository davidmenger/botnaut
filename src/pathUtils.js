/*
 * @author David Menger
 */
'use strict';

const path = require('path');

function makeAbsolute (action, contextPath = '') {
    const isAbsolute = !action || action.match(/^\//);
    return isAbsolute ? action : path.join(contextPath, action);
}

module.exports = {
    makeAbsolute
};
