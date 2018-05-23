/*
 * @author David Menger
 */
'use strict';

let handlebars;
try {
    handlebars = module.require('handlebars');
} catch (er) {
    handlebars = { compile: text => () => text };
}

module.exports = handlebars;
