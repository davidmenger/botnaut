/*
 * @author David Menger
 */
'use strict';

function eventParser (body, onEvent) {
    if (body.object !== 'page') {
        return;
    }
    body.entry.forEach((event) => {
        const pageId = event.id;
        if (Array.isArray(event.messaging)) {
            event.messaging.forEach((data) => {
                onEvent(data, pageId);
            });
        }
    });
}

module.exports = {
    eventParser
};
