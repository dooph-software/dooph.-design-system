// Render each Slot-backed button with asChild via react-dom/server against the
// built dist in the audit-build copy. Read-only: imports only.
const path = require("node:path");
const BUILD = "C:/Users/stick/Github/dooph/dooph-ds-audit-build";
const req = require("node:module").createRequire(path.join(BUILD, "package.json"));
const React = req("react");
const { renderToStaticMarkup } = req("react-dom/server");
const ds = req(path.join(BUILD, "dist/index.cjs"));
const h = React.createElement;

function tryRender(label, el) {
  try {
    const html = renderToStaticMarkup(el);
    console.log("OK   " + label + " -> " + html.slice(0, 4000));
  } catch (e) {
    console.log("FAIL " + label + " -> " + e.message.split("\n")[0]);
  }
}

tryRender("Button asChild <a>", h(ds.Button, { asChild: true }, h("a", { href: "/x" }, "Go")));
tryRender("OutlineButton (no asChild)", h(ds.OutlineButton, null, "Find"));
tryRender("OutlineButton asChild <a>", h(ds.OutlineButton, { asChild: true }, h("a", { href: "/x" }, "Go")));
tryRender("OutlineButton glowing asChild <a>", h(ds.OutlineButton, { asChild: true, glowing: true }, h("a", { href: "/x" }, "Go")));
tryRender("ShapeButton (no asChild)", h(ds.ShapeButton, null, "i"));
tryRender("ShapeButton asChild <a>", h(ds.ShapeButton, { asChild: true }, h("a", { href: "/x" }, "i")));
tryRender("CTAButton asChild <a>", h(ds.CTAButton, { asChild: true, text: "Go", icon: "i" }, h("a", { href: "/x" })));
tryRender("OutlineButton style+className targets", h(ds.OutlineButton, { className: "CONSUMER", style: { color: "red" }, id: "ID" }, "x"));
tryRender("CopyButton", h(ds.CopyButton, { value: "v" }));
tryRender("SplitButton", h(ds.SplitButton, { actionProps: { className: "A" } }, "Save"));
