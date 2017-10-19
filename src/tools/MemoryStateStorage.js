/*
 * @author David Menger
 */
'use strict';

/**
 * Memory conversation state storage for testing purposes
 *
 * @class
 */
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

    /**
     *
     * @param {any} senderId - sender identifier
     * @param {Object} defaultState - default state of the conversation
     * @returns {Promise.<Object>} - conversation state
     */
    getOrCreateAndLock (senderId, defaultState = {}) {
        const state = this.getState(senderId, defaultState);
        return Promise.resolve(state);
    }

    /**
     *
     * @param {Request} req - chat request
     * @param {Object} state - conversation state
     * @returns {Promise.<Object>} - conversation state
     */
    onAfterStateLoad (req, state) {
        return Promise.resolve(state);
    }

    /**
     *
     * @param {Object} state - conversation state
     * @returns {Promise}
     */
    saveState (state) {
        this.store.set(state.senderId, state);
        return Promise.resolve(state);
    }

}

module.exports = MemoryStateStorage;
