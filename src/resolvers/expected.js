/*
 * @author David Menger
 */
'use strict';

const Router = require('../Router');

function expected ({ path }, { isLastIndex }) {

    return (req, res) => {
        res.expected(path);

        return isLastIndex ? Router.END : Router.CONTINUE;
    };
}

module.exports = expected;
