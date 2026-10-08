// WI-C6-03 check. Usage: node wi-c6-03-check.cjs <build-root>
// Radix Portal renders nothing during SSR, so an open ModalContent/SheetContent
// shows up in renderToStaticMarkup only when it is rendered in place (portal={false}).
const B = process.argv[2];
if (!B) { console.error("usage: node wi-c6-03-check.cjs <build-root>"); process.exit(2); }
const React = require(B + "/node_modules/react");
const { renderToStaticMarkup: r } = require(B + "/node_modules/react-dom/server");
const ds = require(B + "/dist/index.cjs");
const h = React.createElement;
let fails = 0;
const check = (name, ok, got) => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : `\n     got: ${JSON.stringify(got).slice(0, 300)}`}`); };
const body = (Title) => h(Title, null, "Title");
const modal = (extra) => r(h(ds.Modal, { open: true }, h(ds.ModalContent, { "aria-describedby": undefined, ...extra }, body(ds.ModalTitle))));
const sheet = (extra) => r(h(ds.Sheet, { open: true }, h(ds.SheetContent, { "aria-describedby": undefined, ...extra }, body(ds.SheetTitle))));
let m = modal({ portal: false });
check("ModalContent portal={false} renders the dialog in place", /role="dialog"/.test(m) && !/portal=/.test(m), m);
check("ModalContent portal={false} keeps the overlay", /bg-modal-backdrop/.test(m), m);
check("ModalContent portal={false} withOverlay={false} drops the overlay", !/bg-modal-backdrop/.test(modal({ portal: false, withOverlay: false })), "overlay present");
check("ModalContent default still portals (nothing in SSR markup)", modal({}) === "", modal({}));
m = sheet({ portal: false });
check("SheetContent portal={false} renders the dialog in place", /role="dialog"/.test(m) && !/portal=/.test(m), m);
check("SheetContent default still portals (nothing in SSR markup)", sheet({}) === "", sheet({}));
console.log(`\n${fails ? `FAILURES: ${fails}` : "ALL PASS"}`);
console.log("MODAL_INPLACE:" + modal({ portal: false }).replace(/ id="[^"]*"| aria-[a-z]+="radix-[^"]*"/g, ""));
