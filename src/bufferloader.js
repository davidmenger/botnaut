/*
 * @author David Menger
 */
'use strict';

const https = require('https');

function sizeLimitExceeded (expected, current) {
    const err = new Error(`File size limit exceeded: ${current} > ${expected}`);
    err.code = 400;
    return err;
}

function load (url, limit = 0, limitJustByBody = false, redirCount = 3) {
    return new Promise((resolve, reject) => {

        if (redirCount <= 0) {
            reject(new Error('Too many redirects'));
        }

        let totalLength = 0;
        let buf = Buffer.alloc(0);

        const req = https.get(url, (res) => {

            if (res.statusCode === 301 && res.headers && res.headers.location) {
                // redirect
                req.removeAllListeners();
                resolve(load(res.headers.location, limit, limitJustByBody, redirCount - 1));
                return;
            } else if (res.statusCode !== 200) {
                req.removeAllListeners();
                reject(new Error(res.statusMessage || 'Cant load'));
                return;
            }

            if (!limitJustByBody && limit > 0 && res.headers && res.headers['content-length']) {
                const len = parseInt(res.headers['content-length'], 10);
                if (!isNaN(len) && len > limit) {
                    req.removeAllListeners();
                    reject(sizeLimitExceeded(limit, len));
                    return;
                }
            }

            const cleanup = () => {
                res.removeAllListeners();
                req.removeAllListeners();
            };

            res.on('data', (data) => {
                totalLength += data.length;
                if (limit > 0 && totalLength > limit) {
                    cleanup();
                    res.destroy();
                    reject(sizeLimitExceeded(limit, totalLength));
                    return;
                }

                buf = Buffer.concat([
                    buf,
                    data
                ]);
            });

            res.on('end', () => {
                cleanup();
                resolve(buf);
            });

        });

        req.on('error', (err) => {
            req.removeAllListeners();
            reject(err);
        });
    });
}

function bufferloader () {
    return load;
}

module.exports = bufferloader;
