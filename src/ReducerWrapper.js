/*
 * @author David Menger
 */
'use strict';

const EventEmitter = require('events');

class ReducerWrapper extends EventEmitter {

    constructor (reduce = o => o) {
        super();

        this._reduce = reduce;

        this._debugPromises = [];

        this.processMessage = null;
    }

    /**
     * Reducer function
     *
     * @param {Request} req
     * @param {Responder} res
     * @param {function} next
     *
     * @memberOf ReducerWrapper
     */
    reduce (req, res, next) {
        this._reduce(req, res, next);
        this._emitAction(req);
    }

    _emitAction (req, action = null) {
        process.nextTick(() => {
            this.emit('action', req.senderId, action || req.action(), req.text(), req);
        });
    }

}

module.exports = ReducerWrapper;
