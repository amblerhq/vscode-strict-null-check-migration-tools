// @ts-check
const path = require('path');
const ts = require('typescript');
const fs = require('fs');

module.exports.getImportsForFile = function getImportsForFile(file, srcRoot) {
    const fileInfo = ts.preProcessFile(fs.readFileSync(file).toString());
    const ignored = [
        "graphql-tools/dist/Interfaces",
        "libphonenumber-js/custom",
        "react-dom/server"
    ]
    return fileInfo.importedFiles
        .map(importedFile => importedFile.fileName)
        .filter(x => x.includes("/") || (x.includes(".") && !x.includes("lodash"))) // remove node modules (the import must contain '/')
        .filter(x => !x.includes("@") && !x.includes("json") && !x.includes("generated"))
        .filter(x => !ignored.includes(x))
        .map(fileName => {
            return path.join(path.dirname(file), fileName);
        }).map(fileName => {
            if (fs.existsSync(`${fileName}.ts`)) {
                return `${fileName}.ts`;
            }
            if (fs.existsSync(`${fileName}/index.ts`)) {
                return `${fileName}/index.ts`;
            }
            if (fs.existsSync(`${fileName}.js`)) {
                return `${fileName}.js`;
            }
            if (fs.existsSync(`${fileName}.tsx`)) {
                return `${fileName}.tsx`;
            }
            if (fs.existsSync(`${fileName}.d.ts`)) {
                return `${fileName}.d.ts`;
            }
            throw new Error(`Unresolved import ${fileName} in ${file}`);
        });
};
