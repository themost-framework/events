const path = require('path');
require('module-alias/register');
const {addAliases} = require('module-alias');
const moduleAliases = {
    "@themost/events": "src/index"
}
addAliases(Object.keys(moduleAliases).reduce((obj, key) => {
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        value: path.resolve(process.cwd(), moduleAliases[key])
    });
    return obj;
}, {}));
