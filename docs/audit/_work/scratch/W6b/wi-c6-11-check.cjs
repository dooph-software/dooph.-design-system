// WI-C6-11 check. Usage: node wi-c6-11-check.cjs <build-root>
// Server-renders AIThinkingPart's three root branches and asserts that the
// root carries data-phase = the state prop, while data-state is unchanged
// (phase on the first two branches, open/closed on the disclosure branch).
const B = process.argv[2];
if (!B) { console.error("usage: node wi-c6-11-check.cjs <build-root>"); process.exit(2); }
const React = require(B + "/node_modules/react");
const { renderToStaticMarkup: r } = require(B + "/node_modules/react-dom/server");
const ds = require(B + "/dist/index.cjs");
const h = React.createElement;
const S = ds.AIThinkingPartState;
let fails = 0;
const rootTag = (html) => (html.match(/^<div[^>]*>/) || [""])[0];
const check = (name, ok, got) => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : `\n     got: ${got}`}`);
};
const cases = [
  ["thinking", { state: S.thinking, label: "Thinking" }, null, "thinking", "thinking"],
  ["thought, no transcript", { state: S.thought, label: "Thought for 26s" }, null, "thought", "thought"],
  ["thought + transcript, closed", { state: S.thought, label: "Thought for 26s" }, "Reasoning", "thought", "closed"],
  ["thought + transcript, open", { state: S.thought, label: "Thought for 26s", defaultOpen: true }, "Reasoning", "thought", "open"],
];
for (const [name, props, children, phase, dataState] of cases) {
  const tag = rootTag(r(h(ds.AIThinkingPart, props, children)));
  check(`${name}: root data-phase="${phase}"`, tag.includes(`data-phase="${phase}"`), tag);
  check(`${name}: root data-state="${dataState}" (unchanged)`, tag.includes(`data-state="${dataState}"`), tag);
}
console.log(`\n${fails ? `FAILURES: ${fails}` : "ALL PASS"}`);
