/*
 * @author David Menger
 */
'use strict';

const Router = require('../Router'); // eslint-disable-line

function customFn (code, description) {
    if (typeof code !== 'string') {
        throw new Error(`Inline code '${description}' has empty code`);
    }
    let resolver;

    try {
        resolver = eval(code); // eslint-disable-line
    } catch (e) {
        throw new Error(`Invalid inline code '${description}': ${e.message}`);
    }

    if (typeof resolver !== 'function') {
        throw new Error(`Invalid inline code '${description}': must be a function`);
    }

    return resolver;
}

module.exports = {
    customFn
};
