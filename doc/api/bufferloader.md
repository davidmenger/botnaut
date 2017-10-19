## Classes

<dl>
<dt><a href="#MemoryStateStorage">MemoryStateStorage</a></dt>
<dd><p>Memory conversation state storage for testing purposes</p>
</dd>
<dt><a href="#Translate">Translate</a></dt>
<dd></dd>
<dt><a href="#Translate">Translate</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#bufferloader">bufferloader(url, [limit], [limitJustByBody], [redirCount])</a> ⇒</dt>
<dd><p>Downloads a file from url into a buffer. Supports size limits and redirects.</p>
</dd>
</dl>

{% raw %}<div id="MemoryStateStorage">&nbsp;</div>{% endraw %}

## MemoryStateStorage
Memory conversation state storage for testing purposes

**Kind**: global class  

* [MemoryStateStorage](#MemoryStateStorage)
    * [.getOrCreateAndLock(senderId, defaultState)](#MemoryStateStorage_getOrCreateAndLock) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.onAfterStateLoad(req, state)](#MemoryStateStorage_onAfterStateLoad) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.saveState(state)](#MemoryStateStorage_saveState) ⇒ <code>Promise</code>

{% raw %}<div id="MemoryStateStorage_getOrCreateAndLock">&nbsp;</div>{% endraw %}

### memoryStateStorage.getOrCreateAndLock(senderId, defaultState) ⇒ <code>Promise.&lt;Object&gt;</code>
**Kind**: instance method of [<code>MemoryStateStorage</code>](#MemoryStateStorage)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - - conversation state  

| Param | Type | Description |
| --- | --- | --- |
| senderId | <code>any</code> | sender identifier |
| defaultState | <code>Object</code> | default state of the conversation |

{% raw %}<div id="MemoryStateStorage_onAfterStateLoad">&nbsp;</div>{% endraw %}

### memoryStateStorage.onAfterStateLoad(req, state) ⇒ <code>Promise.&lt;Object&gt;</code>
**Kind**: instance method of [<code>MemoryStateStorage</code>](#MemoryStateStorage)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - - conversation state  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Request</code> | chat request |
| state | <code>Object</code> | conversation state |

{% raw %}<div id="MemoryStateStorage_saveState">&nbsp;</div>{% endraw %}

### memoryStateStorage.saveState(state) ⇒ <code>Promise</code>
**Kind**: instance method of [<code>MemoryStateStorage</code>](#MemoryStateStorage)  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> | conversation state |

{% raw %}<div id="Translate">&nbsp;</div>{% endraw %}

## Translate
**Kind**: global class  

* [Translate](#Translate)
    * [new Translate()](#new_Translate_new)
    * [new Translate([options])](#new_Translate_new)
    * [.translator(languages)](#Translate_translator) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.middleware(languageResolver)](#Translate_middleware) ⇒ <code>function</code>

{% raw %}<div id="new_Translate_new">&nbsp;</div>{% endraw %}

### new Translate()
Tool for text translation

{% raw %}<div id="new_Translate_new">&nbsp;</div>{% endraw %}

### new Translate([options])

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> |  |
| [options.sourcePath] | <code>string</code> | optional source path of translation folder |
| [options.fileSuffix] | <code>string</code> | by default `.locale.po` |

{% raw %}<div id="Translate_translator">&nbsp;</div>{% endraw %}

### translate.translator(languages) ⇒ <code>Promise.&lt;object&gt;</code>
Creates static translator for static settings

**Kind**: instance method of [<code>Translate</code>](#Translate)  

| Param | Type | Description |
| --- | --- | --- |
| languages | <code>Array.&lt;string&gt;</code> | list of required languages |

**Example**  
```javascript
const { Translate } = require('botnaut');

const translate = new Translate({ sourcePath: __dirname });

const t = translate.translator(['cs', 'en']);

// czech
t.cs.t('requested text');

// english
t.en.t('requested text');
```
{% raw %}<div id="Translate_middleware">&nbsp;</div>{% endraw %}

### translate.middleware(languageResolver) ⇒ <code>function</code>
Bots middleware for text translations

- will be looking for `<lang>.locale.po` by default

**Kind**: instance method of [<code>Translate</code>](#Translate)  

| Param | Type |
| --- | --- |
| languageResolver | <code>function</code> | 

**Example**  
```javascript
const { Translate } = require('botnaut');

const translate = new Translate({ sourcePath: __dirname });

bot.use(translate.middleware((req, res) => 'cs'));

bot.use((req, res) => {
   res.text(res.t('Translated text'));
});
```
{% raw %}<div id="Translate">&nbsp;</div>{% endraw %}

## Translate
**Kind**: global class  

* [Translate](#Translate)
    * [new Translate()](#new_Translate_new)
    * [new Translate([options])](#new_Translate_new)
    * [.translator(languages)](#Translate_translator) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.middleware(languageResolver)](#Translate_middleware) ⇒ <code>function</code>

{% raw %}<div id="new_Translate_new">&nbsp;</div>{% endraw %}

### new Translate()
Tool for text translation

{% raw %}<div id="new_Translate_new">&nbsp;</div>{% endraw %}

### new Translate([options])

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> |  |
| [options.sourcePath] | <code>string</code> | optional source path of translation folder |
| [options.fileSuffix] | <code>string</code> | by default `.locale.po` |

{% raw %}<div id="Translate_translator">&nbsp;</div>{% endraw %}

### translate.translator(languages) ⇒ <code>Promise.&lt;object&gt;</code>
Creates static translator for static settings

**Kind**: instance method of [<code>Translate</code>](#Translate)  

| Param | Type | Description |
| --- | --- | --- |
| languages | <code>Array.&lt;string&gt;</code> | list of required languages |

**Example**  
```javascript
const { Translate } = require('botnaut');

const translate = new Translate({ sourcePath: __dirname });

const t = translate.translator(['cs', 'en']);

// czech
t.cs.t('requested text');

// english
t.en.t('requested text');
```
{% raw %}<div id="Translate_middleware">&nbsp;</div>{% endraw %}

### translate.middleware(languageResolver) ⇒ <code>function</code>
Bots middleware for text translations

- will be looking for `<lang>.locale.po` by default

**Kind**: instance method of [<code>Translate</code>](#Translate)  

| Param | Type |
| --- | --- |
| languageResolver | <code>function</code> | 

**Example**  
```javascript
const { Translate } = require('botnaut');

const translate = new Translate({ sourcePath: __dirname });

bot.use(translate.middleware((req, res) => 'cs'));

bot.use((req, res) => {
   res.text(res.t('Translated text'));
});
```
{% raw %}<div id="bufferloader">&nbsp;</div>{% endraw %}

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
