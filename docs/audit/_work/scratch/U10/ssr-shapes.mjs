// U10 audit scratch: SSR-render shapes/icons from the built dist to inspect emitted fill/stroke.
import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/package.json");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ds = require(process.cwd() + "/dist/index.cjs");
const h = React.createElement;
for (const name of ["PentagonShape", "PuffShape", "SquircleShape", "ArrowShape"]) {
  const out = renderToStaticMarkup(h(ds[name], { size: 24, fillColor: "red", strokeColor: "transparent" }));
  console.log(name, "=>", out.replace(/ d="[^"]*"/g, ' d="…"'));
}
for (const name of ["HeartFillIcon", "StopFilledIcon"]) {
  if (!ds[name]) continue;
  const out = renderToStaticMarkup(h(ds[name], { color: "red" }));
  console.log(name, "=>", out.replace(/ d="[^"]*"/g, ' d="…"'));
}
