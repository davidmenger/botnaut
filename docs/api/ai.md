{% raw %}<div id="Ai">&nbsp;</div>{% endraw %}

## Ai
**Kind**: global class  

* [Ai](#Ai)
    * [.confidence](#Ai_confidence) : <code>number</code>
    * [.threshold](#Ai_threshold) : <code>number</code>
    * [.logger](#Ai_logger) : <code>Object</code>
    * [.register(model, options, prefix)](#Ai_register)
    * [.match(intent, [confidence], [prefix])](#Ai_match) ⇒ <code>function</code>
    * [.navigate(knownIntents, [threshold], [confidence], [prefix])](#Ai_navigate) ⇒ <code>function</code>
    * [.makeSure(knownIntents, [threshold], [confidence], prefix)](#Ai_makeSure) ⇒ <code>function</code>

{% raw %}<div id="Ai_confidence">&nbsp;</div>{% endraw %}

### ai.confidence : <code>number</code>
Upper threshold - for match method and for navigate method

**Kind**: instance property of <code>[Ai](#Ai)</code>  
{% raw %}<div id="Ai_threshold">&nbsp;</div>{% endraw %}

### ai.threshold : <code>number</code>
Lower threshold - for navigate and makeSure methods

**Kind**: instance property of <code>[Ai](#Ai)</code>  
{% raw %}<div id="Ai_logger">&nbsp;</div>{% endraw %}

### ai.logger : <code>Object</code>
The logger (console by default)

**Kind**: instance property of <code>[Ai](#Ai)</code>  
{% raw %}<div id="Ai_register">&nbsp;</div>{% endraw %}

### ai.register(model, options, prefix)
Registers Wingbot AI model

**Kind**: instance method of <code>[Ai](#Ai)</code>  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>string</code> | model name |
| options | <code>Object</code> | the configuration |
| options.cacheSize | <code>number</code> | remember number of caches |
| options.matches | <code>number</code> | ask AI for number of matches |
| prefix | <code>string</code> | model prefix |

{% raw %}<div id="Ai_match">&nbsp;</div>{% endraw %}

### ai.match(intent, [confidence], [prefix]) ⇒ <code>function</code>
Returns matching middleware

**Kind**: instance method of <code>[Ai](#Ai)</code>  
**Returns**: <code>function</code> - - the middleware  

| Param | Type |
| --- | --- |
| intent | <code>string</code> &#124; <code>Array</code> | 
| [confidence] | <code>number</code> | 
| [prefix] | <code>string</code> | 

**Example**  
```javascript
const { Router, ai } = require('botnaut');

ai.register('app-model');

bot.use(ai.match('intent1'), (req, res) => {
    console.log(req.confidences); // { intent1: 0.9604 }

    res.text('Oh, intent 1 :)');
});
```
{% raw %}<div id="Ai_navigate">&nbsp;</div>{% endraw %}

### ai.navigate(knownIntents, [threshold], [confidence], [prefix]) ⇒ <code>function</code>
Create AI middleware, which resolves multiple replies
and **makes postback, when it's confident**
Confidence should be between `threshold` and `confidence` to proceed
to next resolver

**Kind**: instance method of <code>[Ai](#Ai)</code>  
**Returns**: <code>function</code> - - the middleware  

| Param | Type | Description |
| --- | --- | --- |
| knownIntents | <code>Array</code> &#124; <code>Object</code> | list or map of accepted intents |
| [threshold] | <code>number</code> | lower threshold |
| [confidence] | <code>number</code> | upper threshold for confidence |
| [prefix] | <code>string</code> | model name |

**Example**  
```javascript
const { Router, ai } = require('botnaut');

bot.use(ai.navigate(['intent1', 'intent2']), (req, res) => {
    console.log(req.confidences); // { intent1: 0.8604, intent2: undefined }

    res.text('What you mean?', res.ensures({
        intent1: 'Intent one?',
        intent2: 'Intent two?',
        anyOther: 'Niether'
    }));
});
```
{% raw %}<div id="Ai_makeSure">&nbsp;</div>{% endraw %}

### ai.makeSure(knownIntents, [threshold], [confidence], prefix) ⇒ <code>function</code>
Create AI middleware, which resolves multiple replies.
Confidence should be between `threshold` and `confidence` to proceed
to next resolver

**Kind**: instance method of <code>[Ai](#Ai)</code>  
**Returns**: <code>function</code> - - the middleware  

| Param | Type | Description |
| --- | --- | --- |
| knownIntents | <code>Array</code> &#124; <code>Object</code> | list or map of accepted intents |
| [threshold] | <code>number</code> | lower threshold |
| [confidence] | <code>number</code> | upper threshold for confidence |
| prefix | <code>string</code> | model name |

**Example**  
```javascript
const { Router, ai } = require('botnaut');

bot.use(ai.makeSure(['intent1', 'intent2']), (req, res) => {
    console.log(req.confidences); // { intent1: 0.8604, intent2: undefined }

    res.text('What you mean?', res.ensures({
        intent1: 'Intent one?',
        intent2: 'Intent two?',
        anyOther: 'Niether'
    }));
});
```
