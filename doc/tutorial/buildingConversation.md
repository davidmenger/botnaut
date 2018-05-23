# Building a Conversation

## Echo: Reacting to text messages

Let's start with simple example. This is how to make an echo.

```javascript
const { Router } = require('botnaut');
const bot = new Router();

// this route processes all incomming messages
bot.use((req, res) => {
    res.text('I\'ve got this message:')
        .text(req.text());
});

module.exports = bot;
```

This works like this:

```
*-----------------------------------*
|                            Hello! |
| I've got this message:            |
| Hello!                            |
|                                   |
|              It smells like updog |
| I've got this message:            |
| It smells like updog              |
*-----------------------------------*
```

## Asking a question

When asking user a question, it's important to keeping reply in context. The `res.expected(<path>)` method ensures, that response will be dispatched by `/whichCat` route.

Routes shoud always begin with `/` slash, but when referencing route, starting slash is treated as absolute path reference. When you omit the starting slash, path is treated as relative.

```javascript
const { Router } = require('botnaut');
const bot = new Router();

bot.use('/whichCat', (req, res, postBack) => {
    const lowercaseText = req.text(true); // converts "Nýan. Cát" to "nyan-cat"

    if (lowercaseText.match(/nyan-cat/)) {
        res.text('Yeah, nyan cat!');
    } else if (lowercaseText.match(/grumpy-cat/)) {
        res.text('Ugh, grumpy cat!');
    } else {
        return Router.CONTINUE;
    }
});

bot.use((req, res) => {
    res.text('So, Nyan cat or grumpy cat?')
        .expected('whichCat'); // set the route, which will process next text request
});

module.exports = bot;
```

This works like this:

```
*-----------------------------------*
|                          Nyan cat |
| So, Nyan cat or grumpy cat?       |
|                                   |
|                          Nyan cat |
| Yeah, nyan cat!                   |
|                                   |
|                             What? |
| So, Nyan cat or grumpy cat?       |
*-----------------------------------*
```

## Using Quick Replies for controlling conversation

Click is always simplier then writing a text. And also working with events is much easier then text processing.
Let's lead conversation throuch quick replies.

```javascript
const { Router } = require('botnaut');
const bot = new Router();

bot.use('/grumpy', (req, res) => {
    res.text('Ugh, grumpy cat!');
});

bot.use('/nyan', (req, res) => {
    res.text('Yeah, nyan cat!');
});

bot.use((req, res) => {
    // let's give two options to user
    res.text('So, Nyan cat or grumpy cat?', {
        grumpy: 'Grumpy cat',
        nyan: 'Nyan cat'
    });
});

module.exports = bot;
```

This code works **exacly like previous example**, because when quick replies are used, treir text representation
is used to match the users input. String `"Nyan cat"` is converted to regular expression `/nyan-cat/`;


## Post Back is also an action!

We've normalized all Quick Replies, Post Backs, or Referrals to actions! You don't have to care about action type.


```javascript
const { Router } = require('botnaut');
const bot = new Router();

bot.use('/grumpy', (req, res) => {
    res.text('Ugh, grumpy cat!');
});

bot.use('/nyan', (req, res) => {
    res.text('Yeah, nyan cat!');
});

bot.use((req, res) => {
    // allow access grumpy cat with button
    res.button('Lets choose grumpy cat')
        .postBackButton('Call it', 'grumpy')
        .send();

    // and nyan cat with quick reply
    res.text('So, Nyan cat or grumpy cat?', {
        nyan: 'Nyan cat'
    });
});

module.exports = bot;
```
