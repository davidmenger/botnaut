## Classes

<dl>
<dt><a href="#Keyworder">Keyworder</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Tag">Tag</a> : <code>Object</code></dt>
<dd></dd>
</dl>

{% raw %}<div id="Keyworder">&nbsp;</div>{% endraw %}

## Keyworder
**Kind**: global class  

* [Keyworder](#Keyworder)
    * [new Keyworder(options)](#new_Keyworder_new)
    * [.resolve(text, [allowed], [options])](#Keyworder_resolve) ⇒ <code>Promise.&lt;(null\|{tag: string, score: number}\|Array.&lt;{tag: string, score: number}&gt;)&gt;</code>
    * [._filterByThreshold(tags, [threshold])](#Keyworder__filterByThreshold)
    * [.middleware([allowed], [options])](#Keyworder_middleware) ⇒ <code>function</code>

{% raw %}<div id="new_Keyworder_new">&nbsp;</div>{% endraw %}

### new Keyworder(options)

| Param | Type |
| --- | --- |
| options | <code>Object</code> | 
| options.serviceUrl | <code>string</code> | 
| options.model | <code>string</code> | 
| [options.log] | <code>Object</code> | 

{% raw %}<div id="Keyworder_resolve">&nbsp;</div>{% endraw %}

### keyworder.resolve(text, [allowed], [options]) ⇒ <code>Promise.&lt;(null\|{tag: string, score: number}\|Array.&lt;{tag: string, score: number}&gt;)&gt;</code>
**Kind**: instance method of <code>[Keyworder](#Keyworder)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>string</code> |  | the user input |
| [allowed] | <code>Array.&lt;string&gt;</code> &#124; <code>function</code> &#124; <code>null</code> |  | the array of desired intents or test function |
| [options] | <code>Object</code> | <code>{}</code> |  |
| [options.threshold] | <code>number</code> |  |  |
| [options.matched] | <code>number</code> |  |  |

{% raw %}<div id="Keyworder__filterByThreshold">&nbsp;</div>{% endraw %}

### keyworder._filterByThreshold(tags, [threshold])
**Kind**: instance method of <code>[Keyworder](#Keyworder)</code>  

| Param | Type |
| --- | --- |
| tags | <code>[Array.&lt;Tag&gt;](#Tag)</code> | 
| [threshold] | <code>number</code> &#124; <code>null</code> | 

{% raw %}<div id="Keyworder_middleware">&nbsp;</div>{% endraw %}

### keyworder.middleware([allowed], [options]) ⇒ <code>function</code>
**Kind**: instance method of <code>[Keyworder](#Keyworder)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [allowed] | <code>Array.&lt;string&gt;</code> &#124; <code>function</code> &#124; <code>null</code> |  | the array of desired intents or test function |
| [options] | <code>Object</code> | <code>{}</code> |  |
| [options.threshold] | <code>number</code> | <code>0.95</code> | select first tag resolved                                            with this or higher score |
| [options.lowThreshold] | <code>number</code> |  | let the user select from all tags                                          with this or higher score |
| [options.matches] | <code>number</code> | <code>5</code> | how many matches should be considered |

**Example**  
```javascript
const { Keyworder } = require('botnaut');
const keyworder = new Keyworder('http://example-ai-api.com/', 'modelName');

router.use(keyworder.middleware('hello-intent'), (req, res) => {
    // the matched intent is available in req.intent now
    res.text('Welcome too!');
});
```
{% raw %}<div id="Tag">&nbsp;</div>{% endraw %}

## Tag : <code>Object</code>
**Kind**: global typedef  
