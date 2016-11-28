/*
 * @author David Menger
 */
'use strict';

class MemoryStateStorage {

    constructor () {
        this.store = new Map();
    }

    getOrCreateAndLock (senderId, defaultState = {}) {
        if (this.store.has(senderId)) {
            return Promise.resolve(this.store.get(senderId));
        }
        const state = {
            senderId,
            state: defaultState
        };
        return this.saveState(state);
    }

    saveState (state) {
        this.store.set(state.senderId, state);
        return Promise.resolve(state);
    }

}

module.exports = MemoryStateStorage;
