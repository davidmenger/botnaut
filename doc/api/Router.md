{% raw %}<div id="Router">&nbsp;</div>{% endraw %}

## Router ⇐ <code>ReducerWrapper</code>
**Kind**: global class  
**Extends:** <code>ReducerWrapper</code>  

* [Router](#Router) ⇐ <code>ReducerWrapper</code>
    * [new Router()](#new_Router_new)
    * [.use([action], [matcher], ...reducers)](#Router_use) ⇒ <code>Object</code>

{% raw %}<div id="new_Router_new">&nbsp;</div>{% endraw %}

### new Router()
Cascading router

{% raw %}<div id="Router_use">&nbsp;</div>{% endraw %}

### router.use([action], [matcher], ...reducers) ⇒ <code>Object</code>
Appends middleware, action handler or another router

**Kind**: instance method of <code>[Router](#Router)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [action] | <code>string</code> | name of the action |
| [matcher] | <code>RegExp</code> &#124; <code>string</code> &#124; <code>function</code> | The function can be async |
| ...reducers | <code>function</code> &#124; <code>[Router](#Router)</code> |  |

**Example**  
```javascript
// middleware
router.use((req, res, postBack) => Router.CONTINUE);

// route with matching regexp
router.use('action', /help/, (req, res) => {
    res.text('Hello!');
});

// route with matching function (the function is considered as matcher
// in case of the function accepts zero or one argument)
router.use('action', req => req.text() === 'a', (req, res) => {
    res.text('Hello!');
});

// use multiple reducers
router.use('/path', reducer1, reducer2)
   .next('exitAction', (data, req, res, postBack, next) => {
       postBack('anotherAction', { someData: true })
   });

// append router with exit action
router.use('/path', subRouter)
   .next('exitAction', (data, req, res, postBack, next) => {
       postBack('anotherAction', { someData: true })
   });
```
