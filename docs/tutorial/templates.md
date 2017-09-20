# Sending Templates

- When using extension, the url will contain a token for accessing the bot framework
- All links without a protocol will be treated as local links (`appUrl` from config will be used)
- All postback actions without leading `/` will be treated as relative actions

## Button Template

Show the button template

```javascript
const { Router } = require('botnaut');

const bot = new Router();

bot.use((req, res) => {
    res.button('Hello')
        .postBackButton('Text', 'action')            // makes a postback
        .urlButton('Url button', '/internal', true)  // opens authorized webview
        .urlButton('Other button', 'https://goo.gl') // opens in internal browser
        .send();
});

module.exports = bot;
```

## Generic Template

Show the generic template

```javascript
const { Router } = require('botnaut');

const bot = new Router();

bot.use((req, res) => {
    res.genericTemplate()
        .addElement('title', 'subtitle')
            .setElementImage('/local.png')               // set local image
            .setElementUrl('https://www.seznam.cz')
            .postBackButton('Button title', 'action', { actionData: 1 })
        .addElement('another', 'subtitle')
            .setElementImage('https://goo.gl/image.png') // use remote image
            .setElementAction('action', { actionData: 1 })
            .urlButton('Local link with extension', '/local/path', true, 'compact')
        .send();
});

module.exports = bot;
```


## Receipt Template

Show the receipt template

```javascript
const { Router } = require('botnaut');

const bot = new Router();

bot.use((req, res) => {
    res.receipt('Name', 'Cash', 'CZK', '1')
        .addElement('Element name', 1, 2, '/inside.png', 'text')
        .send();

module.exports = bot;
```

## Working with webviews

  - **Dont forget to whitelist your domain**

    ```javascript
    const { Settings } = require('botnaut');

    const settings = new Settings('pagetoken');

    settings.whitelistDomain('https://mydomain.com');
    ```

  - **Include Facebook Code in your page**

    ```html
    <script type="text/javascript">
        window.FB_PAGE_ID = '{{pageId}}';
    </script>
    <script>
        (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
        fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'Messenger'));
    </script>
    ```

  - **Closing the webview**

    ```javascript
    MessengerExtensions.requestCloseBrowser(() => {
        // yes
    }, () => {
        // for classic browser
        window.location.href = `http://m.me/${window.FB_PAGE_ID}`;
    });
    ```

  - **Getting token and sender from URL**

    ```javascript
    import jsCookie from 'js-cookie';

    let sender = null;

    if (window.location.hash.match(/^#?.+/)) {
        const { token, senderId } = window.location.hash
            .replace(/^#/, '')
            .split('&')
            .map(a => `${a}`.split('='))
            .reduce((o, item) => (item.length === 2
                ? Object.assign(o, { [item[0]]: decodeURIComponent(item[1]) })
                : o), {});

        sender = senderId;

        window.location.hash = '';
        jsCookie.set('botToken', token, { expires: 7, HttpOnly: true });
    }
    ```

  - **Sending the postback from browser to bot**

    ```javascript
    import $ from 'jquery';

    export default function postBack (senderId, action, data = {}) {
        return {
            object: 'page',
            entry: [{
                id: 'page_id',
                time: Date.now(),
                messaging: [{
                    sender: { id: senderId },
                    postback: {
                        payload: {
                            action,
                            data
                        }
                    }
                }]
            }]
        };
    }

    export function jqueryRequest (senderId, action, data, callback) {
        $.ajax({
            method: 'POST',
            url: '/bot',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(postBack(senderId, action, data)),
            success: responseData => callback(null, responseData),
            error: jqXHR => callback(jqXHR)
        });
    }
    ```