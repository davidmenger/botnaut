/*
 * @author David Menger
 */
'use strict';

const Router = require('../Router');

let handlebars;
try {
    handlebars = module.require('handlebars');
} catch (er) {
    handlebars = null;
}

function media ({ type, url }, { isLastIndex }) {

    const urlString = url || '';

    const urlTemplate = handlebars
        ? handlebars.compile(urlString)
        : () => urlString;

    if (['image', 'file', 'video'].indexOf(type) === -1) {
        throw new Error(`Unsupported media type: ${type}`);
    }

    return (req, res) => {
        const stateData = Object.assign({}, req.state, res.state, res.data);
        const sendUrl = urlTemplate(stateData);

        res[type](sendUrl, true);

        return isLastIndex ? Router.END : Router.CONTINUE;
    };
}

module.exports = media;
