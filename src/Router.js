/*
 * @author David Menger
 */
'use strict';

const ReducerWrapper = require('./ReducerWrapper');
const { makeAbsolute } = require('./pathUtils');
const pathToRegexp = require('path-to-regexp');
const co = require('co');

/**
 * Cascading router
 *
 * @class Router
 * @extends {ReducerWrapper}
 */
class Router extends ReducerWrapper {

    constructor () {
        super();

        this._routes = [];
    }

    _normalizePath (path) {
        let normalizedPath;

        if (!path.match(/^\//)) {
            normalizedPath = `/${path}`;
        } else {
            normalizedPath = path;
        }

        return normalizedPath.replace(/\/$/, '');
    }

    /**
     * Appends middleware, action handler or another router
     *
     * @param {string} [action] name of the action
     * @param {RegExp|string|function} [matcher] - The function can be async
     * @param {...(function|Router)} reducers
     * @returns {{onExit:function}}
     *
     * @example
     * // middleware
     * router.use((req, res, postBack) => Router.CONTINUE);
     *
     * // route with matching regexp
     * router.use(/help/, (req, res) => {
     *     res.text('Hello!');
     * });
     *
     * // route with matching function (the function is considered as matcher
     * // in case of the function accepts zero or one argument)
     * router.use('action', req => req.text() === 'a', (req, res) => {
     *     res.text('Hello!');
     * });
     *
     * // use multiple reducers
     * router.use('/path', reducer1, reducer2)
     *    .onExit('exitAction', (data, req, res, postBack) => {
     *        postBack('anotherAction', { someData: true })
     *    });
     *
     * // append router with exit action
     * router.use('/path', subRouter)
     *    .onExit('exitAction', (data, req, res, postBack) => {
     *        postBack('anotherAction', { someData: true })
     *    });
     *
     * @memberOf Router
     */
    use (...resolvers) {

        const exitPoints = new Map();

        let path = '/*';

        const reducers = resolvers.map((reducer) => {
            let isReducer = false;
            let reduce = reducer;

            if (typeof reducer === 'string') {
                path = this._normalizePath(reducer);
                const pathMatch = pathToRegexp(path, [], { end: path === '' });

                reduce = (req, res, relativePostBack, pathContext, action) => {
                    if (action && (path === '/*' || pathMatch.exec(action))) {
                        return Router.CONTINUE;
                    }
                    return Router.BREAK;
                };

            } else if (reducer instanceof RegExp) {
                reduce = req =>
                    (!req.action() && req.text(true).match(reducer)
                        ? Router.CONTINUE
                        : Router.BREAK);

            } else if (typeof reduce === 'object' && reduce.reduce) {
                isReducer = true;

                reduce.on('action', (...args) => this.emit('action', ...args));
                reduce.on('_action', (...args) => this.emit('_action', ...args));

                const reduceFn = reduce.reduce.bind(reduce);
                reduce = (...args) => reduceFn(...args);
            }

            return {
                reduce,
                isReducer
            };
        });

        this._routes.push({
            exitPoints,
            reducers,
            path
        });

        return {
            next (...args) {
                return this.onExit(...args);
            },
            onExit (actionName, listener) {
                exitPoints.set(actionName, listener);
                return this;
            }
        };
    }

    * _callExitPoint (route, req, res, postBack, path, exitPointName, data = {}) {

        res.setPath(path);

        if (!route.exitPoints.has(exitPointName)) {
            return [exitPointName, data];
        }

        const result = route.exitPoints.get(exitPointName)(data, req, res, postBack);

        if (typeof result === 'string' || Array.isArray(result)) {
            return result;
        }

        return Router.END;
    }

    _relativePostBack (origPostBack, path) {
        return function postBack (action, data = {}) {
            return origPostBack(makeAbsolute(action, path), data);
        };
    }

    _makePostBackRelative (origPostBack, path) {
        const postBack = this._relativePostBack(origPostBack, path);
        postBack.wait = () => {
            const deferredPostBack = origPostBack.wait();
            return this._relativePostBack(deferredPostBack, path);
        };
        return postBack;
    }

    reduce (req, res, postBack = () => {}, path = '/') {
        return co(function* () {
            const action = this._action(req, path);
            const relativePostBack = this._makePostBackRelative(postBack, path);

            for (const route of this._routes) {

                for (const reducer of route.reducers) {
                    let pathContext = `${path === '/' ? '' : path}${route.path.replace(/\/\*/, '')}`;
                    res.setPath(path);

                    let result = reducer.reduce(req, res, relativePostBack, pathContext, action);

                    if (result instanceof Promise) {
                        result = yield result;
                    }

                    if (!reducer.isReducer
                            && [Router.BREAK, Router.CONTINUE].indexOf(result) === -1) {
                        pathContext = `${path === '/' ? '' : path}${route.path}`;
                        this._emitAction(req, pathContext);
                    }

                    if (result === Router.BREAK) {
                        break; // skip the rest path reducers, continue with next route

                    } else if (typeof result === 'string' || Array.isArray(result)) {
                        const [exitPoint, data] = Array.isArray(result) ? result : [result];

                        // NOTE exit point can cause call of an upper exit point
                        return yield* this._callExitPoint(
                            route, req, res, relativePostBack, path, exitPoint, data
                        );

                    } else if (result !== Router.CONTINUE) {

                        return Router.END;
                    }
                }
            }

            return Router.CONTINUE;

        }.bind(this));
    }

    _action (req, path) {
        let action = req.action();

        // try to normalize the action
        if (action) {
            if (!action.match(/^\//)) {
                action = `/${action}`;
            }
            if (action.indexOf(path) === 0) {
                // return relative path with slash at the begining
                if (path !== '/') {
                    return action.substr(path.length) || '/';
                }

                return action;
            }
        }

        return null;
    }
}

/**
 * Return `Router.CONTINUE` when action matches your route
 * Its same as returning `true`
 *
 * @property {boolean}
 */
Router.CONTINUE = true;

/**
 * Return `Router.BREAK` when action does not match your route
 * Its same as returning `false`
 *
 * @property {boolean}
 */
Router.BREAK = false;

/**
 * Returning `Router.END` constant stops dispatching request
 * Its same as returning `undefined`
 *
 * @property {null}
 */
Router.END = null;

/**
 * Create the exit point
 * Its same as returning `['action', { data }]`
 *
 * @param {string} action - the exit action
 * @param {Object} [data] - the data
 * @returns {Array}
 * @example
 * router.use((req, res) => {
 *     return Router.exit('exitName');
 * });
 */
Router.exit = function (action, data = {}) {
    return [action, data];
};

module.exports = Router;
