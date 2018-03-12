/*
 * @author David Menger
 */
'use strict';

const Router = require('../Router');
const {
    stateData,
    cachedTranslatedCompilator,
    processButtons
} = require('./utils');

function end (isLastIndex) {
    return isLastIndex ? Router.END : Router.CONTINUE;
}

function button ({
    buttons = [],
    text = null
}, { isLastIndex, linksMap, linksTranslator }) {

    const compiledText = cachedTranslatedCompilator(text);

    return (req, res) => {
        if (buttons.length === 0) {
            return end(isLastIndex);
        }

        const state = stateData(req, res);
        const tpl = res.button(compiledText(state));

        processButtons(buttons, state, tpl, linksMap, req.senderId, linksTranslator);

        tpl.send();

        return end(isLastIndex);
    };
}

module.exports = button;
