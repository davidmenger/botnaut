# Botnaut - Facebook Messenger platform framework

[![CircleCI](https://circleci.com/gh/pragonauts/botnaut/tree/master.svg?style=svg)](https://circleci.com/gh/pragonauts/botnaut/tree/master)

Framework for building reusable chatbot components. **Routing**, **Keyword recognition** is built-in.

- [**[API documentation](https://botnaut.pragonauts.com)**]

## Requirements and installation

  - requires `mongoose` > 4.0
  - requires `nodejs` > 6.0
  - requires `express` > 4.0
  - requires `body-parser` > 1.10

  ```bash
  $ npm i -S botnaut
  ```

## Basic setup with Express

It's easy. This basic example can handle everything.

```javascript
const express = require('express');
const { Router } = require('botnaut');
const { createRouter, createProcessor } = require('botnaut/express');

const bot = new Router();

bot.use('/hello', (req, res, postBack) => {
    res.text('Hello world');
});

bot.use((req, res, postBack) => {
    res.text('What you want?', {
        hello: 'Say hello world'
    });
});

const processor = createProcessor(bot, {
    pageToken: 'pagetokenhere',
    appSecret: 'botappsecret',
    autoTyping: true
});

const app = express();

app.use('/bot', createRouter(processor, 'verifyTokenHere'));

app.listen(3000);
```