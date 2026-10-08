// WI-C6-09 check. Usage: node wi-c6-09-check.cjs <build-root>
// Server-renders Calendar, Slider and VerificationCodeInput with the new
// accessible-name props and asserts where each name lands. (The imperative
// toast's close label needs a live provider; it is checked in Storybook.)
const B = process.argv[2];
if (!B) { console.error("usage: node wi-c6-09-check.cjs <build-root>"); process.exit(2); }
const React = require(B + "/node_modules/react");
const { renderToStaticMarkup: r } = require(B + "/node_modules/react-dom/server");
const ds = require(B + "/dist/index.cjs");
const h = React.createElement;
let fails = 0;
const check = (name, ok, got) => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : `\n     got: ${String(got).slice(0, 240)}`}`);
};
const tag = (html, re) => (html.match(re) || [""])[0];
const today = new Date(2026, 4, 15);
const cal = (extra) =>
  r(h(ds.Calendar, { mode: ds.DatePickerMode.singleDay, selected: today, onSelect: () => {}, today, ...extra }));

// 1. Calendar navigation names
let html = cal({ locale: "de", labels: { previousMonth: "Vorheriger Monat", nextMonth: "Nächster Monat" } });
check("Calendar labels.previousMonth names the back button", /aria-label="Vorheriger Monat"/.test(html), tag(html, /<button[^>]*Previous month[^>]*>/));
check("Calendar labels.nextMonth names the forward button", /aria-label="Nächster Monat"/.test(html), tag(html, /<button[^>]*Next month[^>]*>/));
html = cal({});
check("Calendar default names stay English", /aria-label="Previous month"/.test(html) && /aria-label="Next month"/.test(html), "missing default");

// 2. Slider thumb naming
const thumb = (props) => tag(r(h(ds.SliderContinuous, { defaultValue: [40], ...props })), /<span[^>]*role="slider"[^>]*>/);
let t = thumb({ "aria-labelledby": "vol", "aria-describedby": "vol-hint" });
check("Slider aria-labelledby lands on the role=slider thumb", /aria-labelledby="vol"/.test(t), t);
check("Slider aria-labelledby suppresses the 'Value' fallback", !/aria-label="Value"/.test(t), t);
check("Slider aria-describedby lands on the thumb", /aria-describedby="vol-hint"/.test(t), t);
const root = tag(r(h(ds.SliderContinuous, { defaultValue: [40], "aria-labelledby": "vol" })), /<span[^>]*dir="ltr"[^>]*>/);
check("Slider aria-labelledby no longer lands on the Root span", !/aria-labelledby/.test(root), root);
t = thumb({ "aria-label": "Volume" });
check("Slider aria-label still names the thumb", /aria-label="Volume"/.test(t), t);
t = thumb({});
check("Slider with no name keeps the 'Value' fallback", /aria-label="Value"/.test(t), t);

// 3. VerificationCodeInput digit names
html = r(h(ds.VerificationCodeInput, { length: 4, digitLabel: (i, n) => `Ziffer ${i + 1} von ${n}` }));
check("VerificationCodeInput digitLabel names each digit", /aria-label="Ziffer 1 von 4"/.test(html) && /aria-label="Ziffer 4 von 4"/.test(html), tag(html, /<input[^>]*>/));
html = r(h(ds.VerificationCodeInput, { length: 4 }));
check("VerificationCodeInput default digit names stay English", /aria-label="Digit 1 of 4"/.test(html), tag(html, /<input[^>]*>/));

console.log(`\n${fails ? `FAILURES: ${fails}` : "ALL PASS"}`);
