/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const Request = require('../../src/Request');
const asserts = require('../../src/testTools/asserts');

describe('asserts', function () {

    describe('isText()', function () {

        it('should return true, only when its a text message ', function () {
            assert.ok(asserts.isText(Request.text(123, 'hello')), 'this should be text');
            const res = asserts.isText(Request.quickReply(123, 'hello'), false);
            assert.ok(!res, 'this should not be text');
            assert.throws(() => {
                asserts.isText(Request.quickReply(123, 'hello'));
            });
        });

    });

    describe('genericTemplate()', function () {

        it('should should fail, when bad data are tested', function () {
            assert.throws(() => {
                asserts.genericTemplate({});
            });
        });

        it('should should fail, when bad data are tested', function () {
            const data = {
                message: {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'any',
                            elements: []
                        }
                    }
                }
            };
            assert.strictEqual(asserts.genericTemplate(data, 1, false), false);
            assert.throws(() => {
                asserts.genericTemplate(data, 1);
            });
        });

        it('should should fail, when bad data are tested', function () {
            const data = {
                message: {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'generic',
                            elements: []
                        }
                    }
                }
            };
            assert.strictEqual(asserts.genericTemplate(data, null, false), true);
            assert.strictEqual(asserts.genericTemplate(data, 1, false), false);
            assert.throws(() => {
                asserts.genericTemplate(data, 1);
            });
        });

    });

    describe('buttonTemplate()', function () {

        it('should should fail, when bad data are tested', function () {
            assert.strictEqual(asserts.buttonTemplate({}, 1, null, false), false);
            assert.throws(() => {
                asserts.buttonTemplate({}, 'text');
            });
        });

        it('should should fail, when bad data are tested', function () {
            const data = {
                message: {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'any',
                            buttons: []
                        }
                    }
                }
            };
            assert.strictEqual(asserts.buttonTemplate(data, 'text', 1, false), false);
            assert.throws(() => {
                asserts.buttonTemplate(data, 'text', 1);
            });
        });

        it('should should fail, when bad data are tested', function () {
            const data = {
                message: {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'button',
                            text: 'text',
                            buttons: []
                        }
                    }
                }
            };
            assert.strictEqual(asserts.buttonTemplate(data, 'text', null, false), true);
            assert.strictEqual(asserts.buttonTemplate(data, 'text', 1, false), false);
            assert.strictEqual(asserts.buttonTemplate(data, 'bla', 0, false), false);
            assert.throws(() => {
                asserts.buttonTemplate(data, 1);
            });
        });

    });

});
