// U10 audit scratch: SSR every exported *Icon from built dist into one HTML page
// (run with cwd = ../dooph-ds-audit-build); open the page and call getBBox() per svg.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const require = createRequire(process.cwd() + "/package.json");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ds = require(process.cwd() + "/dist/index.cjs");
const names = Object.keys(ds).filter((k) => /Icon$/.test(k) && k !== "BaseIcon" && typeof ds[k] === "function");
const body = names.map((n) => `<div data-name="${n}">${renderToStaticMarkup(React.createElement(ds[n], { size: 48 }))}</div>`).join("\n");
writeFileSync(process.argv[2], `<!doctype html><html><body>${body}</body></html>`);
console.log(names.length, "icons written");
