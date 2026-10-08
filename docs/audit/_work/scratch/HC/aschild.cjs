// Run from ../dooph-ds-audit-build: node <this file>. Renders each R3.2 leaf with asChild via react-dom/server.
const path = require("path");
const root = process.cwd();
const React = require(path.join(root, "node_modules/react"));
const { renderToString } = require(path.join(root, "node_modules/react-dom/server"));
const ds = require(path.join(root, "dist/index.cjs"));
const h = React.createElement;
for (const name of ["Button", "DropdownTrigger", "TextDropdownTrigger", "OutlineButton", "ShapeButton", "TextLink", "DatePickerTrigger"]) {
  const C = ds[name];
  if (!C) { console.log(name, "not exported"); continue; }
  const extra = name === "DatePickerTrigger" ? { mode: "singleDay", value: new Date(2026, 0, 1) } : {};
  try {
    const out = renderToString(h(C, { asChild: true, ...extra }, h("a", { href: "/x" }, "Link")));
    console.log(name, "OK", out.slice(0, 90));
  } catch (e) {
    console.log(name, "THROWS:", String(e.message).split("\n")[0].slice(0, 140));
  }
}
