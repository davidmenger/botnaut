## Classes

<dl>
<dt><a href="#ButtonTemplate">ButtonTemplate</a> ⇐ <code>BaseTemplate</code></dt>
<dd></dd>
<dt><a href="#GenericTemplate">GenericTemplate</a> ⇐ <code><a href="#ButtonTemplate">ButtonTemplate</a></code></dt>
<dd></dd>
<dt><a href="#ReceiptTemplate">ReceiptTemplate</a> ⇐ <code>BaseTemplate</code></dt>
<dd></dd>
</dl>

{% raw %}<div id="ButtonTemplate">&nbsp;</div>{% endraw %}

## ButtonTemplate ⇐ <code>BaseTemplate</code>
**Kind**: global class  
**Extends**: <code>BaseTemplate</code>  

* [ButtonTemplate](#ButtonTemplate) ⇐ <code>BaseTemplate</code>
    * [new ButtonTemplate()](#new_ButtonTemplate_new)
    * [.urlButton(title, linkUrl, hasExtension, [webviewHeight])](#ButtonTemplate_urlButton) ⇒ <code>this</code>
    * [.postBackButton(title, action, [data])](#ButtonTemplate_postBackButton) ⇒ <code>this</code>
    * [.shareButton()](#ButtonTemplate_shareButton) ⇒ <code>this</code>

{% raw %}<div id="new_ButtonTemplate_new">&nbsp;</div>{% endraw %}

### new ButtonTemplate()
Helps with creating of button template
Instance of button template is returned by {Responder}

{% raw %}<div id="ButtonTemplate_urlButton">&nbsp;</div>{% endraw %}

### buttonTemplate.urlButton(title, linkUrl, hasExtension, [webviewHeight]) ⇒ <code>this</code>
Adds button. When `hasExtension` is set to `true`, url will contain hash like:
`#token=foo&senderId=23344`

**Kind**: instance method of [<code>ButtonTemplate</code>](#ButtonTemplate)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| title | <code>string</code> |  | button text |
| linkUrl | <code>string</code> |  | button url |
| hasExtension | <code>boolean</code> | <code>false</code> | includes token in url |
| [webviewHeight] | <code>string</code> | <code>null</code> | compact|tall|full |

{% raw %}<div id="ButtonTemplate_postBackButton">&nbsp;</div>{% endraw %}

### buttonTemplate.postBackButton(title, action, [data]) ⇒ <code>this</code>
Adds button, which makes another action

**Kind**: instance method of [<code>ButtonTemplate</code>](#ButtonTemplate)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| title | <code>string</code> |  | Button title |
| action | <code>string</code> |  | Button action (can be absolute or relative) |
| [data] | <code>object</code> | <code>{}</code> | Action data |

{% raw %}<div id="ButtonTemplate_shareButton">&nbsp;</div>{% endraw %}

### buttonTemplate.shareButton() ⇒ <code>this</code>
**Kind**: instance method of [<code>ButtonTemplate</code>](#ButtonTemplate)  
{% raw %}<div id="GenericTemplate">&nbsp;</div>{% endraw %}

## GenericTemplate ⇐ [<code>ButtonTemplate</code>](#ButtonTemplate)
**Kind**: global class  
**Extends**: [<code>ButtonTemplate</code>](#ButtonTemplate)  

* [GenericTemplate](#GenericTemplate) ⇐ [<code>ButtonTemplate</code>](#ButtonTemplate)
    * [new GenericTemplate()](#new_GenericTemplate_new)
    * [.addElement(title, [subtitle], [dontTranslate])](#GenericTemplate_addElement) ⇒ <code>this</code>
    * [.setElementActionShare()](#GenericTemplate_setElementActionShare) ⇒ <code>this</code>
    * [.setElementActionPostback(action, [data])](#GenericTemplate_setElementActionPostback) ⇒ <code>this</code>
    * [.setElementImage(image)](#GenericTemplate_setElementImage) ⇒ <code>this</code>
    * [.setElementAction(url, hasExtension, [webviewHeight])](#GenericTemplate_setElementAction)
    * [.urlButton(title, linkUrl, hasExtension, [webviewHeight])](#ButtonTemplate_urlButton) ⇒ <code>this</code>
    * [.postBackButton(title, action, [data])](#ButtonTemplate_postBackButton) ⇒ <code>this</code>
    * [.shareButton()](#ButtonTemplate_shareButton) ⇒ <code>this</code>

{% raw %}<div id="new_GenericTemplate_new">&nbsp;</div>{% endraw %}

### new GenericTemplate()
Generic template utility

{% raw %}<div id="GenericTemplate_addElement">&nbsp;</div>{% endraw %}

### genericTemplate.addElement(title, [subtitle], [dontTranslate]) ⇒ <code>this</code>
Adds element to generic template

**Kind**: instance method of [<code>GenericTemplate</code>](#GenericTemplate)  

| Param | Type | Default |
| --- | --- | --- |
| title | <code>string</code> |  | 
| [subtitle] | <code>string</code> | <code>null</code> | 
| [dontTranslate] | <code>boolean</code> | <code>false</code> | 

{% raw %}<div id="GenericTemplate_setElementActionShare">&nbsp;</div>{% endraw %}

### genericTemplate.setElementActionShare() ⇒ <code>this</code>
Sets url of recently added element

**Kind**: instance method of [<code>GenericTemplate</code>](#GenericTemplate)  
{% raw %}<div id="GenericTemplate_setElementActionPostback">&nbsp;</div>{% endraw %}

### genericTemplate.setElementActionPostback(action, [data]) ⇒ <code>this</code>
Sets url of recently added element

**Kind**: instance method of [<code>GenericTemplate</code>](#GenericTemplate)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| action | <code>string</code> |  | Button action (can be absolute or relative) |
| [data] | <code>object</code> | <code>{}</code> | Action data |

{% raw %}<div id="GenericTemplate_setElementImage">&nbsp;</div>{% endraw %}

### genericTemplate.setElementImage(image) ⇒ <code>this</code>
Sets image of recently added element

**Kind**: instance method of [<code>GenericTemplate</code>](#GenericTemplate)  

| Param | Type |
| --- | --- |
| image | <code>string</code> | 

{% raw %}<div id="GenericTemplate_setElementAction">&nbsp;</div>{% endraw %}

### genericTemplate.setElementAction(url, hasExtension, [webviewHeight])
Sets default action of recently added element

**Kind**: instance method of [<code>GenericTemplate</code>](#GenericTemplate)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  | button url |
| hasExtension | <code>boolean</code> | <code>false</code> | includes token in url |
| [webviewHeight] | <code>string</code> | <code>null</code> | compact|tall|full |

{% raw %}<div id="ButtonTemplate_urlButton">&nbsp;</div>{% endraw %}

### genericTemplate.urlButton(title, linkUrl, hasExtension, [webviewHeight]) ⇒ <code>this</code>
Adds button. When `hasExtension` is set to `true`, url will contain hash like:
`#token=foo&senderId=23344`

**Kind**: instance method of [<code>GenericTemplate</code>](#GenericTemplate)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| title | <code>string</code> |  | button text |
| linkUrl | <code>string</code> |  | button url |
| hasExtension | <code>boolean</code> | <code>false</code> | includes token in url |
| [webviewHeight] | <code>string</code> | <code>null</code> | compact|tall|full |

{% raw %}<div id="ButtonTemplate_postBackButton">&nbsp;</div>{% endraw %}

### genericTemplate.postBackButton(title, action, [data]) ⇒ <code>this</code>
Adds button, which makes another action

**Kind**: instance method of [<code>GenericTemplate</code>](#GenericTemplate)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| title | <code>string</code> |  | Button title |
| action | <code>string</code> |  | Button action (can be absolute or relative) |
| [data] | <code>object</code> | <code>{}</code> | Action data |

{% raw %}<div id="ButtonTemplate_shareButton">&nbsp;</div>{% endraw %}

### genericTemplate.shareButton() ⇒ <code>this</code>
**Kind**: instance method of [<code>GenericTemplate</code>](#GenericTemplate)  
{% raw %}<div id="ReceiptTemplate">&nbsp;</div>{% endraw %}

## ReceiptTemplate ⇐ <code>BaseTemplate</code>
**Kind**: global class  
**Extends**: <code>BaseTemplate</code>  

* [ReceiptTemplate](#ReceiptTemplate) ⇐ <code>BaseTemplate</code>
    * [new ReceiptTemplate()](#new_ReceiptTemplate_new)
    * [.addElement(title, [price], [quantity], [image], [subtitle])](#ReceiptTemplate_addElement) ⇒ <code>this</code>

{% raw %}<div id="new_ReceiptTemplate_new">&nbsp;</div>{% endraw %}

### new ReceiptTemplate()
Provides fluent interface to make nice Receipts
Instance of button template is returned by {Responder}

{% raw %}<div id="ReceiptTemplate_addElement">&nbsp;</div>{% endraw %}

### receiptTemplate.addElement(title, [price], [quantity], [image], [subtitle]) ⇒ <code>this</code>
Adds item to receipt

**Kind**: instance method of [<code>ReceiptTemplate</code>](#ReceiptTemplate)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| title | <code>string</code> |  |  |
| [price] | <code>number</code> | <code>0</code> | a item price |
| [quantity] | <code>number</code> | <code></code> | amount of items |
| [image] | <code>string</code> | <code>null</code> | image of item |
| [subtitle] | <code>string</code> | <code>null</code> | optional subtitle |

