/*
 * @author David Menger
 */
'use strict';

const co = require('co');
const pathToRegexp = require('path-to-regexp');
const ReducerWrapper = require('./ReducerWrapper');
const { makeAbsolute } = require('./utils');

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

        const pathContext = { path: '/*' };

        const reducers = this.createReducersArray(resolvers, pathContext);

        const exitPoints = new Map();

        this._routes.push({
            exitPoints,
            reducers,
            path: pathContext.path
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

    // protected method for bot
    createReducersArray (resolvers, pathContext = { path: '/*' }) {
        return resolvers.map((reducer) => {

            // or condition
            if (Array.isArray(reducer)) {
                let isAnyReducer = false;

                const reducersArray = reducer.map((re) => {
                    const { resolverPath, reduce, isReducer } = this._createReducer(
                        re,
                        pathContext.path
                    );
                    Object.assign(pathContext, { path: resolverPath });
                    isAnyReducer = isAnyReducer || isReducer;
                    return { reduce, isReducer };
                });

                return { reducers: reducersArray, isReducer: isAnyReducer, isOr: true };
            }

            const { resolverPath, reduce, isReducer } = this._createReducer(
                reducer,
                pathContext.path
            );
            Object.assign(pathContext, { path: resolverPath });
            return { reduce, isReducer };
        });
    }

    _createReducer (reducer, thePath) {
        let resolverPath = thePath;
        let reduce = reducer;
        let isReducer = false;

        if (typeof reducer === 'string') {
            resolverPath = this._normalizePath(reducer);
            const pathMatch = pathToRegexp(resolverPath, [], { end: resolverPath === '' });

            reduce = (req, res, relativePostBack, pathContext, action) => {
                if (action && (resolverPath === '/*' || pathMatch.exec(action))) {
                    return Router.CONTINUE;
                }
                return Router.BREAK;
            };

        } else if (reducer instanceof RegExp) {
            reduce = req =>
                (req.isText() && req.text(true).match(reducer)
                    ? Router.CONTINUE
                    : Router.BREAK);

        } else if (typeof reduce === 'object' && reduce.reduce) {
            isReducer = true;

            reduce.on('action', (...args) => this.emit('action', ...args));
            reduce.on('_action', (...args) => this.emit('_action', ...args));

            const reduceFn = reduce.reduce.bind(reduce);
            reduce = (...args) => reduceFn(...args);
        } else {
            reduce = co.wrap(reducer);
        }

        return { resolverPath, isReducer, reduce };
    }

    * _callExitPoint (route, req, res, postBack, path, exitPointName, data = {}) {
        res.setPath(path);

        if (!route.exitPoints.has(exitPointName)) {
            return [exitPointName, data];
        }

        let result = route.exitPoints.get(exitPointName)(data, req, res, postBack);

        if (result instanceof Promise) {
            result = yield result;
        }

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
            let iterationResult;

            for (const route of this._routes) {
                iterationResult = yield* this._reduceTheArray(
                    route, route, action, req, res, relativePostBack, path
                );
                if (typeof iterationResult === 'string' || Array.isArray(iterationResult)) {
                    return iterationResult;
                } else if (iterationResult !== Router.CONTINUE) {
                    return Router.END;
                }
            }

            return Router.CONTINUE;
        }.bind(this));
    }

    // used as protected method
    processReducers (reducers, req, res, postBack, path, action) {
        const routeToReduce = {
            reducers,
            path: res.routePath,
            exitPoints: new Map()
        };

        return co(function* () {
            return yield* this._reduceTheArray(
                routeToReduce,
                routeToReduce,
                action,
                req,
                res,
                postBack,
                res.path
            );
        }.bind(this));
    }

    * _reduceTheArray (route, reducerContainer, action, req, res, relativePostBack, path = '/') {
        let breakOn = Router.BREAK;
        let continueOn = Router.CONTINUE;

        if (reducerContainer.isOr) {
            breakOn = Router.CONTINUE;
            continueOn = Router.BREAK;
        }

        for (const reducer of reducerContainer.reducers) {

            let pathContext = `${path === '/' ? '' : path}${route.path.replace(/\/\*/, '')}`;
            res.setPath(path, route.path);

            let result;

            if (reducer.reducers) {
                result = yield* this._reduceTheArray(
                    route, reducer, action, req, res, relativePostBack, path
                );
            } else {
                result = reducer.reduce(req, res, relativePostBack, pathContext, action);

                if (result instanceof Promise) {
                    result = yield result;
                }
            }

            if (!reducer.isReducer
                    && [Router.BREAK, Router.CONTINUE].indexOf(result) === -1) {
                pathContext = `${path === '/' ? '' : path}${route.path}`;
                this._emitAction(req, pathContext);
            }

            if (result === breakOn) {
                if (reducerContainer.isOr) {
                    return Router.CONTINUE;
                }
                break; // skip the rest path reducers, continue with next route

            } else if (typeof result === 'string' || Array.isArray(result)) {
                const [exitPoint, data] = Array.isArray(result) ? result : [result];

                // NOTE exit point can cause call of an upper exit point
                return yield* this._callExitPoint(
                    route, req, res, relativePostBack, path, exitPoint, data
                );

            } else if (result !== continueOn) {

                return Router.END;
            }
        }

        return continueOn;
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
