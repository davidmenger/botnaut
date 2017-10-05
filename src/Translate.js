'use strict';

const fs = require('fs');
const path = require('path');
const po2json = require('po2json');
const Router = require('./Router');

/**
 * Tool for text translation
 *
 * @class Translate
 */
class Translate {

    /**
     *
     * @param {object} options
     * @param {string} [options.sourcePath] - optional source path of translation folder
     * @param {string} [options.fileSuffix] - by default `.locale.po`
     */
    constructor (options) {
        this._options = Object.assign({
            sourcePath: path.join(process.cwd(), 'locales'),
            fileSuffix: '.locale.po'
        }, options);

        this._promisedTranslators = {};
    }

    _getTranslator (lang) {
        if (lang === null) {
            return Promise.resolve(w => w);
        }

        if (!this._promisedTranslators[lang]) {
            this._promisedTranslators[lang] = new Promise(
                (resolve, reject) => {
                    const filePath = path.join(this._options.sourcePath, `${lang}${this._options.fileSuffix}`);
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(data);
                    });
                })
                .then((content) => {
                    const messages = po2json.parse(content, { format: 'mf' });
                    // return translator for the locale
                    return key => (typeof messages[key] !== 'undefined' ? messages[key] : key);
                });
        }
        return this._promisedTranslators[lang];
    }

    /**
     * Creates static translator for static settings
     *
     * @param {string[]} languages - list of required languages
     * @returns {Promise.<object>}
     * @example
     * const { Translate } = require('botnaut');
     *
     * const translate = new Translate({ sourcePath: __dirname });
     *
     * const t = translate.translator(['cs', 'en']);
     *
     * // czech
     * t.cs.t('requested text');
     *
     * // english
     * t.en.t('requested text');
     */
    translator (languages) {
        if (!Array.isArray(languages) || typeof languages[0] !== 'string') {
            throw new Error('Language list should be non-empty array of strings');
        }

        return Promise.all(languages.map(lang => this._getTranslator(lang)))
            .then(translatorsArray => languages.reduce((obj, lang, index) =>
                Object.assign(obj, {
                    [lang]: {
                        t: translatorsArray[index]
                    }
                }), {})
            );
    }

    /**
     * Bots middleware for text translations
     *
     * - will be looking for `<lang>.locale.po` by default
     *
     * @param {Function} languageResolver
     * @returns {function(*, *)}
     * @example
     * const { Translate } = require('botnaut');
     *
     * const translate = new Translate({ sourcePath: __dirname });
     *
     * bot.use(translate.middleware((req, res) => 'cs'));
     *
     * bot.use((req, res) => {
     *    res.text(res.t('Translated text'));
     * });
     */
    middleware (languageResolver) {
        return (req, res) => {
            const lang = languageResolver(req);
            return this._getTranslator(lang)
                .then((translator) => {
                    Object.assign(res, {
                        t: translator,
                        tq: translator
                    });
                    return Router.CONTINUE;
                });
        };
    }

}

module.exports = Translate;
