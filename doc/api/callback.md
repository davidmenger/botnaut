{% raw %}<div id="module_callbackMiddleware">&nbsp;</div>{% endraw %}

## callbackMiddleware ⇒ <code>function</code>
Creates callback middleware, which allows to get user back to previous context

**Example**  
```javascript
const { Router, callbackMiddleware, ai } = require('botnaut');

const bot = new Router();

bot.use(callbackMiddleware());

bot.use(['fooRoute', /^foo$/], (req, res) => {
    if (!req.isFromCallback()) {
        // is hidden, when user is just comming back
        res.text('This is your FOO response');
    }
    if (!req.hasCallback()) {
        res.setCallback('fooRoute');
    }

    // ability get back to previous content
    res.addCallbackQuickReply('Go back');

    res.text('So, what you want?', {
        barRoute: 'Go to bar'
    });
 })

 bot.use(['barRoute', /^bar$/], (req, res) => {
    if (!req.isFromCallback()) {
        res.text('This is your BAR response');
    }
    if (!req.hasCallback()) {
        res.setCallback('barRoute');
    }

    if (!req.proceedCallback()) {
        res.text('So, what\'s next?', {
            fooRoute: 'Go to foo'
        });
    }
 });
```

* [callbackMiddleware](#module_callbackMiddleware) ⇒ <code>function</code>
    * [setCallback(action, [callbackContext], [callbackText])](#exp_module_callbackMiddleware--setCallback) ⇒ <code>this</code> ⏏
    * [hasCallback([callbackContext])](#exp_module_callbackMiddleware--hasCallback) ⇒ <code>boolean</code> ⏏
    * [isFromCallback([callbackContext])](#exp_module_callbackMiddleware--isFromCallback) ⇒ <code>boolean</code> ⏏
    * [proceedCallback([callbackContext])](#exp_module_callbackMiddleware--proceedCallback) ⇒ <code>boolean</code> ⏏
    * [addCallbackQuickReply(replyText)](#exp_module_callbackMiddleware--addCallbackQuickReply) ⇒ <code>this</code> ⏏

{% raw %}<div id="exp_module_callbackMiddleware--setCallback">&nbsp;</div>{% endraw %}

### setCallback(action, [callbackContext], [callbackText]) ⇒ <code>this</code> ⏏
Sets action, where to go back, when user responds with text

**Kind**: Exported function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| action | <code>string</code> |  | relative or absolute action (usualy current action) |
| [callbackContext] | <code>string</code> \| <code>null</code> | <code>null</code> | context of callback |
| [callbackText] | <code>string</code> \| <code>null</code> | <code>null</code> | custom text response |

**Example**  
```javascript
bot.use('myAction', (req, res) => {
    res.setCallback('myAction'); // return back
});
```
{% raw %}<div id="exp_module_callbackMiddleware--hasCallback">&nbsp;</div>{% endraw %}

### hasCallback([callbackContext]) ⇒ <code>boolean</code> ⏏
Returns true, when callback has been prevously set.
It's usefull, when you don't want to bouce back the methods.

**Kind**: Exported function  

| Param | Type | Default |
| --- | --- | --- |
| [callbackContext] | <code>string</code> | <code>null</code> | 

**Example**  
```javascript
bot.use(['fooRoute', /^foo$/], (req, res) => {
    // set callback, only when this request does not have one
    if (!req.hasCallback()) {
        res.setCallback('fooRoute');
    }
});
```
{% raw %}<div id="exp_module_callbackMiddleware--isFromCallback">&nbsp;</div>{% endraw %}

### isFromCallback([callbackContext]) ⇒ <code>boolean</code> ⏏
Returns true, when user is comming back from callback
Comeback is initialised with `req.proceedCallback()` or quick reply
Usefull for hidding the text, user has already seen

**Kind**: Exported function  

| Param | Type | Default |
| --- | --- | --- |
| [callbackContext] | <code>string</code> | <code>null</code> | 

**Example**  
```javascript
bot.use(['fooRoute', /^foo$/], (req, res) => {
    // set callback, only when this request does not have one
    if (!req.isFromCallback()) {
        res.text('this is the response, you dont want to read again');
    }
});
```
{% raw %}<div id="exp_module_callbackMiddleware--proceedCallback">&nbsp;</div>{% endraw %}

### proceedCallback([callbackContext]) ⇒ <code>boolean</code> ⏏
Proceed a callback, when exists
(go to action, where the callback has been previously set)
Returns true, when postback will occur

**Kind**: Exported function  

| Param | Type | Description |
| --- | --- | --- |
| [callbackContext] | <code>string</code> | the context |

**Example**  
```javascript
bot.use(['fooRoute', /^foo$/], (req, res) => {
    // set callback, only when this request does not have one
    if (!res.proceedCallback()) {
        res.text('this is the followup question', {
            followupAction: 'Continue'
        });
    }
});
```
{% raw %}<div id="exp_module_callbackMiddleware--addCallbackQuickReply">&nbsp;</div>{% endraw %}

### addCallbackQuickReply(replyText) ⇒ <code>this</code> ⏏
Adds "back" quick reply to other replies
(alternative to `proceedCallback()`)

**Kind**: Exported function  

| Param | Type | Description |
| --- | --- | --- |
| replyText | <code>string</code> | the default text |

**Example**  
```javascript
bot.use(['fooRoute', /^foo$/], (req, res) => {
    // ability get back to previous context
    res.addCallbackQuickReply('Go back');

    res.text('So, what you want?', {
        barRoute: 'Go to bar'
    });
});
```
