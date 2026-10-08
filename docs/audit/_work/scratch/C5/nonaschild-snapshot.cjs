// Usage: node nonaschild-snapshot.cjs <package-root> > before.txt   (then again after the change; diff must be empty)
const { createRequire } = require("module");
const path = require("path");
const root = path.resolve(process.argv[2] || ".") + "/";
const r = createRequire(root + "package.json");
const React = r("react");
const { renderToStaticMarkup } = r("react-dom/server");
const ds = r(root + "dist/index.cjs");
const h = React.createElement;
const cases = [
  ["OutlineButton", h(ds.OutlineButton, null, "Go")],
  ["OutlineButton glowing", h(ds.OutlineButton, { glowing: true }, "Go")],
  ["ShapeButton", h(ds.ShapeButton, null, h("svg", null))],
  ["DropdownTrigger", h(ds.DropdownTrigger, null, "Sort by ", h("b", null, "Name"))],
  ["TextDropdownTrigger", h(ds.TextDropdownTrigger, null, "Sort by ", h("b", null, "Name"))],
];
for (const [n, el] of cases) console.log(n + "\t" + renderToStaticMarkup(el));
