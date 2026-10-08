// WI-C6-12 check. Usage: node wi-c6-12-check.cjs <build-root>
// (1) cn resolves a package height utility against a stock one (WI-C1-03),
// (2) ChatDivider no longer restates WavyDivider's 12px band as a CSS height,
// (3) AIThinkingPart's disclosure button hugs its text without `!important`.
const B = process.argv[2];
if (!B) { console.error("usage: node wi-c6-12-check.cjs <build-root>"); process.exit(2); }
const React = require(B + "/node_modules/react");
const { renderToStaticMarkup: r } = require(B + "/node_modules/react-dom/server");
const ds = require(B + "/dist/index.cjs");
const h = React.createElement;
let fails = 0;
const check = (name, ok, got) => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : `\n     got: ${String(got).slice(0, 260)}`}`);
};
const classesOf = (tag) => ((tag.match(/class="([^"]*)"/) || [, ""])[1]).split(/\s+/);

const merged = ds.cn("h-button px-3", "h-auto");
check('cn("h-button px-3", "h-auto") -> "px-3 h-auto"', merged === "px-3 h-auto", merged);

const svg = (r(h(ds.ChatDivider, null, "Today")).match(/<svg[^>]*>/) || [""])[0];
check("ChatDivider rule has no h-3", !classesOf(svg).includes("h-3"), svg);
check("ChatDivider rule keeps the svg height attribute 12", /height="12"/.test(svg), svg);

const btn = (r(h(ds.AIThinkingPart, { state: ds.AIThinkingPartState.thought, label: "Thought for 26s" }, "Reasoning")).match(/<button[^>]*>/) || [""])[0];
const bc = classesOf(btn);
check("AIThinkingPart disclosure button has no h-auto!", !bc.includes("h-auto!"), btn);
check("AIThinkingPart disclosure button has h-auto and no h-button", bc.includes("h-auto") && !bc.includes("h-button"), btn);

console.log(`\n${fails ? `FAILURES: ${fails}` : "ALL PASS"}`);
