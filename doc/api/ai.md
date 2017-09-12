## Classes

<dl>
<dt><a href="#Ai">Ai</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#markAsHandled">markAsHandled([aiHandled])</a> ⇒ <code>Request</code></dt>
<dd><p>Mark request as handled - usefull for AI analytics</p>
</dd>
</dl>

{% raw %}<div id="Ai">&nbsp;</div>{% endraw %}

## Ai
**Kind**: global class  

* [Ai](#Ai)
    * [.confidence](#Ai_confidence) : <code>number</code>
    * [.threshold](#Ai_threshold) : <code>number</code>
    * [.logger](#Ai_logger) : <code>Object</code>
    * [.prefixTranslator(prefix, req)](#Ai_prefixTranslator)
    * [.mockIntent([intent], [confidence])](#Ai_mockIntent) ⇒ <code>this</code>
    * [.onConfirmMiddleware(onIntentConfirmed, getMeta)](#Ai_onConfirmMiddleware) ⇒ <code>function</code>
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
{% raw %}<div id="Ai_prefixTranslator">&nbsp;</div>{% endraw %}

### ai.prefixTranslator(prefix, req)
The prefix translator - for request-specific prefixes

**Kind**: instance method of <code>[Ai](#Ai)</code>  

| Param | Type |
| --- | --- |
| prefix | <code>string</code> | 
| req | <code>Request</code> | 

{% raw %}<div id="Ai_mockIntent">&nbsp;</div>{% endraw %}

### ai.mockIntent([intent], [confidence]) ⇒ <code>this</code>
Usefull method for testing AI routes

**Kind**: instance method of <code>[Ai](#Ai)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [intent] | <code>string</code> | <code>null</code> | intent name |
| [confidence] | <code>number</code> | <code></code> | the confidence of the top intent |

**Example**  
```javascript
const { Tester, ai, Route } = require('bontaut');

const bot = new Route();

bot.use(['intentAction', ai.match('intentName')], (req, res) => {
    res.text('PASSED');
});

describe('bot', function () {
    it('should work', function () {
        ai.mockIntent('intentName');

        const t = new Tester(bot);

        return t.text('Any text')
            .then(() => {
                t.actionPassed('intentAction');

            t.any()
                .contains('PASSED');
        })
    });
});
```
{% raw %}<div id="Ai_onConfirmMiddleware">&nbsp;</div>{% endraw %}

### ai.onConfirmMiddleware(onIntentConfirmed, getMeta) ⇒ <code>function</code>
When user confirms their intent, onIntentConfirmed handler will be called.
To create meta data from recognized request use getMeta handler.
Its useful for updating training data for AI

**Kind**: instance method of <code>[Ai](#Ai)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| onIntentConfirmed | <code>function</code> |  | handler, which will be called when intent is confirmed |
| getMeta | <code>function</code> | <code></code> | handler, which will be called when intent is confirmed |

**Example**  
```javascript
const { Router, ai } = require('botnaut');

bot.use(ai.onConfirmMiddleware((senderId, intent, text, timestamp, meta) => {
    // log this information
}, (req) => {
    // create and return meta data object
}));

bot.use(ai.makeSure(['intent1', 'intent2']), (req, res) => {
    console.log(req.confidences); // { intent1: 0.8604, intent2: undefined }

    res.text('What you mean?', res.ensures({
        intent1: 'Intent one?',
        intent2: 'Intent two?',
        anyOther: 'Niether'
    }));
});
```
{% raw %}<div id="Ai_register">&nbsp;</div>{% endraw %}

### ai.register(model, options, prefix)
Registers Wingbot AI model

**Kind**: instance method of <code>[Ai](#Ai)</code>  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>string</code> | model name |
| options | <code>Object</code> | the configuration |
| [options.cacheSize] | <code>number</code> | remember number of caches |
| [options.matches] | <code>number</code> | ask AI for number of matches |
| prefix | <code>string</code> | model prefix |

{% raw %}<div id="Ai_match">&nbsp;</div>{% endraw %}

### ai.match(intent, [confidence], [prefix]) ⇒ <code>function</code>
Returns matching middleware

**Kind**: instance method of <code>[Ai](#Ai)</code>  
**Returns**: <code>function</code> - - the middleware  

| Param | Type | Default |
| --- | --- | --- |
| intent | <code>string</code> &#124; <code>Array</code> |  | 
| [confidence] | <code>number</code> | <code></code> | 
| [prefix] | <code>string</code> |  | 

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

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| knownIntents | <code>Array</code> &#124; <code>Object</code> |  | list or map of accepted intents |
| [threshold] | <code>number</code> | <code></code> | lower threshold |
| [confidence] | <code>number</code> | <code></code> | upper threshold for confidence |
| [prefix] | <code>string</code> |  | model name |

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

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| knownIntents | <code>Array</code> &#124; <code>Object</code> |  | list or map of accepted intents |
| [threshold] | <code>number</code> | <code></code> | lower threshold |
| [confidence] | <code>number</code> | <code></code> | upper threshold for confidence |
| prefix | <code>string</code> |  | model name |

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
{% raw %}<div id="markAsHandled">&nbsp;</div>{% endraw %}

## markAsHandled([aiHandled]) ⇒ <code>Request</code>
Mark request as handled - usefull for AI analytics

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [aiHandled] | <code>boolean</code> | <code>true</code> | true by default |

**Example**  
```javascript
bot.use('some other query', (req, res) => {
    req.markAsHandled();
});
```
