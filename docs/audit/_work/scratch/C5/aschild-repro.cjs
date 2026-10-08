// Usage: node aschild-repro.cjs <package-root-with-dist-and-node_modules>
// Renders each asChild leaf with a single <a> child via react-dom/server.
// Exit 1 if any case throws or the <a> is not the root element.
const { createRequire } = require("module");
const path = require("path");
const root = path.resolve(process.argv[2] || ".") + "/";
const r = createRequire(root + "package.json");
const React = r("react");
const { renderToStaticMarkup } = r("react-dom/server");
const ds = r(root + "dist/index.cjs");
const h = React.createElement;
const a = () => h("a", { href: "/x" }, "Go");
const cases = [
  ["Button", () => h(ds.Button, { asChild: true }, a())],
  ["CTAButton", () => h(ds.CTAButton, { asChild: true, text: "Go", icon: h("span", null, ">") }, h("a", { href: "/x" }))],
  ["OutlineButton", () => h(ds.OutlineButton, { asChild: true }, a())],
  ["OutlineButton glowing", () => h(ds.OutlineButton, { asChild: true, glowing: true }, a())],
  ["ShapeButton", () => h(ds.ShapeButton, { asChild: true }, a())],
  ["DropdownTrigger", () => h(ds.DropdownTrigger, { asChild: true }, a())],
  ["TextDropdownTrigger", () => h(ds.TextDropdownTrigger, { asChild: true }, a())],
];
console.error = () => {};
let failed = 0;
for (const [name, fn] of cases) {
  try {
    const out = renderToStaticMarkup(fn());
    // The <a> must be the interactive root (OutlineButton keeps its outer frame <div>).
    const rooted = out.includes("<a href=\"/x\"") && !out.includes("<button");
    if (!rooted) failed++;
    console.log((rooted ? "OK    " : "NOT-A ") + name + " -> " + out.slice(0, 160));
  } catch (e) {
    failed++;
    console.log("THROW " + name + " -> " + String(e.message).split("\n")[0]);
  }
}
process.exitCode = failed ? 1 : 0;
