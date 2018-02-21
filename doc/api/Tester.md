## Classes

<dl>
<dt><a href="#Tester">Tester</a></dt>
<dd></dd>
<dt><a href="#ResponseAssert">ResponseAssert</a></dt>
<dd></dd>
<dt><a href="#AnyResponseAssert">AnyResponseAssert</a></dt>
<dd></dd>
</dl>

{% raw %}<div id="Tester">&nbsp;</div>{% endraw %}

## Tester
**Kind**: global class  

* [Tester](#Tester)
    * [new Tester()](#new_Tester_new)
    * _instance_
        * [.acquireResponseActions()](#Tester_acquireResponseActions)
        * [.res([index])](#Tester_res) ⇒ [<code>ResponseAssert</code>](#ResponseAssert)
        * [.any()](#Tester_any) ⇒ [<code>AnyResponseAssert</code>](#AnyResponseAssert)
        * [.lastRes()](#Tester_lastRes) ⇒ [<code>ResponseAssert</code>](#ResponseAssert)
        * [.passedAction(path)](#Tester_passedAction) ⇒ <code>this</code>
        * [.getState()](#Tester_getState) ⇒ <code>object</code>
        * [.setState([state])](#Tester_setState)
        * [.text(text)](#Tester_text) ⇒ <code>Promise</code>
        * [.intent(intent, text)](#Tester_intent) ⇒ <code>Promise</code>
        * [.passThread([data], [appId])](#Tester_passThread) ⇒ <code>Promise</code>
        * [.optin(action, [data])](#Tester_optin) ⇒ <code>Promise</code>
        * [.quickReply(action, [data])](#Tester_quickReply) ⇒ <code>Promise</code>
        * [.postBack(action, [data], [refAction], [refData])](#Tester_postBack) ⇒ <code>Promise</code>
    * _static_
        * [.Tester](#Tester_Tester)
            * [new Tester(reducer, [senderId], [processorOptions], [storage])](#new_Tester_Tester_new)

{% raw %}<div id="new_Tester_new">&nbsp;</div>{% endraw %}

### new Tester()
Utility for testing requests

{% raw %}<div id="Tester_acquireResponseActions">&nbsp;</div>{% endraw %}

### tester.acquireResponseActions()
Resets action collector and fetches new actions, when there are some

**Kind**: instance method of [<code>Tester</code>](#Tester)  
{% raw %}<div id="Tester_res">&nbsp;</div>{% endraw %}

### tester.res([index]) ⇒ [<code>ResponseAssert</code>](#ResponseAssert)
Returns single response asserter

**Kind**: instance method of [<code>Tester</code>](#Tester)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [index] | <code>number</code> | <code>0</code> | response index |

{% raw %}<div id="Tester_any">&nbsp;</div>{% endraw %}

### tester.any() ⇒ [<code>AnyResponseAssert</code>](#AnyResponseAssert)
Returns any response asserter

**Kind**: instance method of [<code>Tester</code>](#Tester)  
{% raw %}<div id="Tester_lastRes">&nbsp;</div>{% endraw %}

### tester.lastRes() ⇒ [<code>ResponseAssert</code>](#ResponseAssert)
Returns last response asserter

**Kind**: instance method of [<code>Tester</code>](#Tester)  
{% raw %}<div id="Tester_passedAction">&nbsp;</div>{% endraw %}

### tester.passedAction(path) ⇒ <code>this</code>
Checks, that app past the action

**Kind**: instance method of [<code>Tester</code>](#Tester)  

| Param | Type |
| --- | --- |
| path | <code>string</code> | 

{% raw %}<div id="Tester_getState">&nbsp;</div>{% endraw %}

### tester.getState() ⇒ <code>object</code>
Returns state

**Kind**: instance method of [<code>Tester</code>](#Tester)  
{% raw %}<div id="Tester_setState">&nbsp;</div>{% endraw %}

### tester.setState([state])
Sets state with `Object.assign()`

**Kind**: instance method of [<code>Tester</code>](#Tester)  

| Param | Type | Default |
| --- | --- | --- |
| [state] | <code>object</code> | <code>{}</code> | 

{% raw %}<div id="Tester_text">&nbsp;</div>{% endraw %}

### tester.text(text) ⇒ <code>Promise</code>
Makes text request

**Kind**: instance method of [<code>Tester</code>](#Tester)  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 

{% raw %}<div id="Tester_intent">&nbsp;</div>{% endraw %}

### tester.intent(intent, text) ⇒ <code>Promise</code>
Makes recognised AI intent request

**Kind**: instance method of [<code>Tester</code>](#Tester)  

| Param | Type |
| --- | --- |
| intent | <code>string</code> | 
| text | <code>string</code> | 

{% raw %}<div id="Tester_passThread">&nbsp;</div>{% endraw %}

### tester.passThread([data], [appId]) ⇒ <code>Promise</code>
Makes pass thread control request

**Kind**: instance method of [<code>Tester</code>](#Tester)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [data] | <code>string</code> \| <code>Object</code> | <code>null</code> | action |
| [appId] | <code>string</code> | <code>&quot;random-app&quot;</code> | specific app id |

{% raw %}<div id="Tester_optin">&nbsp;</div>{% endraw %}

### tester.optin(action, [data]) ⇒ <code>Promise</code>
Make optin call

**Kind**: instance method of [<code>Tester</code>](#Tester)  

| Param | Type | Default |
| --- | --- | --- |
| action | <code>string</code> |  | 
| [data] | <code>object</code> | <code>{}</code> | 

{% raw %}<div id="Tester_quickReply">&nbsp;</div>{% endraw %}

### tester.quickReply(action, [data]) ⇒ <code>Promise</code>
Send quick reply

**Kind**: instance method of [<code>Tester</code>](#Tester)  

| Param | Type | Default |
| --- | --- | --- |
| action | <code>string</code> |  | 
| [data] | <code>object</code> | <code>{}</code> | 

{% raw %}<div id="Tester_postBack">&nbsp;</div>{% endraw %}

### tester.postBack(action, [data], [refAction], [refData]) ⇒ <code>Promise</code>
Sends postback, optionally with referrer action

**Kind**: instance method of [<code>Tester</code>](#Tester)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| action | <code>string</code> |  |  |
| [data] | <code>object</code> | <code>{}</code> |  |
| [refAction] | <code>string</code> | <code>null</code> | referred action |
| [refData] | <code>object</code> | <code>{}</code> | referred action data |

{% raw %}<div id="Tester_Tester">&nbsp;</div>{% endraw %}

### Tester.Tester
**Kind**: static class of [<code>Tester</code>](#Tester)  
{% raw %}<div id="new_Tester_Tester_new">&nbsp;</div>{% endraw %}

#### new Tester(reducer, [senderId], [processorOptions], [storage])
Creates an instance of Tester.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| reducer | <code>Router</code> \| <code>ReducerWrapper</code> \| <code>function</code> |  |  |
| [senderId] | <code>string</code> | <code>null</code> |  |
| [processorOptions] | <code>object</code> | <code>{}</code> | options for Processor |
| [storage] | <code>MemoryStateStorage</code> |  | place to override the storage |

{% raw %}<div id="ResponseAssert">&nbsp;</div>{% endraw %}

## ResponseAssert
**Kind**: global class  

* [ResponseAssert](#ResponseAssert)
    * [new ResponseAssert()](#new_ResponseAssert_new)
    * _instance_
        * [.contains(search)](#ResponseAssert_contains) ⇒ <code>this</code>
        * [.quickReplyAction(action)](#ResponseAssert_quickReplyAction) ⇒ <code>this</code>
        * [.templateType(type)](#ResponseAssert_templateType) ⇒ <code>this</code>
        * [.passThread([appId])](#ResponseAssert_passThread) ⇒ <code>this</code>
        * [.attachmentType(type)](#ResponseAssert_attachmentType) ⇒ <code>this</code>
    * _static_
        * [.AnyResponseAssert#contains(search)](#ResponseAssert_AnyResponseAssert_contains) ⇒ <code>this</code>
        * [.AnyResponseAssert#quickReplyAction(action)](#ResponseAssert_AnyResponseAssert_quickReplyAction) ⇒ <code>this</code>
        * [.AnyResponseAssert#templateType(type)](#ResponseAssert_AnyResponseAssert_templateType) ⇒ <code>this</code>
        * [.AnyResponseAssert#genericTemplate(itemCount)](#ResponseAssert_AnyResponseAssert_genericTemplate)
        * [.AnyResponseAssert#buttonTemplate(search, buttonCount)](#ResponseAssert_AnyResponseAssert_buttonTemplate)
        * [.AnyResponseAssert#passThread([appId])](#ResponseAssert_AnyResponseAssert_passThread) ⇒ <code>this</code>
        * [.AnyResponseAssert#attachmentType(type)](#ResponseAssert_AnyResponseAssert_attachmentType) ⇒ <code>this</code>

{% raw %}<div id="new_ResponseAssert_new">&nbsp;</div>{% endraw %}

### new ResponseAssert()
Utility for asserting single response

{% raw %}<div id="ResponseAssert_contains">&nbsp;</div>{% endraw %}

### responseAssert.contains(search) ⇒ <code>this</code>
Checks, that response contains text

**Kind**: instance method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type |
| --- | --- |
| search | <code>string</code> | 

{% raw %}<div id="ResponseAssert_quickReplyAction">&nbsp;</div>{% endraw %}

### responseAssert.quickReplyAction(action) ⇒ <code>this</code>
Checks quick response action

**Kind**: instance method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type |
| --- | --- |
| action | <code>string</code> | 

{% raw %}<div id="ResponseAssert_templateType">&nbsp;</div>{% endraw %}

### responseAssert.templateType(type) ⇒ <code>this</code>
Checks template type

**Kind**: instance method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 

{% raw %}<div id="ResponseAssert_passThread">&nbsp;</div>{% endraw %}

### responseAssert.passThread([appId]) ⇒ <code>this</code>
Checks pass thread control

**Kind**: instance method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type | Default |
| --- | --- | --- |
| [appId] | <code>string</code> | <code>null</code> | 

{% raw %}<div id="ResponseAssert_attachmentType">&nbsp;</div>{% endraw %}

### responseAssert.attachmentType(type) ⇒ <code>this</code>
Checks attachment type

**Kind**: instance method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 

{% raw %}<div id="ResponseAssert_AnyResponseAssert_contains">&nbsp;</div>{% endraw %}

### ResponseAssert.AnyResponseAssert#contains(search) ⇒ <code>this</code>
Checks, that response contains text

**Kind**: static method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type |
| --- | --- |
| search | <code>string</code> | 

{% raw %}<div id="ResponseAssert_AnyResponseAssert_quickReplyAction">&nbsp;</div>{% endraw %}

### ResponseAssert.AnyResponseAssert#quickReplyAction(action) ⇒ <code>this</code>
Checks quick response action

**Kind**: static method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type |
| --- | --- |
| action | <code>string</code> | 

{% raw %}<div id="ResponseAssert_AnyResponseAssert_templateType">&nbsp;</div>{% endraw %}

### ResponseAssert.AnyResponseAssert#templateType(type) ⇒ <code>this</code>
Checks template type

**Kind**: static method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 

{% raw %}<div id="ResponseAssert_AnyResponseAssert_genericTemplate">&nbsp;</div>{% endraw %}

### ResponseAssert.AnyResponseAssert#genericTemplate(itemCount)
Checks for generic template

**Kind**: static method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| itemCount | <code>number</code> | <code></code> | specified item count |

{% raw %}<div id="ResponseAssert_AnyResponseAssert_buttonTemplate">&nbsp;</div>{% endraw %}

### ResponseAssert.AnyResponseAssert#buttonTemplate(search, buttonCount)
Checks for button template

**Kind**: static method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| search | <code>string</code> |  |  |
| buttonCount | <code>number</code> | <code></code> | specified button count |

{% raw %}<div id="ResponseAssert_AnyResponseAssert_passThread">&nbsp;</div>{% endraw %}

### ResponseAssert.AnyResponseAssert#passThread([appId]) ⇒ <code>this</code>
Checks pass thread control

**Kind**: static method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type | Default |
| --- | --- | --- |
| [appId] | <code>string</code> | <code>null</code> | 

{% raw %}<div id="ResponseAssert_AnyResponseAssert_attachmentType">&nbsp;</div>{% endraw %}

### ResponseAssert.AnyResponseAssert#attachmentType(type) ⇒ <code>this</code>
Checks attachment type

**Kind**: static method of [<code>ResponseAssert</code>](#ResponseAssert)  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 

{% raw %}<div id="AnyResponseAssert">&nbsp;</div>{% endraw %}

## AnyResponseAssert
**Kind**: global class  
{% raw %}<div id="new_AnyResponseAssert_new">&nbsp;</div>{% endraw %}

### new AnyResponseAssert()
Utility for searching among responses

