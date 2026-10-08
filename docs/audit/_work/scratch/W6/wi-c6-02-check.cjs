// WI-C6-02 check. Usage: node wi-c6-02-check.cjs <build-root>   (a checkout with dist/ + node_modules/)
// Prints PASS/FAIL per assertion, then the markup of a valid AIThinkingEffortSelector
// render after "BASELINE:" so a before/after diff can confirm it is unchanged.
const B = process.argv[2];
if (!B) { console.error("usage: node wi-c6-02-check.cjs <build-root>"); process.exit(2); }
const React = require(B + "/node_modules/react");
const { renderToStaticMarkup: r } = require(B + "/node_modules/react-dom/server");
const ds = require(B + "/dist/index.cjs");
const h = React.createElement;
let fails = 0;
const check = (name, ok, got) => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : `\n     got: ${got}`}`); };
const tip = (child) => h(ds.TooltipProvider, null, h(ds.Tooltip, null, h(ds.TooltipTrigger, { asChild: true }, child), h(ds.TooltipContent, null, "Send (Enter)")));
const inForm = (child, extra) => h(ds.AIPromptInput, { onSubmit() {}, defaultValue: "hi", ...extra }, child);
const steps = [{ value: "a", label: "A" }, { value: "b", label: "B" }];
const sel = (extra) => h(ds.AIThinkingEffortSelector, { steps, value: "a", onValueChange() {}, label: "Thinking", labels: { start: "F", end: "S" }, ...extra });

let m = r(inForm(tip(h(ds.AIPromptInputSubmit))));
let btn = (m.match(/<button[^>]*>/) || [""])[0];
check("Submit under TooltipTrigger asChild carries data-state=\"closed\"", /data-state="closed"/.test(btn), btn);
m = r(inForm(h(ds.AIPromptInputSubmit, { id: "send", "data-testid": "send", type: "button", className: "x" })));
btn = (m.match(/<button[^>]*>/) || [""])[0];
check("Submit forwards id and data-testid", /id="send"/.test(btn) && /data-testid="send"/.test(btn), btn);
check("Submit keeps type=\"submit\" over a consumer type", /type="submit"/.test(btn), btn);
m = r(inForm(h(ds.AIPromptInputSubmit, { id: "stop" }), { responding: true, onStop() {} }));
btn = (m.match(/<button[^>]*>/) || [""])[0];
check("Stop button forwards id and keeps type=\"button\"", /id="stop"/.test(btn) && /type="button"/.test(btn), btn);

m = r(h(ds.DropdownMenu, null, h(ds.DropdownMenuTrigger, { asChild: true }, sel())));
let root = (m.match(/<div[^>]*>/) || [""])[0];
check("EffortSelector under DropdownMenuTrigger asChild carries data-state", /data-state="closed"/.test(root), root);
m = r(sel({ id: "eff", "data-testid": "eff" }));
root = (m.match(/<div[^>]*>/) || [""])[0];
check("EffortSelector forwards id and data-testid", /id="eff"/.test(root) && /data-testid="eff"/.test(root), root);

let thrown = null;
try { r(sel({ value: "missing" })); } catch (e) { thrown = e.message; }
check("EffortSelector with an unknown value throws the named message",
  thrown === '[AIThinkingEffortSelector] value "missing" is not one of steps: a, b', String(thrown));
let emptyOk = true;
try { r(sel({ steps: [], value: "a" })); } catch (e) { emptyOk = false; }
check("EffortSelector with empty steps still renders", emptyOk, "threw");

console.log(`\n${fails ? `FAILURES: ${fails}` : "ALL PASS"}`);
console.log("BASELINE:" + r(sel()));
