/*
 * @author David Menger
 */
'use strict';

const Router = require('../Router');
const {
    getText,
    stateData,
    processButtons,
    ASPECT_HORISONTAL,
    ASPECT_SQUARE,
    WEBVIEW_TALL,
    TYPE_POSTBACK,
    TYPE_URL,
    TYPE_SHARE,
    TYPE_URL_WITH_EXT
} = require('./utils');

function end (isLastIndex) {
    return isLastIndex ? Router.END : Router.CONTINUE;
}

function carousel ({
    items = [],
    shareable = false,
    imageAspect = ASPECT_HORISONTAL
}, { isLastIndex, linksMap, linksTranslator }) {

    return (req, res) => {
        if (items.length === 0) {
            return end(isLastIndex);
        }

        const state = stateData(req, res);
        const isSquare = imageAspect === ASPECT_SQUARE;
        const tpl = res.genericTemplate(shareable, isSquare);

        items.forEach(({
            image,
            title,
            subtitle,
            buttons = [],
            action = null
        }) => {
            const titleText = getText(title, state);
            const subtitleText = getText(subtitle, state);

            const elem = tpl.addElement(titleText, subtitleText || null, true);

            if (image) {
                const imageUrl = getText(image, state);
                elem.setElementImage(imageUrl);
            }

            if (action && typeof action === 'object') {
                const { type, webviewHeight = WEBVIEW_TALL, url, targetRouteId } = action;
                switch (type) {
                    case TYPE_URL:
                    case TYPE_URL_WITH_EXT: {
                        const hasExtension = type === TYPE_URL_WITH_EXT;
                        const urlText = getText(url, state);
                        elem.setElementAction(urlText, hasExtension, webviewHeight);
                        break;
                    }
                    case TYPE_POSTBACK: {
                        let postbackAction = linksMap.get(targetRouteId);

                        if (postbackAction === '/') {
                            postbackAction = './';
                        } else if (!postbackAction) {
                            return;
                        }

                        elem.setElementActionPostback(postbackAction);
                        break;
                    }
                    case TYPE_SHARE:
                        res.setElementActionShare();
                        break;
                    default:
                }
            }

            processButtons(buttons, state, elem, linksMap, req.senderId, linksTranslator);
        });

        tpl.send();

        return end(isLastIndex);
    };
}

module.exports = carousel;
