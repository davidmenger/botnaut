/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const crypto = require('crypto');
const SecurityMiddleware = require('../src/SecurityMiddleware');

const APP_SECRET = 'a';
const TEST_BUFFER = Buffer.from(JSON.stringify({ a: 1 }));

const HASH = crypto.createHmac('sha1', APP_SECRET)
    .update(TEST_BUFFER)
    .digest('hex');

const TEST_HEADER = `sha1=${HASH}`;
const BAD_HEADER = 'sha1=fuckThisShit';
const TEST_TOKEN = 'foobar';
const TOKEN_OBJECT = { token: TEST_TOKEN };

function createFakeReq (header = null, senders = ['1', '1'], cookieToken = null, cookieName = 'botToken') {
    const req = {
        headers: {
            'x-hub-signature': header
        },
        cookies: {
            [cookieName]: cookieToken
        },
        body: {
            entry: [{
                messaging: [{
                    sender: { id: senders[0] }
                }]
            }, {
                messaging: [{
                    sender: { id: senders[1] }
                }]
            }]
        }
    };
    return req;
}

function simulateBodyParser (middleware, dataBuffer, header) {
    const req = createFakeReq(header);

    middleware(req, null, dataBuffer);
}

function createFakeTokenStorage (token = TOKEN_OBJECT) {
    const ret = {
        findByToken () {
            return Promise.resolve(token);
        }
    };

    sinon.spy(ret, 'findByToken');

    return ret;
}

function assertNiceError (done, check = () => {}) {
    return (err) => {
        assert.equal(err.code, 401);
        assert.equal(err.status, 401);
        try {
            check(err);
            done();
        } catch (e) {
            done(e);
        }
    };
}

describe('SecurityMiddleware', function () {

    describe('#getSignatureVerifier()', function () {

        it('should skip requests without signature', function () {

            const secure = new SecurityMiddleware(APP_SECRET);

            const middleware = (req, res, buf) => secure.verifySignature(buf, req.headers['x-hub-signature']);
            assert.doesNotThrow(() => {
                simulateBodyParser(middleware, Buffer.alloc(1), null);
            });
        });

        it('should throw an error, when the disignature does not match', function () {

            const secure = new SecurityMiddleware(APP_SECRET);

            const middleware = (req, res, buf) => secure.verifySignature(buf, req.headers['x-hub-signature']);

            assert.throws(() => {
                simulateBodyParser(middleware, TEST_BUFFER, BAD_HEADER);
            });
        });

        it('should skip requests without signature', function () {

            const secure = new SecurityMiddleware(APP_SECRET);

            const middleware = (req, res, buf) => secure.verifySignature(buf, req.headers['x-hub-signature']);
            assert.doesNotThrow(() => {
                simulateBodyParser(middleware, TEST_BUFFER, TEST_HEADER);
            });
        });

    });

    describe('#verifyReq()', function () {

        it('should throw an error, when there s no sign of authorization', function (done) {
            const secure = new SecurityMiddleware(APP_SECRET);
            const req = createFakeReq();

            secure.verifyReq(req)
                .catch(assertNiceError(done));
        });

        it('should throw an error, there are different senders', function (done) {
            const tokenStorage = createFakeTokenStorage();
            const secure = new SecurityMiddleware(APP_SECRET, tokenStorage);
            const req = createFakeReq(null, ['1', '2'], TEST_TOKEN);

            secure.verifyReq(req)
                .catch(assertNiceError(done));
        });

        it('should throw an error, there is no sender', function (done) {
            const tokenStorage = createFakeTokenStorage();
            const secure = new SecurityMiddleware(APP_SECRET, tokenStorage);
            const req = createFakeReq(null, [], TEST_TOKEN);

            secure.verifyReq(req)
                .catch(assertNiceError(done));
        });

        it('should throw an error, there is no token in storage', function (done) {
            const tokenStorage = createFakeTokenStorage(null);
            const secure = new SecurityMiddleware(APP_SECRET, tokenStorage);
            const req = createFakeReq(null, undefined, TEST_TOKEN);

            secure.verifyReq(req)
                .catch(assertNiceError(done, () => {
                    assert(tokenStorage.findByToken.calledOnce);
                    assert.equal(tokenStorage.findByToken.firstCall.args[0], TEST_TOKEN);
                    assert.equal(tokenStorage.findByToken.firstCall.args[1], '1');
                }));
        });

        it('should work', function () {
            const tokenStorage = createFakeTokenStorage();
            const secure = new SecurityMiddleware(APP_SECRET, tokenStorage);
            const req = createFakeReq(null, undefined, TEST_TOKEN);

            return secure.verifyReq(req)
                .then((token) => {
                    assert.deepEqual(token, TOKEN_OBJECT);
                    assert(tokenStorage.findByToken.calledOnce);
                    assert.equal(tokenStorage.findByToken.firstCall.args[0], TEST_TOKEN);
                    assert.equal(tokenStorage.findByToken.firstCall.args[1], '1');
                });
        });

        it('should work with another cookie name', function () {
            const tokenStorage = createFakeTokenStorage();
            const secure = new SecurityMiddleware(APP_SECRET, tokenStorage, 'anotherCookie');
            const req = createFakeReq(null, undefined, TEST_TOKEN, 'anotherCookie');

            return secure.verifyReq(req)
                .then((token) => {
                    assert.deepEqual(token, TOKEN_OBJECT);
                    assert(tokenStorage.findByToken.calledOnce);
                    assert.equal(tokenStorage.findByToken.firstCall.args[0], TEST_TOKEN);
                    assert.equal(tokenStorage.findByToken.firstCall.args[1], '1');
                });
        });

        it('should let requests with FB sha signatures go', function () {
            const tokenStorage = createFakeTokenStorage();
            const secure = new SecurityMiddleware(APP_SECRET, tokenStorage);
            const req = createFakeReq('sha1=ab^&$@c', ['1', '2']);

            return secure.verifyReq(req)
                .then((token) => {
                    assert.strictEqual(token, null);
                    assert(!tokenStorage.findByToken.called);
                });
        });

    });

});
