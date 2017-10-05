/*
 * @author David Menger
 */
'use strict';

const EventEmitter = require('events');

/**
 * Solution for catching events. This is useful for analytics.
 *
 * @class ReducerWrapper
 * @extends {EventEmitter}
 *
 * @fires ReducerWrapper#action
 *
 * @example
 * const reducer = new ReducerWrapper((req, res) => {
 *     res.text('Hello');
 * });
 *
 * reducer.on('action', (senderId, processedAction, text, req) => {
 *     // log action
 * });
 */
class ReducerWrapper extends EventEmitter {

    /**
     * Creates an instance of ReducerWrapper.
     *
     * @param {function} [reduce=o => o] the handler function
     *
     * @memberOf ReducerWrapper
     */
    constructor (reduce = o => o) {
        super();

        this._reduce = reduce;

        this.processMessage = null;

        this.setMaxListeners(Infinity);
    }

    /**
     * Reducer function
     *
     * @param {Request} req
     * @param {Responder} res
     * @param {function} postBack
     *
     * @memberOf ReducerWrapper
     */
    reduce (req, res, postBack) {
        this._reduce(req, res, postBack);
        this._emitAction(req);
    }

    _emitAction (req, action = null) {
        const params = [req.senderId, action || req.action(), req.text(), req];
        this.emit('_action', ...params);
        process.nextTick(() => {
            this.emit('action', ...params);
        });
    }

}

module.exports = ReducerWrapper;
