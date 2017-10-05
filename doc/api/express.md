## Classes

<dl>
<dt><a href="#State">State</a></dt>
<dd><p>Conversation state storage</p>
</dd>
<dt><a href="#ChatLog">ChatLog</a></dt>
<dd><p>Chat logs storage</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#createProcessor">createProcessor(reducer, processorOptions, [stateStorage])</a></dt>
<dd><p>Create a chat event processor</p>
</dd>
<dt><a href="#createRouter">createRouter(reducer, verifyToken, [log])</a></dt>
<dd><p>Create an express route for accepting messenger events</p>
</dd>
</dl>

{% raw %}<div id="State">&nbsp;</div>{% endraw %}

## State
Conversation state storage

**Kind**: global class  

* [State](#State)
    * [.connectAndSubscribe(senderId, [defaultState], [timeout])](#State_connectAndSubscribe) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.onAfterStateLoad(req, state)](#State_onAfterStateLoad) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.saveState(state)](#State_saveState) ⇒ <code>Promise</code>

{% raw %}<div id="State_connectAndSubscribe">&nbsp;</div>{% endraw %}

### state.connectAndSubscribe(senderId, [defaultState], [timeout]) ⇒ <code>Promise.&lt;Object&gt;</code>
Load state and lock for other requests

**Kind**: instance method of [<code>State</code>](#State)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| senderId | <code>\*</code> |  | user identifier |
| [defaultState] | <code>Object</code> | <code>Object</code> | given default state |
| [timeout] | <code>number</code> | <code>300</code> | given default state |

{% raw %}<div id="State_onAfterStateLoad">&nbsp;</div>{% endraw %}

### state.onAfterStateLoad(req, state) ⇒ <code>Promise.&lt;Object&gt;</code>
Called after load for postprocessing purposes

**Kind**: instance method of [<code>State</code>](#State)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Request</code> | chat request |
| state | <code>Object</code> | given default state |

{% raw %}<div id="State_saveState">&nbsp;</div>{% endraw %}

### state.saveState(state) ⇒ <code>Promise</code>
Called for saving state

**Kind**: instance method of [<code>State</code>](#State)  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Object</code> | given default state |

{% raw %}<div id="ChatLog">&nbsp;</div>{% endraw %}

## ChatLog
Chat logs storage

**Kind**: global class  

* [ChatLog](#ChatLog)
    * [.log(userId, responses, request)](#ChatLog_log)
    * [.error(err, userId, [responses], [request])](#ChatLog_error)

{% raw %}<div id="ChatLog_log">&nbsp;</div>{% endraw %}

### chatLog.log(userId, responses, request)
Log single event

**Kind**: instance method of [<code>ChatLog</code>](#ChatLog)  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> |  |
| responses | <code>Array.&lt;Object&gt;</code> | list of sent responses |
| request | <code>Object</code> | event request |

{% raw %}<div id="ChatLog_error">&nbsp;</div>{% endraw %}

### chatLog.error(err, userId, [responses], [request])
Log single event

**Kind**: instance method of [<code>ChatLog</code>](#ChatLog)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>any</code> | error |
| userId | <code>string</code> |  |
| [responses] | <code>Array.&lt;Object&gt;</code> | list of sent responses |
| [request] | <code>Object</code> | event request |

{% raw %}<div id="createProcessor">&nbsp;</div>{% endraw %}

## createProcessor(reducer, processorOptions, [stateStorage])
Create a chat event processor

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| reducer | <code>function</code> \| <code>Router</code> | Root router object or processor function |
| processorOptions | <code>Object</code> | settings for message processing |
| [processorOptions.pageToken] | <code>string</code> | page token |
| [processorOptions.appSecret] | <code>string</code> | bot application secret |
| [processorOptions.appUrl] | <code>string</code> | where the bot application is deployed |
| [processorOptions.timeout] | <code>number</code> | how long the state will be locked for single event |
| [processorOptions.log] | <code>Object</code> | console.log/error/warn like object |
| [processorOptions.defaultState] | <code>Object</code> | default conversation state |
| [processorOptions.chatLog] | <code>MongoChatLog</code> | discussion logger |
| [processorOptions.tokenStorage] | <code>MongoBotToken</code> | storage for chabot tokens |
| [processorOptions.senderFnFactory] | <code>function</code> | override default sender function |
| [processorOptions.securityMiddleware] | <code>function</code> | override webview calls authorizer |
| [processorOptions.cookieName] | <code>string</code> | webview cookie (for default securityMiddleware) |
| [processorOptions.loadUsers] | <code>boolean</code> | set false to not load user profiles |
| [processorOptions.userLoader] | <code>Object</code> | override default user loader |
| [processorOptions.onSenderError] | <code>function</code> | override default sender error reporter |
| [processorOptions.autoTyping] | <code>Object</code> \| <code>boolean</code> | enable auto typing |
| [processorOptions.autoTyping.time] | <code>number</code> | default typing time |
| [processorOptions.autoTyping.perCharacters] | <code>number</code> | typing time per character |
| [processorOptions.autoTyping.minTime] | <code>number</code> | auto typing lower threshold |
| [processorOptions.autoTyping.maxTime] | <code>number</code> | auto typing upper threshold |
| [stateStorage] | <code>MongoState</code> | storage for states |

**Example**  
```javascript
const express = require('express');
const bodyParser = require('body-parser');
const { createRouter, createProcessor } = require('botnaut/express');

const handler = (req, res, postBack) => {
    res.typingOn()
        .wait();

    switch (req.action()) {
        case 'hello':
            res.text('Hello world');
            return;
        default:
            // send one quick reply
            res.text('What you want?', {
                hello: 'Say hello world'
            })
    }
};

const processor = createProcessor(handler, {
    pageToken: 'stringhere',
    appSecret: 'botappsecret'
});

app = express();

app.use('/bot', createRouter(processor));

app.listen(3000);
```
{% raw %}<div id="createRouter">&nbsp;</div>{% endraw %}

## createRouter(reducer, verifyToken, [log])
Create an express route for accepting messenger events

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| reducer | <code>function</code> \| <code>Router</code> | Root router object or processor function |
| verifyToken | <code>string</code> | chatbot application token |
| [log] | <code>Object</code> | console.* like logger object |

