/*
 * @author David Menger
 */
'use strict';

const ReducerWrapper = require('./ReducerWrapper');
const pathToRegexp = require('path-to-regexp');

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

    use (path, pattern, reducer) {
        let match;
        let reduce;

        if (reducer) {
            reduce = reducer;

            if (pattern instanceof RegExp || typeof pattern === 'string') {
                // @todo webalized pattern
                match = req => req.text(true).match(pattern);
            } else {
                match = pattern;
            }
        } else {
            reduce = pattern;
            match = null;
        }
        let isReducer = false;

        if (typeof reduce === 'object' && reduce.reduce) {
            isReducer = true;

            reduce.on('action', (...args) => this.emit('action', ...args));

            const reducerFn = reduce.reduce.bind(reduce);
            reduce = (...args) => reducerFn(...args);
        }

        const normalizedPath = this._normalizePath(path);
        const nexts = [];

        this._routes.push({
            path: normalizedPath,
            pathMatch: pathToRegexp(normalizedPath, [], { end: !isReducer }),
            match,
            reduce,
            nexts,
            isReducer
        });

        return {
            next (action, listener) {
                nexts.push({
                    action,
                    listener,
                    pathMatch: pathToRegexp(action)
                });
                return this;
            }
        };
    }

    _createNext (route, req, res) {
        const next = (action = null, data = {}) => {
            let finnished = false;

            if (route.nexts) {
                finnished = route.nexts.some((nextAction) => {
                    if (nextAction.action === action || nextAction.action === '*') {
                        const nextContext = this._createNext({}, req, res);
                        nextAction.listener(data, req, nextContext);

                        if (!nextContext.called) {
                            return true;
                        } else if (nextContext.action) {
                            next.action = nextContext.action;
                            next.data = nextContext.data;
                            next.called = true;
                            return true;
                        }
                    }
                    return false;
                });
            }

            if (!finnished && action) {
                next.action = action;
                next.data = data;
            }
            if (!next.called) {
                next.called = !finnished;
            }
        };

        next.action = null;
        next.data = {};
        next.called = false;

        return next;
    }

    reduce (req, res, next = () => {}, path = '/') {
        const action = this._action(req, path);

        const found = this._routes.some((route) => {
            if (this._routeMatch(route, action, req)) {
                const pathContext = `${path === '/' ? '' : path}${route.path}`;
                const nextContext = this._createNext(route, req, res);
                route.reduce(req, res, nextContext, pathContext);

                if (!route.isReducer) {
                    this._emitAction(req, pathContext);
                }

                if (!nextContext.called) {
                    return true;
                } else if (nextContext.action) {
                    next(nextContext.action, nextContext.data);
                    return true;
                }
            }
            return false;
        });
        if (!found) {
            next();
        }
    }

    _routeMatch (route, action, req) {
        if (action) {
            return route.pathMatch.exec(action);
        } else if (route.match === null) {
            return route.pathMatch.exec('/');
        }
        return route.match(req);
    }

    _action (req, path) {
        let action = req.action();

        if (!action && req.state.expected) {
            action = req.state.expected;
        }

        // try to normalize the action
        if (action) {
            if (!action.match(/^\//)) {
                action = `/${action}`;
            }
            if (action.indexOf(path) === 0) {
                // return relative path with slash at the begining
                if (path !== '/') {
                    return action.substr(path.length);
                }

                return action;
            }
        }

        return null;
    }
}

module.exports = Router;
