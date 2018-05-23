/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const { replaceDiacritics, tokenize } = require('../../src/utils/tokenizer');


describe('tokenizer', function () {

    describe('#replaceDiacritics()', function () {

        it('should replace wierd characters', function () {
            assert.equal(replaceDiacritics('žšč'), 'zsc');
            assert.equal(
                replaceDiacritics('Příliš žluťoučký kůň úpěl ďábelské ódy'),
                'Prilis zlutoucky kun upel dabelske ody'
            );
        });

    });

    describe('#webalize()', function () {

        it('should strip diacritics, when true is passed as second param', function () {
            assert.equal(tokenize('FUNNY text InCamel END'), 'funny-text-incamel-end');
            assert.equal(tokenize('-Ňějaký čupr'), 'nejaky-cupr');
        });

    });
});

