{% raw %}<div id="Responder">&nbsp;</div>{% endraw %}

## Responder
**Kind**: global class  

* [Responder](#Responder)
    * [new Responder()](#new_Responder_new)
    * [.data](#Responder_data) : <code>object</code>
    * [.setMessgingType(messagingType, [tag])](#Responder_setMessgingType) ⇒ <code>this</code>
    * [.isResponseType()](#Responder_isResponseType) ⇒ <code>boolean</code>
    * [.setData(data)](#Responder_setData) ⇒ <code>this</code>
    * [.text(text, [quickReplies])](#Responder_text) ⇒ <code>this</code>
    * [.setState(object)](#Responder_setState) ⇒ <code>this</code>
    * [.addQuickReply(action, title, [data], [prepend])](#Responder_addQuickReply)
    * [.expected(action)](#Responder_expected) ⇒ <code>this</code>
    * [.toAbsoluteAction(action)](#Responder_toAbsoluteAction) ⇒ <code>string</code>
    * [.image(imageUrl, [reusable])](#Responder_image) ⇒ <code>this</code>
    * [.video(videoUrl, [reusable])](#Responder_video) ⇒ <code>this</code>
    * [.file(fileUrl, [reusable])](#Responder_file) ⇒ <code>this</code>
    * [.wait([ms])](#Responder_wait) ⇒ <code>this</code>
    * [.typingOn()](#Responder_typingOn) ⇒ <code>this</code>
    * [.typingOff()](#Responder_typingOff) ⇒ <code>this</code>
    * [.seen()](#Responder_seen) ⇒ <code>this</code>
    * [.passThread(targetAppId, [data])](#Responder_passThread) ⇒ <code>this</code>
    * [.receipt(recipientName, [paymentMethod], [currency], [uniqueCode])](#Responder_receipt) ⇒ <code>ReceiptTemplate</code>
    * [.button(text)](#Responder_button) ⇒ <code>ButtonTemplate</code>
    * [.genericTemplate([shareable], [isSquare])](#Responder_genericTemplate) ⇒ <code>GenericTemplate</code>
    * [.list([topElementStyle])](#Responder_list) ⇒ <code>ListTemplate</code>

{% raw %}<div id="new_Responder_new">&nbsp;</div>{% endraw %}

### new Responder()
Instance of responder is passed as second parameter of handler (res)

{% raw %}<div id="Responder_data">&nbsp;</div>{% endraw %}

### responder.data : <code>object</code>
**Kind**: instance property of [<code>Responder</code>](#Responder)  
{% raw %}<div id="Responder_setMessgingType">&nbsp;</div>{% endraw %}

### responder.setMessgingType(messagingType, [tag]) ⇒ <code>this</code>
**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type | Default |
| --- | --- | --- |
| messagingType | <code>string</code> |  | 
| [tag] | <code>string</code> | <code>null</code> | 

{% raw %}<div id="Responder_isResponseType">&nbsp;</div>{% endraw %}

### responder.isResponseType() ⇒ <code>boolean</code>
Returns true, when responder is not sending an update (notification) message

**Kind**: instance method of [<code>Responder</code>](#Responder)  
{% raw %}<div id="Responder_setData">&nbsp;</div>{% endraw %}

### responder.setData(data) ⇒ <code>this</code>
Set temporary data to responder, which are persisted through single event

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type |
| --- | --- |
| data | <code>object</code> | 

**Example**  
```javascript
bot.use('foo', (req, res, postBack) => {
    res.setData({ a: 1 });
    postBack('bar');
});

bot.use('bar', (req, res) => {
    res.data.a; // === 1 from postback
});
```
{% raw %}<div id="Responder_text">&nbsp;</div>{% endraw %}

### responder.text(text, [quickReplies]) ⇒ <code>this</code>
Send text as a response

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | text to send to user, can contain placeholders (%s) |
| [quickReplies] | <code>Object.&lt;string, string&gt;</code> \| <code>Array.&lt;Object&gt;</code> |  |

**Example**  
```javascript
// simply
res.text('Hello %s', name, {
    action: 'Quick reply',
    another: 'Another quick reply'
});

// complex
res.text('Hello %s', name, [
    { action: 'action', title: 'Quick reply' },
    {
        action: 'complexAction', // required
        title: 'Another quick reply', // required
        match: 'string' || /regexp/, // optional
        someData: 'Will be included in payload data' // optional
    }
]);
```
{% raw %}<div id="Responder_setState">&nbsp;</div>{% endraw %}

### responder.setState(object) ⇒ <code>this</code>
Sets new attributes to state (with Object.assign())

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type |
| --- | --- |
| object | <code>object</code> | 

**Example**  
```javascript
res.setState({ visited: true });
```
{% raw %}<div id="Responder_addQuickReply">&nbsp;</div>{% endraw %}

### responder.addQuickReply(action, title, [data], [prepend])
Appends quick reply, to be sent with following text method

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| action | <code>string</code> |  | relative or absolute action |
| title | <code>string</code> |  | quick reply title |
| [data] | <code>Object</code> |  | additional data |
| [prepend] | <code>boolean</code> | <code>false</code> | set true to add reply at the beginning |

**Example**  
```javascript
bot.use((req, res) => {
    res.addQuickReply('barAction', 'last action');

    res.addQuickReply('theAction', 'first action', {}, true);

    res.text('Text', {
        fooAction: 'goto foo'
    }); // will be merged and sent with previously added quick replies
});
```
{% raw %}<div id="Responder_expected">&nbsp;</div>{% endraw %}

### responder.expected(action) ⇒ <code>this</code>
When user writes some text as reply, it will be processed as action

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | desired action |

{% raw %}<div id="Responder_toAbsoluteAction">&nbsp;</div>{% endraw %}

### responder.toAbsoluteAction(action) ⇒ <code>string</code>
Converts relative action to absolute action path

**Kind**: instance method of [<code>Responder</code>](#Responder)  
**Returns**: <code>string</code> - absolute action path  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | relative action to covert to absolute |

{% raw %}<div id="Responder_image">&nbsp;</div>{% endraw %}

### responder.image(imageUrl, [reusable]) ⇒ <code>this</code>
Sends image as response. Requires appUrl option to send images from server

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| imageUrl | <code>string</code> |  | relative or absolute url |
| [reusable] | <code>boolean</code> | <code>false</code> | force facebook to cache image |

**Example**  
```javascript
// image on same server (appUrl option)
res.image('/img/foo.png');

// image at url
res.image('https://google.com/img/foo.png');
```
{% raw %}<div id="Responder_video">&nbsp;</div>{% endraw %}

### responder.video(videoUrl, [reusable]) ⇒ <code>this</code>
Sends video as response. Requires appUrl option to send videos from server

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| videoUrl | <code>string</code> |  | relative or absolute url |
| [reusable] | <code>boolean</code> | <code>false</code> | force facebook to cache asset |

**Example**  
```javascript
// file on same server (appUrl option)
res.video('/img/foo.mp4');

// file at url
res.video('https://google.com/img/foo.mp4');
```
{% raw %}<div id="Responder_file">&nbsp;</div>{% endraw %}

### responder.file(fileUrl, [reusable]) ⇒ <code>this</code>
Sends file as response. Requires appUrl option to send files from server

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fileUrl | <code>string</code> |  | relative or absolute url |
| [reusable] | <code>boolean</code> | <code>false</code> | force facebook to cache asset |

**Example**  
```javascript
// file on same server (appUrl option)
res.file('/img/foo.pdf');

// file at url
res.file('https://google.com/img/foo.pdf');
```
{% raw %}<div id="Responder_wait">&nbsp;</div>{% endraw %}

### responder.wait([ms]) ⇒ <code>this</code>
Sets delay between two responses

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type | Default |
| --- | --- | --- |
| [ms] | <code>number</code> | <code>600</code> | 

{% raw %}<div id="Responder_typingOn">&nbsp;</div>{% endraw %}

### responder.typingOn() ⇒ <code>this</code>
Sends "typing..." information

**Kind**: instance method of [<code>Responder</code>](#Responder)  
{% raw %}<div id="Responder_typingOff">&nbsp;</div>{% endraw %}

### responder.typingOff() ⇒ <code>this</code>
Stops "typing..." information

**Kind**: instance method of [<code>Responder</code>](#Responder)  
{% raw %}<div id="Responder_seen">&nbsp;</div>{% endraw %}

### responder.seen() ⇒ <code>this</code>
Reports last message from user as seen

**Kind**: instance method of [<code>Responder</code>](#Responder)  
{% raw %}<div id="Responder_passThread">&nbsp;</div>{% endraw %}

### responder.passThread(targetAppId, [data]) ⇒ <code>this</code>
Pass thread to another app

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type | Default |
| --- | --- | --- |
| targetAppId | <code>string</code> |  | 
| [data] | <code>string</code> \| <code>object</code> | <code>null</code> | 

{% raw %}<div id="Responder_receipt">&nbsp;</div>{% endraw %}

### responder.receipt(recipientName, [paymentMethod], [currency], [uniqueCode]) ⇒ <code>ReceiptTemplate</code>
Sends Receipt template

**Kind**: instance method of [<code>Responder</code>](#Responder)  

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
{% raw %}<div id="Responder_button">&nbsp;</div>{% endraw %}

### responder.button(text) ⇒ <code>ButtonTemplate</code>
Sends nice button template. It can redirect user to server with token in url

**Kind**: instance method of [<code>Responder</code>](#Responder)  

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
{% raw %}<div id="Responder_genericTemplate">&nbsp;</div>{% endraw %}

### responder.genericTemplate([shareable], [isSquare]) ⇒ <code>GenericTemplate</code>
Creates a generic template

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [shareable] | <code>boolean</code> | <code>false</code> | ability to share template |
| [isSquare] | <code>boolean</code> | <code>false</code> | use square aspect ratio for images |

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
{% raw %}<div id="Responder_list">&nbsp;</div>{% endraw %}

### responder.list([topElementStyle]) ⇒ <code>ListTemplate</code>
Creates a generic template

**Kind**: instance method of [<code>Responder</code>](#Responder)  

| Param | Type | Default |
| --- | --- | --- |
| [topElementStyle] | <code>&#x27;large&#x27;</code> \| <code>&#x27;compact&#x27;</code> | <code>&#x27;large&#x27;</code> | 

**Example**  
```javascript
res.list('compact')
    .postBackButton('Main button', 'action', { actionData: 1 })
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
