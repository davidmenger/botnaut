{% raw %}<div id="Responder">&nbsp;</div>{% endraw %}

## Responder
**Kind**: global class  

* [Responder](#Responder)
    * [new Responder()](#new_Responder_new)
    * [.text(text, [quickReplys])](#Responder_text) ⇒ <code>this</code>
    * [.setState(object)](#Responder_setState) ⇒ <code>this</code>
    * [.expected(action)](#Responder_expected) ⇒ <code>this</code>
    * [.image(imageUrl)](#Responder_image) ⇒ <code>this</code>
    * [.wait([ms])](#Responder_wait) ⇒ <code>this</code>
    * [.typingOn()](#Responder_typingOn) ⇒ <code>this</code>
    * [.typingOff()](#Responder_typingOff) ⇒ <code>this</code>
    * [.seen()](#Responder_seen) ⇒ <code>this</code>
    * [.receipt(recipientName, [paymentMethod], [currency], [uniqueCode])](#Responder_receipt) ⇒ <code>ReceiptTemplate</code>
    * [.button(text)](#Responder_button) ⇒ <code>ButtonTemplate</code>
    * [.genericTemplate([shareable], [isSquare])](#Responder_genericTemplate) ⇒ <code>GenericTemplate</code>
    * [.list([topElementStyle])](#Responder_list) ⇒ <code>ListTemplate</code>

{% raw %}<div id="new_Responder_new">&nbsp;</div>{% endraw %}

### new Responder()
Instance of responder is passed as second parameter of handler (res)

{% raw %}<div id="Responder_text">&nbsp;</div>{% endraw %}

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
{% raw %}<div id="Responder_setState">&nbsp;</div>{% endraw %}

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
{% raw %}<div id="Responder_expected">&nbsp;</div>{% endraw %}

### responder.expected(action) ⇒ <code>this</code>
When user writes some text as reply, it will be processed as action

**Kind**: instance method of <code>[Responder](#Responder)</code>  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | desired action |

{% raw %}<div id="Responder_image">&nbsp;</div>{% endraw %}

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
{% raw %}<div id="Responder_wait">&nbsp;</div>{% endraw %}

### responder.wait([ms]) ⇒ <code>this</code>
Sets delay between two responses

**Kind**: instance method of <code>[Responder](#Responder)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [ms] | <code>number</code> | <code>600</code> | 

{% raw %}<div id="Responder_typingOn">&nbsp;</div>{% endraw %}

### responder.typingOn() ⇒ <code>this</code>
Sends "typing..." information

**Kind**: instance method of <code>[Responder](#Responder)</code>  
{% raw %}<div id="Responder_typingOff">&nbsp;</div>{% endraw %}

### responder.typingOff() ⇒ <code>this</code>
Stops "typing..." information

**Kind**: instance method of <code>[Responder](#Responder)</code>  
{% raw %}<div id="Responder_seen">&nbsp;</div>{% endraw %}

### responder.seen() ⇒ <code>this</code>
Reports last message from user as seen

**Kind**: instance method of <code>[Responder](#Responder)</code>  
{% raw %}<div id="Responder_receipt">&nbsp;</div>{% endraw %}

### responder.receipt(recipientName, [paymentMethod], [currency], [uniqueCode]) ⇒ <code>ReceiptTemplate</code>
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
{% raw %}<div id="Responder_button">&nbsp;</div>{% endraw %}

### responder.button(text) ⇒ <code>ButtonTemplate</code>
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
{% raw %}<div id="Responder_genericTemplate">&nbsp;</div>{% endraw %}

### responder.genericTemplate([shareable], [isSquare]) ⇒ <code>GenericTemplate</code>
Creates a generic template

**Kind**: instance method of <code>[Responder](#Responder)</code>  

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

**Kind**: instance method of <code>[Responder](#Responder)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [topElementStyle] | <code>&#x27;large&#x27;</code> &#124; <code>&#x27;compact&#x27;</code> | <code>&#x27;large&#x27;</code> | 

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
