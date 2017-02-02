/*
 * @author David Menger
 */
'use strict';

class MemoryStateStorage {

    constructor () {
        this.store = new Map();
    }

    getState (senderId, defaultState = {}) {
        if (this.store.has(senderId)) {
            return this.store.get(senderId);
        }
        const state = {
            senderId,
            state: defaultState
        };
        this.saveState(state);
        return state;
    }

    getOrCreateAndLock (senderId, defaultState = {}) {
        const state = this.getState(senderId, defaultState);
        return Promise.resolve(state);
    }

    onAfterStateLoad (req, state) {
        return Promise.resolve(state);
    }

    saveState (state) {
        this.store.set(state.senderId, state);
        return Promise.resolve(state);
    }

}

module.exports = MemoryStateStorage;
