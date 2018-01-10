## Functions

<dl>
<dt><a href="#createProcessor">createProcessor(reducer, processorOptions, [stateStorage])</a></dt>
<dd><p>Create a chat event processor</p>
</dd>
<dt><a href="#createUpdater">createUpdater(lambdaName, [token], [log])</a></dt>
<dd><p>Create updater handler for wingbot which deploys new lambda version</p>
<p>listens for POST on <code>/update</code></p>
</dd>
<dt><a href="#createHandler">createHandler(processor, verifyToken, [log], [onDispatch])</a></dt>
<dd><p>Create an serverless handler for accepting messenger events</p>
</dd>
<dt><a href="#createValidator">createValidator(config, [log], [onDispatch])</a></dt>
<dd><p>Create validator handler for wingbot configurations</p>
<p>listens for POST on <code>/validate</code></p>
</dd>
</dl>

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
| [processorOptions.chatLog] | <code>DynamoChatLog</code> | discussion logger |
| [processorOptions.tokenStorage] | <code>DynamoBotToken</code> | storage for chabot tokens |
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
| [processorOptions.dynamo] | <code>Object</code> | dynamodb configuration |
| [processorOptions.dynamo.db] | <code>AWS.DynamoDB</code> | dynamodb db object |
| [processorOptions.dynamo.tablePrefix] | <code>string</code> | dynamodb table prefix |
| [stateStorage] | <code>DynamoState</code> | storage for states |

{% raw %}<div id="createUpdater">&nbsp;</div>{% endraw %}

## createUpdater(lambdaName, [token], [log])
Create updater handler for wingbot which deploys new lambda version

listens for POST on `/update`

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| lambdaName | <code>string</code> |  | bot handler name |
| [token] | <code>string</code> | <code>null</code> | bot authorization token |
| [log] | <code>object</code> |  | console.* like logger object |

{% raw %}<div id="createHandler">&nbsp;</div>{% endraw %}

## createHandler(processor, verifyToken, [log], [onDispatch])
Create an serverless handler for accepting messenger events

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| processor | <code>Processor</code> \| <code>Hook</code> | Root router object or processor function |
| verifyToken | <code>string</code> | chatbot application token |
| [log] | <code>object</code> | console.* like logger object |
| [onDispatch] | <code>function</code> | will be called after dispatch of all events |

{% raw %}<div id="createValidator">&nbsp;</div>{% endraw %}

## createValidator(config, [log], [onDispatch])
Create validator handler for wingbot configurations

listens for POST on `/validate`

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> |  |
| [config.token] | <code>string</code> | authorization token |
| [config.blocksResource] | <code>Blocks</code> | authorization token |
| [config.routerFactory] | <code>function</code> | creates blank router for testing purposes |
| [config.testText] | <code>string</code> | text for router testing (null to disable) |
| [config.testPostBack] | <code>string</code> | postback to test the bot (null to disable) |
| [log] | <code>object</code> | console.* like logger object |
| [onDispatch] | <code>function</code> |  |

