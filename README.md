# Prg-chatbot - Facebook Messenger platform framework

[![CircleCI](https://circleci.com/gh/pragonauts/prg-chatbot/tree/master.svg?style=svg)](https://circleci.com/gh/pragonauts/prg-chatbot/tree/master)

Framework for building reusable chatbot components. **Routing**, **Keyword recognition** is built-in.

## Requirements and installation

  - requires `mongoose` > 4.0
  - requires `nodejs` > 6.0
  - requires `express` > 4.0
  - requires `body-parser` > 1.10

  ```bash
  $ npm i -S prg-chatbot
  ```

## Basic setup with Express

It's easy. This basic example can handle everything. Note, that the handler is **STRICTLY SYNCHRONOUS**.

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const { createRouter, createProcessor } = require('prg-chatbot/express');

const handler = (req, res, postBack) => {
    res.typingOn()
        .wait();

    switch (req.action()) {
        case 'hello':
            res.text('Hello world');
            return;
        default:
            // send one quick reply
            res.text('What you want?', {
                hello: 'Say hello world'
            })
    }
};

const processor = createProcessor(handler, {
    pageToken: 'stringhere',
    appSecret: 'botappsecret'
});

// app = express();

app.use('/bot', createRouter(processor));
```

## Processing asynchronous actions

How to deal with asynchronous action, when handlers are synchronous? Use **postBack(action[, data]))**.

```javascript
const handler = (req, res, postBack) => {
    switch (req.action()) {
        case 'downloaded':
            const { data, err } = req.action(true);

            if (err && err.code === 400) {
                res.text('Image size exceeded');
            } else if (err) {
                res.text('Upload failed');
            } else {
                res.text('Hello world');
            }
            return;
        default:
            if (req.isImage()) {
                bufferloader(req.attachmentUrl(), 1000000)
                    .then(buffer => postBack('downloaded', { data: buffer }))
                    .catch(err => postBack('donwloaded', { err }))
            }
    }
};
```


## Experimental: Router

Router is the way to handle strucured complex bots

```javascript
const { Router } = require('prg-chatbot');

const app = new Router();

// middleware
app.use('*', (req, res, postBack, next) => {
    res.typingOn()
        .wait();
    next();
});

app.use('actionName', (req, res) => {
    if (req.state.secondAttempt) {
        res.text('hello again');
    } else {
        res.text('hello')
            .setState({ secondAttempt: true });
    }
});

app.use('textAction', /keyword|two-words?/, (req, res) => {
    res.text('Welcome', {
        actionName: 'Say hello' // quick reply
    })
});

```

-----------------

# API
## Classes

<dl>
<dt><a href="#Request">Request</a></dt>
<dd></dd>
<dt><a href="#Responder">Responder</a></dt>
<dd></dd>
<dt><a href="#ButtonTemplate">ButtonTemplate</a> ⇐ <code>BaseTemplate</code></dt>
<dd></dd>
<dt><a href="#ReceiptTemplate">ReceiptTemplate</a> ⇐ <code>BaseTemplate</code></dt>
<dd></dd>
<dt><a href="#Router">Router</a> ⇐ <code><a href="#ReducerWrapper">ReducerWrapper</a></code></dt>
<dd></dd>
<dt><a href="#ReducerWrapper">ReducerWrapper</a> ⇐ <code>EventEmitter</code></dt>
<dd></dd>
<dt><a href="#Settings">Settings</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#bufferloader">bufferloader(url, [limit], [limitJustByBody], [redirCount])</a> ⇒</dt>
<dd><p>Downloads a file from url into a buffer. Supports size limits and redirects.</p>
</dd>
</dl>

<a name="Request"></a>

## Request
**Kind**: global class

* [Request](#Request)
    * [new Request()](#new_Request_new)
    * [.state](#Request+state)
    * [.isAttachment()](#Request+isAttachment) ⇒ <code>boolean</code>
    * [.isImage([attachmentIndex])](#Request+isImage) ⇒ <code>boolean</code>
    * [.isFile([attachmentIndex])](#Request+isFile) ⇒ <code>boolean</code>
    * [.attachment([attachmentIndex])](#Request+attachment) ⇒ <code>object</code> &#124; <code>null</code>
    * [.attachmentUrl([attachmentIndex])](#Request+attachmentUrl) ⇒ <code>string</code> &#124; <code>null</code>
    * [.isMessage()](#Request+isMessage) ⇒ <code>boolean</code>
    * [.text([tokenized])](#Request+text) ⇒ <code>string</code>
    * [.quickReply([getData])](#Request+quickReply) ⇒ <code>null</code> &#124; <code>string</code> &#124; <code>object</code>
    * [.isPostBack()](#Request+isPostBack) ⇒ <code>boolean</code>
    * [.action([getData])](#Request+action) ⇒ <code>null</code> &#124; <code>string</code> &#124; <code>object</code>
    * [.postBack([getData])](#Request+postBack) ⇒ <code>null</code> &#124; <code>string</code> &#124; <code>object</code>

<a name="new_Request_new"></a>

### new Request()
Instance of {Request} class is passed as first parameter of handler (req)

<a name="Request+state"></a>

### request.state
**Kind**: instance property of <code>[Request](#Request)</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | current state of the conversation |

<a name="Request+isAttachment"></a>

### request.isAttachment() ⇒ <code>boolean</code>
Checks, when message contains an attachment (file, image or location)

**Kind**: instance method of <code>[Request](#Request)</code>
<a name="Request+isImage"></a>

### request.isImage([attachmentIndex]) ⇒ <code>boolean</code>
Checks, when the attachment is an image

**Kind**: instance method of <code>[Request](#Request)</code>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [attachmentIndex] | <code>number</code> | <code>0</code> | use, when user sends more then one attachment |

<a name="Request+isFile"></a>

### request.isFile([attachmentIndex]) ⇒ <code>boolean</code>
Checks, when the attachment is a file

**Kind**: instance method of <code>[Request](#Request)</code>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [attachmentIndex] | <code>number</code> | <code>0</code> | use, when user sends more then one attachment |

<a name="Request+attachment"></a>

### request.attachment([attachmentIndex]) ⇒ <code>object</code> &#124; <code>null</code>
Returns whole attachment or null

**Kind**: instance method of <code>[Request](#Request)</code>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [attachmentIndex] | <code>number</code> | <code>0</code> | use, when user sends more then one attachment |

<a name="Request+attachmentUrl"></a>

### request.attachmentUrl([attachmentIndex]) ⇒ <code>string</code> &#124; <code>null</code>
Returns attachment URL

**Kind**: instance method of <code>[Request](#Request)</code>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [attachmentIndex] | <code>number</code> | <code>0</code> | use, when user sends more then one attachment |

<a name="Request+isMessage"></a>

### request.isMessage() ⇒ <code>boolean</code>
Returns true, when the request is text message, quick reply or attachment

**Kind**: instance method of <code>[Request](#Request)</code>
<a name="Request+text"></a>

### request.text([tokenized]) ⇒ <code>string</code>
Returns text of the message

**Kind**: instance method of <code>[Request](#Request)</code>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [tokenized] | <code>boolean</code> | <code>false</code> | when true, message is normalized to lowercase with `-` |

**Example**
```javascript
console.log(req.text(true)) // "can-you-help-me"
```
<a name="Request+quickReply"></a>

### request.quickReply([getData]) ⇒ <code>null</code> &#124; <code>string</code> &#124; <code>object</code>
Returns action or data of quick reply
When `getData` is `true`, object will be returned. Otherwise string or null.

**Kind**: instance method of <code>[Request](#Request)</code>

| Param | Type | Default |
| --- | --- | --- |
| [getData] | <code>boolean</code> | <code>false</code> |

**Example**
```javascript
typeof res.quickReply() === 'string' || res.quickReply() === null;
typeof res.quickReply(true) === 'object';
```
<a name="Request+isPostBack"></a>

### request.isPostBack() ⇒ <code>boolean</code>
Returns true, if request is the postback

**Kind**: instance method of <code>[Request](#Request)</code>
<a name="Request+action"></a>

### request.action([getData]) ⇒ <code>null</code> &#124; <code>string</code> &#124; <code>object</code>
Returns action of the postback or quickreply
When `getData` is `true`, object will be returned. Otherwise string or null.

1. the postback is checked
2. the quick reply is checked

**Kind**: instance method of <code>[Request](#Request)</code>

| Param | Type | Default |
| --- | --- | --- |
| [getData] | <code>boolean</code> | <code>false</code> |

**Example**
```javascript
typeof res.action() === 'string' || res.action() === null;
typeof res.action(true) === 'object';
```
<a name="Request+postBack"></a>

### request.postBack([getData]) ⇒ <code>null</code> &#124; <code>string</code> &#124; <code>object</code>
Returns action or data of postback
When `getData` is `true`, object will be returned. Otherwise string or null.

**Kind**: instance method of <code>[Request](#Request)</code>

| Param | Type | Default |
| --- | --- | --- |
| [getData] | <code>boolean</code> | <code>false</code> |

**Example**
```javascript
typeof res.postBack() === 'string' || res.postBack() === null;
typeof res.postBack(true) === 'object';
```
<a name="Responder"></a>

## Responder
**Kind**: global class

* [Responder](#Responder)
    * [new Responder()](#new_Responder_new)
    * [.text(text, [quickReplys])](#Responder+text) ⇒ <code>this</code>
    * [.setState(object)](#Responder+setState) ⇒ <code>this</code>
    * [.expected(action)](#Responder+expected) ⇒ <code>this</code>
    * [.image(imageUrl)](#Responder+image) ⇒ <code>this</code>
    * [.wait([ms])](#Responder+wait) ⇒ <code>this</code>
    * [.typingOn()](#Responder+typingOn) ⇒ <code>this</code>
    * [.typingOff()](#Responder+typingOff) ⇒ <code>this</code>
    * [.seen()](#Responder+seen) ⇒ <code>this</code>
    * [.receipt(recipientName, [paymentMethod], [currency], [uniqueCode])](#Responder+receipt) ⇒ <code>[ReceiptTemplate](#ReceiptTemplate)</code>
    * [.button(text)](#Responder+button) ⇒ <code>[ButtonTemplate](#ButtonTemplate)</code>

<a name="new_Responder_new"></a>

### new Responder()
Instance of responder is passed as second parameter of handler (res)

<a name="Responder+text"></a>

### responder.text(text, [quickReplys]) ⇒ <code>this</code>
Send text as a response

**Kind**: instance method of <code>[Responder](#Responder)</code>

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | text to send to user, can contain placeholders (%s) |
| [quickReplys] | <code>object.&lt;string, string&gt;</code> |  |

**Example**
```javascript
res.text('Hello %s', name, {
    action: 'Quick reply',
    complexAction: {
        label: 'Another quick reply',
        someData: 'Will be included in payload data'
    }
})
```
<a name="Responder+setState"></a>

### responder.setState(object) ⇒ <code>this</code>
Sets new attributes to state (with Object.assign())

**Kind**: instance method of <code>[Responder](#Responder)</code>

| Param | Type |
| --- | --- |
| object | <code>object</code> |

**Example**
```javascript
res.setState({ visited: true });
```
<a name="Responder+expected"></a>

### responder.expected(action) ⇒ <code>this</code>
When user writes some text as reply, it will be processed as action

**Kind**: instance method of <code>[Responder](#Responder)</code>

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | desired action |

<a name="Responder+image"></a>

### responder.image(imageUrl) ⇒ <code>this</code>
Sends image as response. Requires appUrl option to send images from server

**Kind**: instance method of <code>[Responder](#Responder)</code>

| Param | Type | Description |
| --- | --- | --- |
| imageUrl | <code>string</code> | relative or absolute url |

**Example**
```javascript
// image on same server (appUrl option)
res.image('/img/foo.png');

// image at url
res.image('https://google.com/img/foo.png');
```
<a name="Responder+wait"></a>

### responder.wait([ms]) ⇒ <code>this</code>
Sets delay between two responses

**Kind**: instance method of <code>[Responder](#Responder)</code>

| Param | Type | Default |
| --- | --- | --- |
| [ms] | <code>number</code> | <code>700</code> |

<a name="Responder+typingOn"></a>

### responder.typingOn() ⇒ <code>this</code>
Sends "typing..." information

**Kind**: instance method of <code>[Responder](#Responder)</code>
<a name="Responder+typingOff"></a>

### responder.typingOff() ⇒ <code>this</code>
Stops "typing..." information

**Kind**: instance method of <code>[Responder](#Responder)</code>
<a name="Responder+seen"></a>

### responder.seen() ⇒ <code>this</code>
Reports last message from user as seen

**Kind**: instance method of <code>[Responder](#Responder)</code>
<a name="Responder+receipt"></a>

### responder.receipt(recipientName, [paymentMethod], [currency], [uniqueCode]) ⇒ <code>[ReceiptTemplate](#ReceiptTemplate)</code>
Sends Receipt template

**Kind**: instance method of <code>[Responder](#Responder)</code>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| recipientName | <code>string</code> |  |  |
| [paymentMethod] | <code>string</code> | <code>&quot;&#x27;Cash&#x27;&quot;</code> | should not contain more then 4 numbers |
| [currency] | <code>string</code> | <code>&quot;&#x27;USD&#x27;&quot;</code> | sets right currency |
| [uniqueCode] | <code>string</code> | <code>null</code> | when omitted, will be generated randomly |

**Example**
```javascript
res.receipt('Name', 'Cash', 'CZK', '1')
    .addElement('Element name', 1, 2, '/inside.png', 'text')
    .send();
```
<a name="Responder+button"></a>

### responder.button(text) ⇒ <code>[ButtonTemplate](#ButtonTemplate)</code>
Sends nice button template. It can redirect user to server with token in url

**Kind**: instance method of <code>[Responder](#Responder)</code>

| Param | Type |
| --- | --- |
| text | <code>string</code> |

**Example**
```javascript
res.button('Hello')
    .postBackButton('Text', 'action')
    .urlButton('Url button', '/internal', true) // opens webview with token
    .urlButton('Other button', 'https://goo.gl') // opens in internal browser
    .send();
```
<a name="ButtonTemplate"></a>

## ButtonTemplate ⇐ <code>BaseTemplate</code>
**Kind**: global class
**Extends:** <code>BaseTemplate</code>

* [ButtonTemplate](#ButtonTemplate) ⇐ <code>BaseTemplate</code>
    * [new ButtonTemplate()](#new_ButtonTemplate_new)
    * [.urlButton(title, url, hasExtension, [webviewHeight])](#ButtonTemplate+urlButton) ⇒ <code>this</code>
    * [.postBackButton(title, action, [data])](#ButtonTemplate+postBackButton) ⇒ <code>this</code>

<a name="new_ButtonTemplate_new"></a>

### new ButtonTemplate()
Helps with creating of button template
Instance of button template is returned by {Responder}

<a name="ButtonTemplate+urlButton"></a>

### buttonTemplate.urlButton(title, url, hasExtension, [webviewHeight]) ⇒ <code>this</code>
Adds button. When `hasExtension` is set to `true`, url will contain hash like:
`#token=foo&senderId=23344`

**Kind**: instance method of <code>[ButtonTemplate](#ButtonTemplate)</code>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| title | <code>string</code> |  | button text |
| url | <code>string</code> |  | button url |
| hasExtension | <code>boolean</code> |  | includes token in url |
| [webviewHeight] | <code>string</code> | <code>null</code> | compact|tall|full |

<a name="ButtonTemplate+postBackButton"></a>

### buttonTemplate.postBackButton(title, action, [data]) ⇒ <code>this</code>
Adds button, which makes another action

**Kind**: instance method of <code>[ButtonTemplate](#ButtonTemplate)</code>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| title | <code>string</code> |  | Button title |
| action | <code>string</code> |  | Button action (can be absolute or relative) |
| [data] | <code>object</code> | <code>{}</code> | Action data |

<a name="ReceiptTemplate"></a>

## ReceiptTemplate ⇐ <code>BaseTemplate</code>
**Kind**: global class
**Extends:** <code>BaseTemplate</code>

* [ReceiptTemplate](#ReceiptTemplate) ⇐ <code>BaseTemplate</code>
    * [new ReceiptTemplate()](#new_ReceiptTemplate_new)
    * [.addElement(title, [price], [quantity], [image], [subtitle])](#ReceiptTemplate+addElement) ⇒ <code>this</code>

<a name="new_ReceiptTemplate_new"></a>

### new ReceiptTemplate()
Provides fluent interface to make nice Receipts
Instance of button template is returned by {Responder}

<a name="ReceiptTemplate+addElement"></a>

### receiptTemplate.addElement(title, [price], [quantity], [image], [subtitle]) ⇒ <code>this</code>
Adds item to receipt

**Kind**: instance method of <code>[ReceiptTemplate](#ReceiptTemplate)</code>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| title | <code>string</code> |  |  |
| [price] | <code>number</code> | <code>0</code> | a item price |
| [quantity] | <code>number</code> | <code></code> | amount of items |
| [image] | <code>string</code> | <code>null</code> | image of item |
| [subtitle] | <code>string</code> | <code>null</code> | optional subtitle |

<a name="Router"></a>

## Router ⇐ <code>[ReducerWrapper](#ReducerWrapper)</code>
**Kind**: global class
**Extends:** <code>[ReducerWrapper](#ReducerWrapper)</code>

* [Router](#Router) ⇐ <code>[ReducerWrapper](#ReducerWrapper)</code>
    * [new Router()](#new_Router_new)
    * [.use([action], [pattern], reducer)](#Router+use) ⇒ <code>Object</code>
    * [.reduce(req, res, postBack)](#ReducerWrapper+reduce)

<a name="new_Router_new"></a>

### new Router()
Cascading router

<a name="Router+use"></a>

### router.use([action], [pattern], reducer) ⇒ <code>Object</code>
Appends middleware, action handler or another router

**Kind**: instance method of <code>[Router](#Router)</code>

| Param | Type | Description |
| --- | --- | --- |
| [action] | <code>string</code> | name of the action |
| [pattern] | <code>RegExp</code> &#124; <code>string</code> &#124; <code>function</code> |  |
| reducer | <code>function</code> &#124; <code>[Router](#Router)</code> |  |

**Example**
```javascript
// middleware
router.use((req, res, postBack, next) => {
    next(); // strictly synchronous
});

// route with matching regexp
router.use('action', /help/, (req, res) => {
    res.text('Hello!');
});

// route with matching function
router.use('action', req => req.text() === 'a', (req, res) => {
    res.text('Hello!');
});

// append router with exit action
router.use('/path', subRouter)
   .next('exitAction', (data, req, postBack) => {
       postBack('anotherAction', { someData: true })
   });
```
<a name="ReducerWrapper+reduce"></a>

### router.reduce(req, res, postBack)
Reducer function

**Kind**: instance method of <code>[Router](#Router)</code>
**Overrides:** <code>[reduce](#ReducerWrapper+reduce)</code>

| Param | Type |
| --- | --- |
| req | <code>[Request](#Request)</code> |
| res | <code>[Responder](#Responder)</code> |
| postBack | <code>function</code> |

<a name="ReducerWrapper"></a>

## ReducerWrapper ⇐ <code>EventEmitter</code>
**Kind**: global class
**Extends:** <code>EventEmitter</code>
**Emits**: <code>ReducerWrapper#event:action</code>

* [ReducerWrapper](#ReducerWrapper) ⇐ <code>EventEmitter</code>
    * [new ReducerWrapper()](#new_ReducerWrapper_new)
    * _instance_
        * [.reduce(req, res, postBack)](#ReducerWrapper+reduce)
    * _static_
        * [.ReducerWrapper](#ReducerWrapper.ReducerWrapper)
            * [new ReducerWrapper([reduce])](#new_ReducerWrapper.ReducerWrapper_new)

<a name="new_ReducerWrapper_new"></a>

### new ReducerWrapper()
Solution for catching events. This is useful for analytics.

**Example**
```javascript
const reducer = new ReducerWrapper((req, res) => {
    res.text('Hello');
});

reducer.on('action', (senderId, processedAction, text, req) => {
    // log action
});
```
<a name="ReducerWrapper+reduce"></a>

### reducerWrapper.reduce(req, res, postBack)
Reducer function

**Kind**: instance method of <code>[ReducerWrapper](#ReducerWrapper)</code>

| Param | Type |
| --- | --- |
| req | <code>[Request](#Request)</code> |
| res | <code>[Responder](#Responder)</code> |
| postBack | <code>function</code> |

<a name="ReducerWrapper.ReducerWrapper"></a>

### ReducerWrapper.ReducerWrapper
**Kind**: static class of <code>[ReducerWrapper](#ReducerWrapper)</code>
<a name="new_ReducerWrapper.ReducerWrapper_new"></a>

#### new ReducerWrapper([reduce])
Creates an instance of ReducerWrapper.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [reduce] | <code>function</code> | <code>o =&gt; o</code> | the handler function |

<a name="Settings"></a>

## Settings
**Kind**: global class

* [Settings](#Settings)
    * [new Settings()](#new_Settings_new)
    * _instance_
        * [.greeting([text])](#Settings+greeting) ⇒ <code>this</code>
        * [.getStartedButton([payload])](#Settings+getStartedButton) ⇒ <code>this</code>
        * [.whitelistDomain(domain)](#Settings+whitelistDomain) ⇒ <code>this</code>
    * _static_
        * [.Settings](#Settings.Settings)
            * [new Settings(token, [log])](#new_Settings.Settings_new)

<a name="new_Settings_new"></a>

### new Settings()
Utility, which helps us to set up chatbot behavior

<a name="Settings+greeting"></a>

### settings.greeting([text]) ⇒ <code>this</code>
Sets or clears bot's greeting

**Kind**: instance method of <code>[Settings](#Settings)</code>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [text] | <code>string</code> | <code>false</code> | leave empty to clear |

<a name="Settings+getStartedButton"></a>

### settings.getStartedButton([payload]) ⇒ <code>this</code>
Sets up the Get Started Button

**Kind**: instance method of <code>[Settings](#Settings)</code>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [payload] | <code>string</code> &#124; <code>object</code> | <code>false</code> | leave blank to remove button, or provide the action |

**Example**
```javascript
const settings = new Settings(config.facebook.pageToken);
settings.getStartedButton('/start'); // just an action
```
<a name="Settings+whitelistDomain"></a>

### settings.whitelistDomain(domain) ⇒ <code>this</code>
Useful for using facebook extension in webviews

**Kind**: instance method of <code>[Settings](#Settings)</code>

| Param | Type |
| --- | --- |
| domain | <code>string</code> &#124; <code>Array.&lt;string&gt;</code> |

<a name="Settings.Settings"></a>

### Settings.Settings
**Kind**: static class of <code>[Settings](#Settings)</code>
<a name="new_Settings.Settings_new"></a>

#### new Settings(token, [log])
Creates an instance of Settings.


| Param | Type |
| --- | --- |
| token | <code>string</code> |
| [log] | <code>Object</code> |

<a name="bufferloader"></a>

## bufferloader(url, [limit], [limitJustByBody], [redirCount]) ⇒
Downloads a file from url into a buffer. Supports size limits and redirects.

**Kind**: global function
**Returns**: Promise.<Buffer>

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  |  |
| [limit] | <code>number</code> | <code>0</code> | limit in bytes |
| [limitJustByBody] | <code>boolean</code> | <code>false</code> | when true, content size in header is ignored |
| [redirCount] | <code>number</code> | <code>3</code> | maximmum amount of redirects |

**Example**
```javascript
router.use('*', (req, res, postBack) => {
    if (req.isFile()) {
        bufferloader(req.attachmentUrl())
            .then(buffer => postBack('downloaded', { data: buffer }))
            .catch(err => postBack('donwloaded', { err }))
    }
});
```
