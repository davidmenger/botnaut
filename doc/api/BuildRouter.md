## Classes

<dl>
<dt><a href="#BuildRouter">BuildRouter</a></dt>
<dd></dd>
<dt><a href="#BuildRouter">BuildRouter</a></dt>
<dd></dd>
<dt><a href="#Blocks">Blocks</a></dt>
<dd><p>Custom code blocks for BuildRouter and wingbot.ai</p>
</dd>
</dl>

{% raw %}<div id="BuildRouter">&nbsp;</div>{% endraw %}

## BuildRouter
**Kind**: global class  

* [BuildRouter](#BuildRouter)
    * [new BuildRouter()](#new_BuildRouter_new)
    * [new BuildRouter(block, blocksResource)](#new_BuildRouter_new)
    * [.fromData()](#BuildRouter_fromData)

{% raw %}<div id="new_BuildRouter_new">&nbsp;</div>{% endraw %}

### new BuildRouter()
Build bot from Wingbot configuration file or snapshot url

{% raw %}<div id="new_BuildRouter_new">&nbsp;</div>{% endraw %}

### new BuildRouter(block, blocksResource)
Create new router from configuration


| Param | Type | Description |
| --- | --- | --- |
| block | <code>object</code> |  |
| [block.botId] | <code>string</code> | the ID of bot |
| [block.snapshot] | <code>string</code> | snapshot stage of bot |
| [block.token] | <code>string</code> | authorization token for bot |
| [block.routes] | <code>object</code> | list of routes for direct bot build |
| [block.url] | <code>string</code> | specify alternative configuration resource |
| blocksResource | [<code>Blocks</code>](#Blocks) | custom code blocks resource |

**Example**  
```javascript
// usage under serverless environment

const { Settings, BuildRouter, Blocks } = require('botnaut');
const { createHandler, createProcessor } = require('botnaut/serverlessAWS');
const dynamoDb = require('./lib/dynamodb');
const config = require('./config');

const blocks = new Blocks();

blocks.code('exampleBlock', function* (req, res, postBack, context, params) {
    yield res.run('responseBlockName');
});

const bot = new BuildRouter({
    botId: 'b7a71c27-c295-4ab0-b64e-6835b50a0db0',
    snapshot: 'master',
    token: 'adjsadlkadjj92n9u9'
}, blocks);

const processor = createProcessor(bot, {
    appUrl: config.pageUrl,
    pageToken: config.facebook.pageToken,
    appSecret: config.facebook.appSecret,
    autoTyping: true,
    dynamo: {
        db: dynamoDb,
        tablePrefix: `${config.prefix}-`
    }
});

const settings = new Settings(config.facebook.pageToken, log);

if (config.isProduction) {
    settings.getStartedButton('/start');
    settings.whitelistDomain(config.pageUrl);
}

module.exports.handleRequest = createHandler(processor, config.facebook.botToken);
```
{% raw %}<div id="BuildRouter_fromData">&nbsp;</div>{% endraw %}

### BuildRouter.fromData()
**Kind**: static method of [<code>BuildRouter</code>](#BuildRouter)  
{% raw %}<div id="BuildRouter">&nbsp;</div>{% endraw %}

## BuildRouter
**Kind**: global class  

* [BuildRouter](#BuildRouter)
    * [new BuildRouter()](#new_BuildRouter_new)
    * [new BuildRouter(block, blocksResource)](#new_BuildRouter_new)
    * [.fromData()](#BuildRouter_fromData)

{% raw %}<div id="new_BuildRouter_new">&nbsp;</div>{% endraw %}

### new BuildRouter()
Build bot from Wingbot configuration file or snapshot url

{% raw %}<div id="new_BuildRouter_new">&nbsp;</div>{% endraw %}

### new BuildRouter(block, blocksResource)
Create new router from configuration


| Param | Type | Description |
| --- | --- | --- |
| block | <code>object</code> |  |
| [block.botId] | <code>string</code> | the ID of bot |
| [block.snapshot] | <code>string</code> | snapshot stage of bot |
| [block.token] | <code>string</code> | authorization token for bot |
| [block.routes] | <code>object</code> | list of routes for direct bot build |
| [block.url] | <code>string</code> | specify alternative configuration resource |
| blocksResource | [<code>Blocks</code>](#Blocks) | custom code blocks resource |

**Example**  
```javascript
// usage under serverless environment

const { Settings, BuildRouter, Blocks } = require('botnaut');
const { createHandler, createProcessor } = require('botnaut/serverlessAWS');
const dynamoDb = require('./lib/dynamodb');
const config = require('./config');

const blocks = new Blocks();

blocks.code('exampleBlock', function* (req, res, postBack, context, params) {
    yield res.run('responseBlockName');
});

const bot = new BuildRouter({
    botId: 'b7a71c27-c295-4ab0-b64e-6835b50a0db0',
    snapshot: 'master',
    token: 'adjsadlkadjj92n9u9'
}, blocks);

const processor = createProcessor(bot, {
    appUrl: config.pageUrl,
    pageToken: config.facebook.pageToken,
    appSecret: config.facebook.appSecret,
    autoTyping: true,
    dynamo: {
        db: dynamoDb,
        tablePrefix: `${config.prefix}-`
    }
});

const settings = new Settings(config.facebook.pageToken, log);

if (config.isProduction) {
    settings.getStartedButton('/start');
    settings.whitelistDomain(config.pageUrl);
}

module.exports.handleRequest = createHandler(processor, config.facebook.botToken);
```
{% raw %}<div id="BuildRouter_fromData">&nbsp;</div>{% endraw %}

### BuildRouter.fromData()
**Kind**: static method of [<code>BuildRouter</code>](#BuildRouter)  
{% raw %}<div id="Blocks">&nbsp;</div>{% endraw %}

## Blocks
Custom code blocks for BuildRouter and wingbot.ai

**Kind**: global class  

* [Blocks](#Blocks)
    * [.resolver(type, factoryFn)](#Blocks_resolver)
    * [.code(name, [factoryFn])](#Blocks_code)

{% raw %}<div id="Blocks_resolver">&nbsp;</div>{% endraw %}

### blocks.resolver(type, factoryFn)
Register resolver factory

**Kind**: instance method of [<code>Blocks</code>](#Blocks)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | resolver type |
| factoryFn | <code>function</code> | resolver factory |

{% raw %}<div id="Blocks_code">&nbsp;</div>{% endraw %}

### blocks.code(name, [factoryFn])
Register custom code block

**Kind**: instance method of [<code>Blocks</code>](#Blocks)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> \| [<code>Blocks</code>](#Blocks) |  | block name or blocks object to include |
| [factoryFn] | <code>string</code> | <code>null</code> | block factory - optional when including another blocks object |

