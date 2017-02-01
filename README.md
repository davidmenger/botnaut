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
                const resolve = postBack.wait(); // usefull for tests
                bufferloader(req.attachmentUrl(), 1000000)
                    .then(buffer => resolve('downloaded', { data: buffer }))
                    .catch(err => resolve('donwloaded', { err }))
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
<dt><a href="#GenericTemplate">GenericTemplate</a> ⇐ <code><a href="#ButtonTemplate">ButtonTemplate</a></code></dt>
<dd></dd>
<dt><a href="#Router">Router</a> ⇐ <code><a href="#ReducerWrapper">ReducerWrapper</a></code></dt>
<dd></dd>
<dt><a href="#ReducerWrapper">ReducerWrapper</a> ⇐ <code>EventEmitter</code></dt>
<dd></dd>
<dt><a href="#Settings">Settings</a></dt>
<dd></dd>
<dt><a href="#Tester">Tester</a></dt>
<dd></dd>
<dt><a href="#ResponseAssert">ResponseAssert</a></dt>
<dd></dd>
<dt><a href="#AnyResponseAssert">AnyResponseAssert</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#bufferloader">bufferloader(url, [limit], [limitJustByBody], [redirCount])</a> ⇒</dt>
<dd><p>Downloads a file from url into a buffer. Supports size limits and redirects.</p>
</dd>
<dt><a href="#attachmentType">attachmentType(response, type, [message])</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks attachment type</p>
</dd>
<dt><a href="#isText">isText(response, [message])</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks, that response is a text</p>
</dd>
<dt><a href="#contains">contains(response, search, [message])</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks, that text contain a message</p>
</dd>
<dt><a href="#quickReplyAction">quickReplyAction(response, action, [message])</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks quick response action</p>
</dd>
<dt><a href="#templateType">templateType(response, expectedType, [message])</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks template type</p>
</dd>
<dt><a href="#waiting">waiting(response, [message])</a> ⇒ <code>boolean</code></dt>
<dd><p>Looks for waiting message</p>
</dd>
</dl>

<a name="Request"></a>

## Request
**Kind**: global class  

* [Request](#Request)
    * [new Request()](#new_Request_new)
    * [.senderId](#Request+senderId)
    * [.recipientId](#Request+recipientId)
    * [.pageId](#Request+pageId)
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

<a name="Request+senderId"></a>

### request.senderId
**Kind**: instance property of <code>[Request](#Request)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| senderId | <code>string</code> | sender.id from the event |

<a name="Request+recipientId"></a>

### request.recipientId
**Kind**: instance property of <code>[Request](#Request)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| recipientId | <code>string</code> | recipient.id from the event |

<a name="Request+pageId"></a>

### request.pageId
**Kind**: instance property of <code>[Request](#Request)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| pageId | <code>string</code> | page identifier from the event |

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
3. expected keywords are checked
4. expected state is checked

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
    * [.genericTemplate()](#Responder+genericTemplate) ⇒ <code>[GenericTemplate](#GenericTemplate)</code>

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
        title: 'Another quick reply', // required
        match: 'string' || /regexp/, // optional
        someData: 'Will be included in payload data' // optional
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
| [ms] | <code>number</code> | <code>600</code> | 

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
<a name="Responder+genericTemplate"></a>

### responder.genericTemplate() ⇒ <code>[GenericTemplate](#GenericTemplate)</code>
Creates a generic template

**Kind**: instance method of <code>[Responder](#Responder)</code>  
**Example**  
```javascript
res.genericTemplate()
    .addElement('title', 'subtitle')
        .setElementImage('/local.png')
        .setElementUrl('https://www.seznam.cz')
        .postBackButton('Button title', 'action', { actionData: 1 })
    .addElement('another', 'subtitle')
        .setElementImage('https://goo.gl/image.png')
        .setElementAction('action', { actionData: 1 })
        .urlButton('Local link with extension', '/local/path', true, 'compact')
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

<a name="GenericTemplate"></a>

## GenericTemplate ⇐ <code>[ButtonTemplate](#ButtonTemplate)</code>
**Kind**: global class  
**Extends:** <code>[ButtonTemplate](#ButtonTemplate)</code>  

* [GenericTemplate](#GenericTemplate) ⇐ <code>[ButtonTemplate](#ButtonTemplate)</code>
    * [new GenericTemplate()](#new_GenericTemplate_new)
    * [.addElement(title, [subtitle], [dontTranslate])](#GenericTemplate+addElement) ⇒ <code>this</code>
    * [.setElementUrl(url, [hasExtension])](#GenericTemplate+setElementUrl) ⇒ <code>this</code>
    * [.setElementImage(image)](#GenericTemplate+setElementImage) ⇒ <code>this</code>
    * [.setElementAction(url, hasExtension, [webviewHeight])](#GenericTemplate+setElementAction)
    * [.urlButton(title, url, hasExtension, [webviewHeight])](#ButtonTemplate+urlButton) ⇒ <code>this</code>
    * [.postBackButton(title, action, [data])](#ButtonTemplate+postBackButton) ⇒ <code>this</code>

<a name="new_GenericTemplate_new"></a>

### new GenericTemplate()
Generic template utility

<a name="GenericTemplate+addElement"></a>

### genericTemplate.addElement(title, [subtitle], [dontTranslate]) ⇒ <code>this</code>
Adds element to generic template

**Kind**: instance method of <code>[GenericTemplate](#GenericTemplate)</code>  

| Param | Type | Default |
| --- | --- | --- |
| title | <code>string</code> |  | 
| [subtitle] | <code>string</code> | <code>null</code> | 
| [dontTranslate] | <code>boolean</code> | <code>false</code> | 

<a name="GenericTemplate+setElementUrl"></a>

### genericTemplate.setElementUrl(url, [hasExtension]) ⇒ <code>this</code>
Sets url of recently added element

**Kind**: instance method of <code>[GenericTemplate](#GenericTemplate)</code>  

| Param | Type | Default |
| --- | --- | --- |
| url | <code>any</code> |  | 
| [hasExtension] | <code>boolean</code> | <code>false</code> | 

<a name="GenericTemplate+setElementImage"></a>

### genericTemplate.setElementImage(image) ⇒ <code>this</code>
Sets image of recently added element

**Kind**: instance method of <code>[GenericTemplate](#GenericTemplate)</code>  

| Param | Type |
| --- | --- |
| image | <code>string</code> | 

<a name="GenericTemplate+setElementAction"></a>

### genericTemplate.setElementAction(url, hasExtension, [webviewHeight])
Sets default action of recently added element

**Kind**: instance method of <code>[GenericTemplate](#GenericTemplate)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  | button url |
| hasExtension | <code>boolean</code> | <code>false</code> | includes token in url |
| [webviewHeight] | <code>string</code> | <code>null</code> | compact|tall|full |

<a name="ButtonTemplate+urlButton"></a>

### genericTemplate.urlButton(title, url, hasExtension, [webviewHeight]) ⇒ <code>this</code>
Adds button. When `hasExtension` is set to `true`, url will contain hash like:
`#token=foo&senderId=23344`

**Kind**: instance method of <code>[GenericTemplate](#GenericTemplate)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| title | <code>string</code> |  | button text |
| url | <code>string</code> |  | button url |
| hasExtension | <code>boolean</code> |  | includes token in url |
| [webviewHeight] | <code>string</code> | <code>null</code> | compact|tall|full |

<a name="ButtonTemplate+postBackButton"></a>

### genericTemplate.postBackButton(title, action, [data]) ⇒ <code>this</code>
Adds button, which makes another action

**Kind**: instance method of <code>[GenericTemplate](#GenericTemplate)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| title | <code>string</code> |  | Button title |
| action | <code>string</code> |  | Button action (can be absolute or relative) |
| [data] | <code>object</code> | <code>{}</code> | Action data |

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
   .next('exitAction', (data, req, res, postBack, next) => {
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

<a name="Tester"></a>

## Tester
**Kind**: global class  

* [Tester](#Tester)
    * [new Tester()](#new_Tester_new)
    * _instance_
        * [.res([index])](#Tester+res) ⇒ <code>[ResponseAssert](#ResponseAssert)</code>
        * [.any()](#Tester+any) ⇒ <code>[AnyResponseAssert](#AnyResponseAssert)</code>
        * [.lastRes()](#Tester+lastRes) ⇒ <code>[ResponseAssert](#ResponseAssert)</code>
        * [.passedAction(path)](#Tester+passedAction) ⇒ <code>this</code>
        * [.getState()](#Tester+getState) ⇒ <code>object</code>
        * [.setState([state])](#Tester+setState)
        * [.text(text)](#Tester+text) ⇒ <code>Promise</code>
        * [.quickReply(action, [data])](#Tester+quickReply) ⇒ <code>Promise</code>
        * [.postBack(action, [data])](#Tester+postBack) ⇒ <code>Promise</code>
    * _static_
        * [.Tester](#Tester.Tester)
            * [new Tester(reducer, [senderId], [processorOptions], [storage])](#new_Tester.Tester_new)

<a name="new_Tester_new"></a>

### new Tester()
Utility for testing requests

<a name="Tester+res"></a>

### tester.res([index]) ⇒ <code>[ResponseAssert](#ResponseAssert)</code>
Returns single response asserter

**Kind**: instance method of <code>[Tester](#Tester)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [index] | <code>number</code> | <code>0</code> | response index |

<a name="Tester+any"></a>

### tester.any() ⇒ <code>[AnyResponseAssert](#AnyResponseAssert)</code>
Returns any response asserter

**Kind**: instance method of <code>[Tester](#Tester)</code>  
<a name="Tester+lastRes"></a>

### tester.lastRes() ⇒ <code>[ResponseAssert](#ResponseAssert)</code>
Returns last response asserter

**Kind**: instance method of <code>[Tester](#Tester)</code>  
<a name="Tester+passedAction"></a>

### tester.passedAction(path) ⇒ <code>this</code>
Checks, that app past the action

**Kind**: instance method of <code>[Tester](#Tester)</code>  

| Param | Type |
| --- | --- |
| path | <code>string</code> | 

<a name="Tester+getState"></a>

### tester.getState() ⇒ <code>object</code>
Returns state

**Kind**: instance method of <code>[Tester](#Tester)</code>  
<a name="Tester+setState"></a>

### tester.setState([state])
Sets state with `Object.assign()`

**Kind**: instance method of <code>[Tester](#Tester)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [state] | <code>object</code> | <code>{}</code> | 

<a name="Tester+text"></a>

### tester.text(text) ⇒ <code>Promise</code>
Makes text request

**Kind**: instance method of <code>[Tester](#Tester)</code>  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 

<a name="Tester+quickReply"></a>

### tester.quickReply(action, [data]) ⇒ <code>Promise</code>
Send quick reply

**Kind**: instance method of <code>[Tester](#Tester)</code>  

| Param | Type | Default |
| --- | --- | --- |
| action | <code>string</code> |  | 
| [data] | <code>object</code> | <code>{}</code> | 

<a name="Tester+postBack"></a>

### tester.postBack(action, [data]) ⇒ <code>Promise</code>
Sends postback

**Kind**: instance method of <code>[Tester](#Tester)</code>  

| Param | Type | Default |
| --- | --- | --- |
| action | <code>string</code> |  | 
| [data] | <code>object</code> | <code>{}</code> | 

<a name="Tester.Tester"></a>

### Tester.Tester
**Kind**: static class of <code>[Tester](#Tester)</code>  
<a name="new_Tester.Tester_new"></a>

#### new Tester(reducer, [senderId], [processorOptions], [storage])
Creates an instance of Tester.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| reducer | <code>[Router](#Router)</code> &#124; <code>[ReducerWrapper](#ReducerWrapper)</code> &#124; <code>function</code> |  |  |
| [senderId] | <code>string</code> | <code>null</code> |  |
| [processorOptions] | <code>object</code> | <code>{}</code> | options for Processor |
| [storage] | <code>MemoryStateStorage</code> |  | place to override the storage |

<a name="ResponseAssert"></a>

## ResponseAssert
**Kind**: global class  

* [ResponseAssert](#ResponseAssert)
    * [new ResponseAssert()](#new_ResponseAssert_new)
    * _instance_
        * [.contains(search)](#ResponseAssert+contains) ⇒ <code>this</code>
        * [.quickReplyAction(action)](#ResponseAssert+quickReplyAction) ⇒ <code>this</code>
        * [.templateType(type)](#ResponseAssert+templateType) ⇒ <code>this</code>
        * [.attachmentType(type)](#ResponseAssert+attachmentType) ⇒ <code>this</code>
    * _static_
        * [.AnyResponseAssert#contains(search)](#ResponseAssert.AnyResponseAssert+contains) ⇒ <code>this</code>
        * [.AnyResponseAssert#quickReplyAction(action)](#ResponseAssert.AnyResponseAssert+quickReplyAction) ⇒ <code>this</code>
        * [.AnyResponseAssert#templateType(type)](#ResponseAssert.AnyResponseAssert+templateType) ⇒ <code>this</code>
        * [.AnyResponseAssert#attachmentType(type)](#ResponseAssert.AnyResponseAssert+attachmentType) ⇒ <code>this</code>

<a name="new_ResponseAssert_new"></a>

### new ResponseAssert()
Utility for asserting single response

<a name="ResponseAssert+contains"></a>

### responseAssert.contains(search) ⇒ <code>this</code>
Checks, that response contains text

**Kind**: instance method of <code>[ResponseAssert](#ResponseAssert)</code>  

| Param | Type |
| --- | --- |
| search | <code>string</code> | 

<a name="ResponseAssert+quickReplyAction"></a>

### responseAssert.quickReplyAction(action) ⇒ <code>this</code>
Checks quick response action

**Kind**: instance method of <code>[ResponseAssert](#ResponseAssert)</code>  

| Param | Type |
| --- | --- |
| action | <code>string</code> | 

<a name="ResponseAssert+templateType"></a>

### responseAssert.templateType(type) ⇒ <code>this</code>
Checks template type

**Kind**: instance method of <code>[ResponseAssert](#ResponseAssert)</code>  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 

<a name="ResponseAssert+attachmentType"></a>

### responseAssert.attachmentType(type) ⇒ <code>this</code>
Checks attachment type

**Kind**: instance method of <code>[ResponseAssert](#ResponseAssert)</code>  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 

<a name="ResponseAssert.AnyResponseAssert+contains"></a>

### ResponseAssert.AnyResponseAssert#contains(search) ⇒ <code>this</code>
Checks, that response contains text

**Kind**: static method of <code>[ResponseAssert](#ResponseAssert)</code>  

| Param | Type |
| --- | --- |
| search | <code>string</code> | 

<a name="ResponseAssert.AnyResponseAssert+quickReplyAction"></a>

### ResponseAssert.AnyResponseAssert#quickReplyAction(action) ⇒ <code>this</code>
Checks quick response action

**Kind**: static method of <code>[ResponseAssert](#ResponseAssert)</code>  

| Param | Type |
| --- | --- |
| action | <code>string</code> | 

<a name="ResponseAssert.AnyResponseAssert+templateType"></a>

### ResponseAssert.AnyResponseAssert#templateType(type) ⇒ <code>this</code>
Checks template type

**Kind**: static method of <code>[ResponseAssert](#ResponseAssert)</code>  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 

<a name="ResponseAssert.AnyResponseAssert+attachmentType"></a>

### ResponseAssert.AnyResponseAssert#attachmentType(type) ⇒ <code>this</code>
Checks attachment type

**Kind**: static method of <code>[ResponseAssert](#ResponseAssert)</code>  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 

<a name="AnyResponseAssert"></a>

## AnyResponseAssert
**Kind**: global class  
<a name="new_AnyResponseAssert_new"></a>

### new AnyResponseAssert()
Utility for searching among responses

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
<a name="attachmentType"></a>

## attachmentType(response, type, [message]) ⇒ <code>boolean</code>
Checks attachment type

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| response | <code>object</code> |  |  |
| type | <code>string</code> |  |  |
| [message] | <code>string</code> &#124; <code>false</code> | <code>&quot;&#x27;Attachment type does not match&#x27;&quot;</code> | use false for no asserts |

<a name="isText"></a>

## isText(response, [message]) ⇒ <code>boolean</code>
Checks, that response is a text

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| response | <code>object</code> |  |  |
| [message] | <code>string</code> &#124; <code>false</code> | <code>&quot;&#x27;Should be a text&#x27;&quot;</code> | use false for no asserts |

<a name="contains"></a>

## contains(response, search, [message]) ⇒ <code>boolean</code>
Checks, that text contain a message

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| response | <code>object</code> |  |  |
| search | <code>string</code> |  |  |
| [message] | <code>string</code> &#124; <code>false</code> | <code>&quot;&#x27;Should contain a text&#x27;&quot;</code> | use false for no asserts |

<a name="quickReplyAction"></a>

## quickReplyAction(response, action, [message]) ⇒ <code>boolean</code>
Checks quick response action

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| response | <code>object</code> |  |  |
| action | <code>string</code> |  |  |
| [message] | <code>string</code> &#124; <code>false</code> | <code>&quot;&#x27;Should contain the action&#x27;&quot;</code> | use false for no asserts |

<a name="templateType"></a>

## templateType(response, expectedType, [message]) ⇒ <code>boolean</code>
Checks template type

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| response | <code>object</code> |  |  |
| expectedType | <code>string</code> |  |  |
| [message] | <code>string</code> &#124; <code>false</code> | <code>&quot;&#x27;Template type does not match&#x27;&quot;</code> | use false for no asserts |

<a name="waiting"></a>

## waiting(response, [message]) ⇒ <code>boolean</code>
Looks for waiting message

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| response | <code>object</code> |  |  |
| [message] | <code>string</code> &#124; <code>false</code> | <code>&quot;&#x27;Should be waiting placeholder&#x27;&quot;</code> | use false for no asserts |

