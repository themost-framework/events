const typescript = require("@rollup/plugin-typescript");
const pkg = require("./package.json");

const external = Object.keys(pkg.dependencies || {})

module.exports = [
    {
        input: './src/index.ts',
        output: [
            {
                name: pkg.name,
                file: `dist/index.js`,
                format: 'cjs'
            },
            {
                name: pkg.name,
                file: `dist/index.esm.js`,
                format: 'esm'
            },
            {
                name: pkg.name,
                file: `dist/index.umd.js`,
                format: 'umd'
            }
        ],
        external: external,
        plugins: [
            typescript({ tsconfig: './tsconfig.json' })
        ]
    }
];