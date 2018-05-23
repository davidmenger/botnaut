# Using With Wingbot

## Bot configuration

**bot.js** - common file for every configuration

```javascript
'use strict';
const { BuildRouter, Blocks, Router, ai } = require('botnaut');

const wingbotConfig = {
    botId: '2d48492a-a281-4223-8e6f-7f60a447bc41',
    snapshot: 'development',
    token: 'wingbot-token'
};

const botName = 'bot-name';

const blocks = new Blocks();

blocks.code('exampleBlock', function* (req, res, postBack, context, params) {
    yield res.run('responseBlockName');
});

ai.register(`${botName}-${wingbotConfig.snapshot}`);

function botFactory () {
    const bot = new BuildRouter(wingbotConfig, blocks);

    bot.use((req, res) => {
        // example middleware
        return Router.CONTINUE;
    });

    return bot;
}

module.exports = {
    botFactory,
    wingbotConfig
};
```

## Express Mongodb

**app.js**

```javascript
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {
    createRouter, createProcessor, createValidator, createUpdater
} = require('botnaut/express');
const { botFactory, wingbotConfig } = require('./bot');

const bot = botFactory();

const processor = createProcessor(bot, {
    pageToken: '--fb-page-token--',
    appSecret: '--fb-app-secret',
    autoTyping: true,
});

const app = express();

app.use('/botnaut', createRouter(processor, '--webhook-verification-token--'));

app.post('/update', createUpdater(bot, wingbotConfig.token));

app.post('/validate', createValidator(bodyParser, {
    routerFactory: botFactory,
    token: wingbotConfig.token
}));

mongoose.connect('mongodb://localhost/myapp')
    .then(() => app.listen(3000));
```

## Serverless AWS Lambda

example application for

**botHandler.js**

```javascript
'use strict';
const AWS = require('aws-sdk');
const { createHandler, createProcessor, createValidator } = require('botnaut/serverlessAWS');
const { botFactory, wingbotConfig } = require('./bot');

const dynamoDb = new AWS.DynamoDB({
    // for localhost
    // endpoint: new AWS.Endpoint('http://localhost:8000'),
    // region: 'eu-west-1'
    apiVersion: '2012-08-10'
});

const bot = botFactory();

const processor = createProcessor(bot, {
    pageToken: '--fb-page-token--',
    appSecret: '--fb-app-secret',
    autoTyping: true,
    dynamo: {
        db: dynamoDb,
        tablePrefix: `${process.env.PREFIX}-`
    }
});

module.exports.handleRequest = createHandler(processor, '--webhook-verification-token--');

module.exports.validateBot = createValidator({
    routerFactory: botFactory,
    token: wingbotConfig.token
});
```

**updateHandler.js**

```javascript
const { createUpdater } = require('botnaut/serverlessAWS');

module.exports.update = createUpdater('lambda-fn-name', 'wingbot-token');
```
**serverless.yml**

```yaml
service: wingbot-botnaut

custom:
  accountId: 12344566
  stage: ${opt:stage, self:provider.stage}
  prefix: ${self:service}-${self:custom.stage}

provider:
  name: aws
  runtime: nodejs6.10
  region: eu-west-1
  stage: staging
  memorySize: 256

  iamRoleStatements: # permissions for all of your functions can be set here
    - Effect: Allow
      Action: # Gives permission to DynamoDB tables in a specific region
        - dynamodb:DescribeTable
      Resource: arn:aws:dynamodb:${self:provider.region}:*:*
    - Effect: Allow
      Action: # Gives permission to DynamoDB tables in a specific region
        - dynamodb:DescribeTable
        - dynamodb:Query
        - dynamodb:Scan
        - dynamodb:GetItem
        - dynamodb:PutItem
        - dynamodb:UpdateItem
        - dynamodb:DeleteItem
      Resource: arn:aws:dynamodb:${self:provider.region}:*:table/${self:custom.prefix}*

  environment:
    PREFIX: ${self:custom.prefix}
    NODE_ENV: ${self:custom.stage}

functions:
  botnaut:
    handler: botHandler.handleRequest
    maxRetries: 1
    timeout: 30
    events:
      - http: GET /botnaut
      - http: POST /botnaut

  validateBot:
    handler: botHandler.validateBot
    memorySize: 192
    events:
      - http: POST /validate

  updateLambdaHandler:
    handler: updateLambdaHandler.update
    memorySize: 192
    timeout: 30
    role: DeployRole
    events:
      - http: POST /update

resources:

  Resources:

    DeployRole:
      Type: AWS::IAM::Role
      Properties:
        AssumeRolePolicyDocument:
          Statement:
            - Effect: Allow
              Principal:
                Service: lambda.amazonaws.com
              Action:
                - sts:AssumeRole

        Path: '/'
        RoleName: ${self:custom.prefix}-${self:provider.region}-workerRole
        Policies:
          - PolicyName: ${self:custom.prefix}-workerLambda
            PolicyDocument:
              Statement:
                - Effect: Allow
                  Action:
                    - "logs:CreateLogGroup"
                    - "logs:CreateLogStream"
                  Resource:
                    - 'arn:aws:logs:${self:provider.region}:${self:custom.accountId}:log-group:/aws/lambda/${self:custom.prefix}-updateLambdaHandler:*'
                - Effect: Allow
                  Action:
                    - "logs:PutLogEvents"
                  Resource:
                    - 'arn:aws:logs:${self:provider.region}:${self:custom.accountId}:log-group:/aws/lambda/${self:custom.prefix}-updateLambdaHandler:*:*'
                - Effect: Allow
                  Action:
                    - "lambda:GetFunctionConfiguration"
                    - "lambda:UpdateFunctionConfiguration"
                  Resource:
                    - "arn:aws:lambda:${self:provider.region}:${self:custom.accountId}:function:${self:custom.prefix}-botnaut"

    StatesTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:custom.prefix}-states
        AttributeDefinitions:
          - AttributeName: senderId
            AttributeType: S
        KeySchema:
          - AttributeName: senderId
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1

    ChatlogTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:custom.prefix}-chatlog
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
          - AttributeName: time
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
          - AttributeName: time
            KeyType: RANGE
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1

    BottokensTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:custom.prefix}-bottokens
        AttributeDefinitions:
          - AttributeName: senderId
            AttributeType: S
          - AttributeName: token
            AttributeType: S
        KeySchema:
          - AttributeName: senderId
            KeyType: HASH
        GlobalSecondaryIndexes:
          - IndexName: token
            KeySchema:
              - AttributeName: token
                KeyType: HASH
            Projection:
              ProjectionType: ALL
            ProvisionedThroughput:
              ReadCapacityUnits: 1
              WriteCapacityUnits: 1
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1

```