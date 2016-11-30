/*
 * @author David Menger
 */
'use strict';

const path = require('path');
const pathToRegexp = require('path-to-regexp');

function makeAbsolute (action, contextPath = '') {
    const isAbsolute = !action || action.match(/^\//);
    return isAbsolute ? action : path.join(contextPath, action);
}

function actionMatches (route, requestedPath) {
    const isAbsolute = requestedPath.match(/^\//);
    if (isAbsolute) {
        return pathToRegexp(route).exec(requestedPath);
    }
    const expectedPos = route.length - requestedPath.length;
    return route.indexOf(requestedPath) === expectedPos && expectedPos !== -1;
}

module.exports = {
    makeAbsolute,
    actionMatches
};
