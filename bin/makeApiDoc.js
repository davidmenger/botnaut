'use strict';

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const path = require('path');

const docs = [
    'src/Request.js',
    'src/Responder.js',
    ['src/ButtonTemplate.js', 'src/GenericTemplate.js', 'src/ReceiptTemplate.js'],
    'src/Router.js',
    'src/ReducerWrapper.js',
    ['src/Tester.js', 'src/ResponseAssert.js', 'src/AnyResponseAssert.js'],
    ['src/Settings.js', 'src/MenuComposer.js'],
    ['src/bufferloader.js', 'src/MemoryStateStorage.js'],
    ['express.js', 'src/State.js', 'src/ChatLog.js']
];

let srcFile;
let docFile;
let files;
let apiDoc;

docs.forEach((doc) => {
    if (Array.isArray(doc)) {
        srcFile = doc[0];
        files = doc;
    } else {
        srcFile = doc;
        files = [doc];
    }

    docFile = path.join(process.cwd(), 'doc', 'api', srcFile
        .replace(/jsx?$/, 'md')
        .replace(/^src\//, ''));

    apiDoc = jsdoc2md.renderSync({
        'example-lang': 'javascript',
        files
    }).replace(/<a\sname="([^"]+)"><\/a>/g, (a, r) => `{% raw %}<div id="${r.replace(/[+.]/g, '_')}">&nbsp;</div>{% endraw %}`)
        .replace(/<a\shref="#([^"]+)">/g, (a, r) => `<a href="#${r.replace(/[+.]/g, '_')}">`)
        .replace(/]\(#([a-z+0-9_.]+)\)/ig, (a, r) => `](#${r.replace(/[+.]/g, '_')})`);

    fs.writeFileSync(docFile, apiDoc);
});
