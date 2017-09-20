# Working with conversation state

Stateless conversation is annoying. Noone wants to repeat, what was said. So **each user has own state object**.

## Accessing user profile

Yes, you already have user profile in state.

```javascript
const { Router } = require('botnaut');
const bot = new Router();

bot.use((req, res) => {
    const { gender, locale, profilePic, lastName, firstName } = req.state.user;
    res.text(`Hello ${firstName || 'you!'}`);
});

module.exports = bot;
```

## Using the state in navigation

Request object contains `.state` attribute, which represents state before the event, Responder updates new state with `Object.assign()` approach.

```javascript
const { Router } = require('botnaut');
const bot = new Router();

bot.use('/rename', (req, res) => {
    res.text('So, how will you call me?')
        .expected('setName');
});

bot.use('/setName', (req, res) => {
    const name = req.text();

    res.text(`Now, I'am ${name}.`)
        .setState({ name });
});

bot.use((req, res) => {
    const { name } = req.state;
    if (name) {
        res.text(`Call me ${name}, ok?`, {
            rename: 'It\'s not ok'
        });
    } else {
        res.text('I have no name, give me one!')
            .expected('setName');
    }
});

module.exports = bot;
```

This example makes conversation flow like this:

```
*-----------------------------------*
|                             Hello |
| I have no name, give me one!      |
|                                   |
|                            Albert |
| Now, I'am Albert.                 |
|                                   |
|                             Hello |
| Call me Albert, ok?               |
|                                   |
|                       It's not ok |
| So, how will you call me?         |
|                                   |
|                            Alfred |
| Now, I'am Alfred.                 |
*-----------------------------------*
```

## Reading and modifiing user state

It's good to know, that request state is not modified, when `res.setState()` is called. It will be modified after dispatching process.

```javascript
const { Router } = require('botnaut');
const bot = new Router();

bot.use((req, res) => {
    // let's give two options to user
    if (req.state.odd) {
        res.setState({ odd: false });
        // still req.state.odd === true
        this.text('Odd');
    } else {
        res.setState({ odd: true });
        // still req.state.odd === false || req.state.odd === undefined
        this.text('Even');
    }
});

module.exports = bot;
```

> It's better to avoid using "default state", because when you need to change default state in future updates,
> you should also migrate current users states to new structure.