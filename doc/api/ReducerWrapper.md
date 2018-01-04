{% raw %}<div id="ReducerWrapper">&nbsp;</div>{% endraw %}

## ReducerWrapper ⇐ <code>EventEmitter</code>
**Kind**: global class  
**Extends**: <code>EventEmitter</code>  
**Emits**: <code>ReducerWrapper#event:action</code>  

* [ReducerWrapper](#ReducerWrapper) ⇐ <code>EventEmitter</code>
    * [new ReducerWrapper()](#new_ReducerWrapper_new)
    * _instance_
        * [.reduce(req, res, postBack)](#ReducerWrapper_reduce)
    * _static_
        * [.ReducerWrapper](#ReducerWrapper_ReducerWrapper)
            * [new ReducerWrapper([reduce])](#new_ReducerWrapper_ReducerWrapper_new)

{% raw %}<div id="new_ReducerWrapper_new">&nbsp;</div>{% endraw %}

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
{% raw %}<div id="ReducerWrapper_reduce">&nbsp;</div>{% endraw %}

### reducerWrapper.reduce(req, res, postBack)
Reducer function

**Kind**: instance method of [<code>ReducerWrapper</code>](#ReducerWrapper)  

| Param | Type |
| --- | --- |
| req | <code>Request</code> | 
| res | <code>Responder</code> | 
| postBack | <code>function</code> | 

{% raw %}<div id="ReducerWrapper_ReducerWrapper">&nbsp;</div>{% endraw %}

### ReducerWrapper.ReducerWrapper
**Kind**: static class of [<code>ReducerWrapper</code>](#ReducerWrapper)  
{% raw %}<div id="new_ReducerWrapper_ReducerWrapper_new">&nbsp;</div>{% endraw %}

#### new ReducerWrapper([reduce])
Creates an instance of ReducerWrapper.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [reduce] | <code>function</code> | <code>o &#x3D;&gt; o</code> | the handler function |

