/*
 * @author David Menger
 */
'use strict';

const defaultResourceMap = require('./defaultResourceMap');

/**
 * Custom code blocks for BuildRouter and wingbot.ai
 */
class Blocks {

    constructor (resourceMap = defaultResourceMap()) {
        this._resources = resourceMap;
        this._customCodes = new Map();
    }

    /**
     * Register resolver factory
     *
     * @param {string} type - resolver type
     * @param {function} factoryFn - resolver factory
     */
    resolver (type, factoryFn) {
        this._resources.set(type, factoryFn);
    }

    getResolverFactory (name) {
        if (!this._resources.has(name)) {
            throw new Error(`Unknown Resolver: ${name} Ensure its registration.`);
        }
        return this._resources.get(name);
    }

    getCustomCodeFactory (name) {
        if (!this._customCodes.has(name)) {
            throw new Error(`Unknown Resolver: ${name}. Ensure its registration.`);
        }
        return this._customCodes.get(name);
    }

    /**
     * Register custom code block
     *
     * @param {string|Blocks} name - block name or blocks object to include
     * @param {string} [factoryFn] - block factory - optional when including another blocks object
     */
    code (name, factoryFn = null) {
        if (typeof name === 'string') {
            this._customCodes.set(name, factoryFn);
            return;
        }
        name._resources.forEach((el, key) => {
            this._resources.set(el, key);
        });
        name._customCodes.forEach((el, key) => {
            this._customCodes.set(el, key);
        });
    }

}

module.exports = Blocks;
