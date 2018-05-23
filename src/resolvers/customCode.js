/*
 * @author David Menger
 */
'use strict';

function customCode (params, context, blocks) {
    const customFn = blocks.getCustomCodeFactory(params.codeBlockId);

    const { router, isLastIndex } = context;

    const items = Object.keys(params.items)
        .reduce((obj, itemName) => {
            const item = params.items[itemName];
            const builtResolvers = router.buildResolvers(item.resolvers);
            const reducers = router.createReducersArray(builtResolvers);

            return Object.assign(obj, { [itemName]: reducers });
        }, {});

    const paramsData = typeof params.params === 'object' ? params.params : {};

    return function* (req, res, postBack, path, action) {

        Object.assign(res, {
            run (codeBlockName) {
                if (typeof items[codeBlockName] === 'undefined') {
                    return Promise.resolve();
                }

                const reducers = items[codeBlockName];
                return router.processReducers(reducers, req, res, postBack, path, action);
            }
        });

        // assign to res
        let ret = customFn(req, res, postBack, context, paramsData);

        if (typeof ret === 'object' && ret !== null) {
            ret = yield ret;
        }

        if (typeof ret !== 'undefined') {
            return ret;
        }
        return isLastIndex ? null : true;
    };
}

module.exports = customCode;
