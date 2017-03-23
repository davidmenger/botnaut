/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const MenuComposer = require('../src/MenuComposer');

const TESTCONST = {};

describe('MenuComposer', function () {

    it('should be nested', function () {
        const doneSpy = sinon.spy(() => TESTCONST);
        const composer = new MenuComposer(doneSpy);

        const ret = composer.addPostBack('Postback Title', '/someAction')
            .addNested('Nested Title')
                .addUrl('Url Title', 'https://goo.gl')
                .done()
            .addUrl('Second Url', 'https://tw.to', true)
            .done();

        assert.strictEqual(ret, TESTCONST, 'Return value should match done function return');
        assert.ok(doneSpy.calledOnce, 'Done should be called');
        assert.deepEqual(doneSpy.firstCall.args, [[
            {
                payload: '{"action":"/someAction","data":{}}',
                title: 'Postback Title',
                type: 'postback'
            },
            {
                call_to_actions: [
                    {
                        messenger_extensions: false,
                        title: 'Url Title',
                        type: 'web_url',
                        url: 'https://goo.gl',
                        webview_height_ratio: 'full'
                    }
                ],
                title: 'Nested Title',
                type: 'nested'
            },
            {
                messenger_extensions: true,
                title: 'Second Url',
                type: 'web_url',
                url: 'https://tw.to',
                webview_height_ratio: 'tall'
            }
        ]]);
    });

});
