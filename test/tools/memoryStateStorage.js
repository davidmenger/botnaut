/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const MemoryStateStorage = require('../../src/tools/MemoryStateStorage');

const SENDER_ID = 'a';
const DEFAULT_STATE = { x: 1 };

describe('MemoryStateStorage', function () {

    describe('#getOrCreateAndLock()', function () {

        it('should return state with state object', function () {
            const storage = new MemoryStateStorage();

            return storage.getOrCreateAndLock(SENDER_ID, DEFAULT_STATE)
                .then((state) => {
                    assert.deepEqual(state.state, DEFAULT_STATE);
                });
        });

    });

    describe('#saveState()', function () {

        it('should return state with state object', function () {
            const storage = new MemoryStateStorage();

            return storage.getOrCreateAndLock(SENDER_ID, DEFAULT_STATE)
                .then(state => Object.assign(state, { state: { ko: 1 } }))
                .then(state => storage.saveState(state))
                .then((state) => {
                    assert.deepEqual(state.state, { ko: 1 });

                    return storage.getOrCreateAndLock(SENDER_ID, { ko: 1 });
                })
                .then((state) => {
                    assert.deepEqual(state.state, { ko: 1 });
                });
        });

    });

});
