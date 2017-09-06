## Classes

<dl>
<dt><a href="#MemoryStateStorage">MemoryStateStorage</a></dt>
<dd><p>Memory conversation state storage for testing purposes</p>
</dd>
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
**Kind**: instance method of <code>[MemoryStateStorage](#MemoryStateStorage)</code>  
**Returns**: <code>Promise.&lt;Object&gt;</code> - - conversation state  

| Param | Type | Description |
| --- | --- | --- |
| senderId | <code>any</code> | sender identifier |
| defaultState | <code>Object</code> | default state of the conversation |

{% raw %}<div id="MemoryStateStorage_onAfterStateLoad">&nbsp;</div>{% endraw %}

### memoryStateStorage.onAfterStateLoad(req, state) ⇒ <code>Promise.&lt;Object&gt;</code>
**Kind**: instance method of <code>[MemoryStateStorage](#MemoryStateStorage)</code>  
**Returns**: <code>Promise.&lt;Object&gt;</code> - - conversation state  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Request</code> | chat request |
| state | <code>Object</code> | conversation state |

{% raw %}<div id="MemoryStateStorage_saveState">&nbsp;</div>{% endraw %}

### memoryStateStorage.saveState(state) ⇒ <code>Promise</code>
**Kind**: instance method of <code>[MemoryStateStorage](#MemoryStateStorage)</code>  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> | conversation state |

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
