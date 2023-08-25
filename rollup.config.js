const typescript = require('rollup-plugin-typescript2');
const commonjs = require('rollup-plugin-commonjs');
const dist = './dist/';
const name = 'index';

module.exports = [{
    input: './src/index.ts',
    output: [
        {
            file: `${dist}${name}.cjs.js`,
            format: 'cjs'
        },
        {
            file: `${dist}${name}.esm.js`,
            format: 'esm'
        },
        {
            name: '@themost/events',
            file: `${dist}${name}.js`,
            format: 'umd'
        },
    ],
    external: [
    ],
    plugins: [
        typescript({
            declaration: false
        }),
        commonjs()
    ]
}, {
    input: './platform-server/src/index.ts',
    output: [
        {
            file: `./platform-server/dist/${name}.cjs.js`,
            format: 'cjs'
        },
        {
            file: `./platform-server/dist/${name}.esm.js`,
            format: 'esm'
        },
        {
            name: '@themost/events/platform-server',
            file: `./platform-server/dist/${name}.js`,
            format: 'umd'
        },
    ],
    external: [
    ],
    plugins: [
        typescript({
            tsconfig: './platform-server/tsconfig.json',
        }),
        commonjs()
    ]
}, {
    input: './platform-server/register/src/index.ts',
    output: [
        {
            file: `./platform-server/register/dist/${name}.cjs.js`,
            format: 'cjs'
        },
        {
            file: `./platform-server/register/dist/${name}.esm.js`,
            format: 'esm'
        },
        {
            name: '@themost/events/platform-server/register',
            file: `./platform-server/register/dist/${name}.js`,
            format: 'umd'
        },
    ],
    external: [
    ],
    plugins: [
        typescript({
            tsconfig: './platform-server/register/tsconfig.json',
        }),
        commonjs()
    ]
}];