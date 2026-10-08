// Prototype of the WI-C5-02 shape: decoration as siblings of a render-prop Slottable.
const { createRequire } = require("module");
const B = "C:/Users/stick/Github/dooph/dooph-ds-audit-build/";
const r = createRequire(B + "package.json");
const React = r("react");
const { renderToStaticMarkup } = r("react-dom/server");
const { Slot, Slottable } = r("@radix-ui/react-slot");
const h = React.createElement;
// Mirrors OutlineButton/ShapeButton: <Comp>{decoration}<Slottable child={children}>{(c) => <span z-10>{c}</span>}</Slottable></Comp>
const Decorated = React.forwardRef(({ asChild, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return h(Comp, { ref, className: "root", onMouseMove: () => {}, ...props },
    h("span", { "aria-hidden": true, className: "orb" }),
    h(Slottable, { child: children }, (child) => h("span", { className: "relative z-10" }, child)),
  );
});
// Mirrors DropdownTrigger: <Comp><Slottable child>{(c) => <span flex-1>{c}</span>}</Slottable><Caret/></Comp>
const Trigger = React.forwardRef(({ asChild, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return h(Comp, { ref, className: "trigger", ...props },
    h(Slottable, { child: children }, (child) => h("span", { className: "flex-1 text-left" }, child)),
    h("span", { className: "caret" }),
  );
});
const cases = [
  ["Decorated button", h(Decorated, null, "Go")],
  ["Decorated asChild", h(Decorated, { asChild: true, id: "x" }, h("a", { href: "/x", className: "consumer" }, "Go"))],
  ["Trigger button", h(Trigger, null, "Sort by ", h("b", null, "Name"))],
  ["Trigger asChild", h(Trigger, { asChild: true }, h("a", { href: "/x" }, "Sort by ", h("b", null, "Name")))],
  ["Trigger asChild text child", h(Trigger, { asChild: true }, "Go")],
];
console.error = () => {};
for (const [n, el] of cases) {
  try { console.log("OK    " + n + " -> " + renderToStaticMarkup(el)); }
  catch (e) { console.log("THROW " + n + " -> " + e.message.split("\n")[0]); }
}
