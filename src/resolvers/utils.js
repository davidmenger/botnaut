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

/**
 *
 * @param {{t:string,l:string}[]|string} translations
 * @param {string} [lang]
 * @returns {null|string}
 */
function getLanguageText (translations, lang = null) {
    let foundText;
    if (Array.isArray(translations)) {
        if (lang) {
            foundText = translations.find(t => t.l === lang);
        }
        if (!foundText) {
            foundText = translations[0];
        }
        foundText = foundText ? foundText.t : null;
    } else {
        foundText = translations;
    }
    return foundText || '';
}

module.exports = {
    customFn,
    getLanguageText
};
