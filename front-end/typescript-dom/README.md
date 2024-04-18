# Typescript For The Browser

No bundling required!

Uses import maps for external dependencies: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap

Browser will automatically pull files based on relative imports, so only one internal javscript file is referenced in the html.

## How to Run
1. Open in `index.html` in VSCode
2. Use live server extension to "go live"
3. Look in the browser console, you will see green hello text which provest the 3rd party library chalk could be used.

### Reasons For Things
1. Why js extension is nessary on imports: https://github.com/microsoft/TypeScript/issues/16577#issuecomment-703190339
2. Why module and module resolution are `NodeNext` in `tsconfig.json`
    - Typescript needs to know to look for the types of 3rd party libraries in the `node_modules` folder.
