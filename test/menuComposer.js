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

        const ret = composer
            .menu('en_GB', true)
            .addPostBack('Postback Title', '/someAction')
            .addUrl('Second Url', 'https://tw.to', true)
            .addNested('Nested Title')
            .addUrl('Url Title', 'https://goo.gl')
            .done()
            .menu()
            .addPostBack('Some default lang menu', '/someAction')
            .done();

        assert.strictEqual(ret, TESTCONST, 'Return value should match done function return');
        assert.ok(doneSpy.calledOnce, 'Done should be called');
        assert.deepEqual(doneSpy.firstCall.args, [[
            {
                locale: 'en_GB',
                composer_input_disabled: true,
                call_to_actions: [
                    {
                        payload: '{"action":"/someAction","data":{}}',
                        title: 'Postback Title',
                        type: 'postback'
                    },
                    {
                        messenger_extensions: true,
                        title: 'Second Url',
                        type: 'web_url',
                        url: 'https://tw.to',
                        webview_height_ratio: 'tall'
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
                    }
                ]
            },
            {
                locale: 'default',
                composer_input_disabled: false,
                call_to_actions: [
                    {
                        payload: '{"action":"/someAction","data":{}}',
                        title: 'Some default lang menu',
                        type: 'postback'
                    }
                ]
            }
        ]]);
    });

});
