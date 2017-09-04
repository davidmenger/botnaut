# Testing the Bot

## It's simple

We made testing bots as simple as possible. Our testing tool provides methods
for simulating

```javascript
const { Tester } = require('botnaut');
const assert = require('assert');
const bot = require('../botRoot');

describe('/bot', function () {

    it('should work', async function () {
        const t = new Tester(bot);

        await t.postBack('/start'); // send the postback

        t.passedAction('start');   // check, that action passed

        t.any()
            .contains('Hello')     // check the text response
            .quickReplyAction('continue');

        await t.quickReply('continue'); // select the quick reply

        t.passedAction('introduction');

        await t.text('Show me the goods!');

        t.any()
            .templateType('generic'); // look for generic template

        // check the state
        assert.strictEqual(t.getState().seenGoods, true, 'seenGoods has to be true');
    });

});
```