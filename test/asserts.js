/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const asserts = require('../src/asserts');
const Request = require('../src/Request');

describe('asserts', function () {

    describe('isText', function () {

        it('should return true, only when its a text message ', function () {
            assert.ok(asserts.isText(Request.text(123, 'hello')), 'this should be text');
            const res = asserts.isText(Request.quickReply(123, 'hello'), false);
            assert.ok(!res, 'this should not be text');
            assert.throws(() => {
                asserts.isText(Request.quickReply(123, 'hello'));
            });
        });

    });

});
