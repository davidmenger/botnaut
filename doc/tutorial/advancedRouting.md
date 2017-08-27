# Advanced Routing

## Resolving actions

Text is always treated as action, so theese two routes are matched same, when the `/cat` action is issued.

```javascript
const { Router } = require('botnaut');
const bot = new Router();

bot.use(req => req.action() === '/cat', (req, res) => {
    res.text('Matched!');
});

bot.use('/cat', (req, res) => { res.text('Matched!'); });

module.exports = bot;
```

> Actual path resolver also takes into account the fact, that routers can be nested.

## Simple text actions

It's possible to use reqular expression to match the specific text input. Without any AI tool.

```javascript
const { Router } = require('botnaut');
const bot = new Router();

bot.use(/h[ea]llo|hallo|ciao/, (req, res) => {
    res.text('Matched:')
        .text(req.text(true)); // echoes normalized text
});

bot.use((req, res) => { res.text('Not matched'); });

module.exports = bot;
```

And the code works like this. It matches lot of words, because the regular expression
does not match whole words:

```
*-----------------------------------*
|                             Hello |
| Matched:                          |
| hello                             |
|                                   |
|                      Hello robot! |
| Matched:                          |
| hello-robot                       |
|                                   |
|                         Hi! Čiaó! |
| Matched:                          |
| hi-ciao                           |
|                                   |
|                           HiHello |
| hihello                           |
*-----------------------------------*
```

## Integrating with AI prediction

It's ofcourse possible to make integration with 3rd party service. Function should return a boolean, where `true === CONTINUE` and `false === BREAK`.

```javascript
const { Router } = require('botnaut');
const keyworder = require('keyworder');
const bot = new Router();

bot.use((req) => {
    if (req.action()) {
        // skip events with specific action (postback, quick reply, ref...)
        return false;
    }
    return keyworder.resolve(req.text())
        .then(intents => intents
            .some(intent => intent.tag === 'greeting' && intent.score > 0.95)
        );

}, (req, res) => {
    res.text('Matched:');
});

module.exports = bot;
```

## Redirecting flow with Post Back

Sometimes there is need to redirect the conversation flow. For theese purposes,
there is a `postBack(action: string, data: object?)` function.

```javascript
const { Router } = require('botnaut');
const bot = new Router();

bot.use('world', (req, res) => {
    res.text('world');
});

bot.use((req, res, postBack) => {
    res.text('Hello');
    postBack('world');
});

module.exports = bot;
```

The result of postBack looks like this

```
*-----------------------------------*
|                       Let's start |
| hello                             |
| world                             |
*-----------------------------------*
```

## Or conditions - addressable text microiteractions

Some microinteractions can be triggered by text and also by action, so why to separate them.

**!addressable microiteractions has global scope**

```javascript
const bot = new Router();

bot.use(['world', /^world-text$/], (req, res) => {
    res.text('world');
});

bot.use((req, res, postBack) => {
    res.text('Hello', {
        world: 'quick reply'
    }).expected('./');
});

module.exports = bot;
```

The result looks like this:

```
*-----------------------------------*
|                       Let's start |
| Hello                             |
|                             world |
| world                             |
*-----------------------------------*
```

## Expected cases

For clean code it's good to handle text for quick replies separately.

```javascript
const bot = new Router();

bot.use((req, res, postBack) => {
    res.text('Hello', {
        world: 'quick reply'
    }).expected('expectedRoute');
});

bot.use('expectedRoute', /^foo$/, (req, res) => res.text('foooooo'));

bot.use('expectedRoute', /^bar$/, (req, res) => res.text('barrrrr'));

module.exports = bot;
```

The result looks like this:

```
*-----------------------------------*
|                       Let's start |
| Hello                             |
|                               bar |
| bar                               |
*-----------------------------------*
```