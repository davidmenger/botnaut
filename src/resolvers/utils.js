/*
 * @author David Menger
 */
'use strict';

const Router = require('../Router'); // eslint-disable-line
const hbs = require('./hbs');

const ASPECT_SQUARE = 'square';
const ASPECT_HORISONTAL = 'horisontal';

const TYPE_SHARE = 'element_share';
const TYPE_URL = 'web_url';
const TYPE_URL_WITH_EXT = 'web_url_extension';
const TYPE_POSTBACK = 'postback';

const WEBVIEW_FULL = 'full';
const WEBVIEW_TALL = 'tall';
const WEBVIEW_COMPACT = 'compact';

let request; // eslint-disable-line
try {
    request = module.require('request-promise-native');
} catch (e) {
    // do nothing
    request = () => Promise.reject(new Error('plugin is missing'));
}

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

function isArrayOfObjects (translations) {
    return Array.isArray(translations)
        && typeof translations[0] === 'object'
        && translations[0] !== null;
}

/**
 *
 * @param {{t:string,l:string}[]|string} translations
 * @param {string} [lang]
 * @returns {null|string}
 */
function getLanguageText (translations, lang = null) {
    let foundText;
    if (isArrayOfObjects(translations)) {
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

function randomizedCompiler (text, lang) {
    const texts = getLanguageText(text, lang);

    if (!Array.isArray(texts)) {
        return hbs.compile(texts);
    }

    return (...args) => {
        const index = Math.floor(Math.random() * texts.length);
        if (typeof texts[index] !== 'function') {
            texts[index] = hbs.compile(texts[index]);
        }
        return texts[index](...args);
    };
}

function stateData (req, res) {
    return Object.assign({}, req.state, res.state, res.data);
}

function cachedTranslatedCompilator (text) {
    const cache = new Map();

    return (state) => {
        const { lang: key = '-', lang } = state;
        let renderer = cache.get(key);
        if (!renderer) {
            renderer = randomizedCompiler(text, lang);
            cache.set(key, renderer);
        }
        return renderer(state);
    };
}

function getText (text, state) {
    const renderer = randomizedCompiler(text, state.lang);
    return renderer(state);
}

function processButtons (
    buttons,
    state,
    elem,
    linksMap,
    senderId,
    linksTranslator = (sndr, defaultText, urlText) => urlText
) {
    buttons.forEach(({
        title: btnTitle,
        action: btnAction
    }) => {
        const btnTitleText = getText(btnTitle, state);
        const defaultText = getText(btnTitle, { lang: null });
        const {
            type,
            url,
            webviewHeight = WEBVIEW_TALL,
            targetRouteId
        } = btnAction;

        switch (type) {
            case TYPE_URL:
            case TYPE_URL_WITH_EXT: {
                const hasExtention = type === TYPE_URL_WITH_EXT;
                let urlText = getText(url, state);
                urlText = linksTranslator(senderId, defaultText, urlText);
                elem.urlButton(btnTitleText, urlText, hasExtention, webviewHeight);
                break;
            }
            case TYPE_POSTBACK: {
                let postbackAction = linksMap.get(targetRouteId);

                if (postbackAction === '/') {
                    postbackAction = './';
                } else if (!postbackAction) {
                    return;
                }

                elem.postBackButton(btnTitleText, postbackAction);
                break;
            }
            case TYPE_SHARE:
                elem.shareButton(btnTitleText);
                break;
            default:
        }
    });
}

module.exports = {
    customFn,
    getLanguageText,
    cachedTranslatedCompilator,
    getText,
    stateData,

    ASPECT_SQUARE,
    ASPECT_HORISONTAL,

    TYPE_SHARE,
    TYPE_URL,
    TYPE_URL_WITH_EXT,
    TYPE_POSTBACK,

    WEBVIEW_FULL,
    WEBVIEW_TALL,
    WEBVIEW_COMPACT,

    processButtons
};
