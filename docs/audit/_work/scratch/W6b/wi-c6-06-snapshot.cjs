// WI-C6-06 snapshot. Usage: node wi-c6-06-snapshot.cjs <build-root> > out.txt
// Server-renders every Modal and Sheet part inside an open root and prints one
// normalised line per case: radix ids are stripped and each class attribute is
// sorted, because the shared shell may reorder class tokens (order inside a
// class attribute has no effect on the cascade). Content is rendered with
// portal={false} (WI-C6-03); before that item lands it renders "" (a Radix
// portal renders nothing during SSR).
const B = process.argv[2];
if (!B) { console.error("usage: node wi-c6-06-snapshot.cjs <build-root>"); process.exit(2); }
const React = require(B + "/node_modules/react");
const { renderToStaticMarkup } = require(B + "/node_modules/react-dom/server");
const ds = require(B + "/dist/index.cjs");
const h = React.createElement;
const norm = (html) =>
  html
    .replace(/ (id|aria-labelledby|aria-describedby|aria-controls)="radix-[^"]*"/g, "")
    .replace(/class="([^"]*)"/g, (_, c) => `class="${c.split(/\s+/).filter(Boolean).sort().join(" ")}"`);
const r = (el) => norm(renderToStaticMarkup(el));
const cases = [];
const add = (name, el) => cases.push([name, r(el)]);
for (const [Root, Overlay, Content, Title, Desc, label] of [
  [ds.Modal, ds.ModalOverlay, ds.ModalContent, ds.ModalTitle, ds.ModalDescription, "Modal"],
  [ds.Sheet, ds.SheetOverlay, ds.SheetContent, ds.SheetTitle, ds.SheetDescription, "Sheet"],
]) {
  add(`${label}Overlay`, h(Root, { open: true }, h(Overlay)));
  add(`${label}Overlay+className`, h(Root, { open: true }, h(Overlay, { className: "bg-black/80 duration-1000" })));
  add(`${label}Title`, h(Root, { open: true }, h(Title, null, "T")));
  add(`${label}Title+className`, h(Root, { open: true }, h(Title, { className: "text-danger" }, "T")));
  add(`${label}Description`, h(Root, { open: true }, h(Desc, null, "D")));
  add(`${label}Description+className`, h(Root, { open: true }, h(Desc, { className: "text-text" }, "D")));
  const sides = label === "Sheet" ? ["left", "right", "top", "bottom"] : [undefined];
  for (const side of sides) {
    for (const withOverlay of [true, false]) {
      add(
        `${label}Content side=${side} withOverlay=${withOverlay}`,
        h(Root, { open: true },
          h(Content, { portal: false, side, withOverlay, className: "w-[400px] rounded-none", "aria-describedby": undefined },
            h(Title, null, "T"))),
      );
    }
  }
}
for (const [name, html] of cases) console.log(`${name}\t${html}`);
