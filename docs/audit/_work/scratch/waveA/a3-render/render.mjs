// A3 render check: TagIcon with color red; SquircleShape size 24; FiltersSlidersIcon; Heart/StopFilled with color.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const out = (name, el) => console.log(`${name}: ${renderToStaticMarkup(el)}`);
export default (m) => {
  out("tag", React.createElement(m.TagIcon, { color: "red", strokeWidth: 0.5 }));
  out("squircle", React.createElement(m.SquircleShape, { size: 24 }));
  out("heart", React.createElement(m.HeartFillIcon, { color: "red" }));
  out("stop", React.createElement(m.StopFilledIcon, { color: "red" }));
  out("stopStroke", React.createElement(m.StopFilledIcon, { color: "red", strokeColor: "blue" }));
};
