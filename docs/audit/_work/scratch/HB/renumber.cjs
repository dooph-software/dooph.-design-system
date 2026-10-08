// one-off: re-point §2 cross-references after HA/HC were found to already own several columns
const fs = require("fs");
const path = require("path");
const p = path.resolve(__dirname, "../../horizontal/H2-matrix.md");
let s = fs.readFileSync(p, "utf8");
const rep = [
  ["`TooltipContentProps` (Tooltip.tsx:31). → **HB-F3**.", "`TooltipContentProps` (Tooltip.tsx:31). → **already filed as HA-F3** (S4 batch). No HB finding."],
  ["→ part of **HB-F6** (§2.11). U6-F14 owns Tabs/Checkbox; Button and SheetContent were not filed.", "→ **already filed**: HA-F1 (Button, SheetContent) + U6-F14 (Tabs, Checkbox)."],
  ["  → **HB-F4**.", "  → **HB-F3**."],
  ["The precedence split itself → **HB-F5**.", "The precedence split itself → **HB-F4**."],
  ["- **DRIFT** → **HB-F6**. Already filed in part: U6-F14 (Tabs/Checkbox VariantProps typing + exported recipes), U4-F9 (SplitButton duplicate), U2-F4 (recipes leaking through barrels).",
   "- **DRIFT.** The typing and export halves are already filed: HA-F1 (VariantProps on Button/SheetContent) + U6-F14 (Tabs/Checkbox), HA-F2 + U2-F4 (public recipes), U4-F9 (SplitButton duplicate). The remaining half, cva vs four hand-built idioms, → **HB-F5**."],
  ["- **DRIFT** → **HB-F7**.", "- **DRIFT** → **HB-F6**."],
  ["Even so, four of them emit the attribute that would make the ternary unnecessary → **HB-F8**.",
   "Even so, four of them emit the attribute that would make the ternary unnecessary. → **already filed as HC-F5**, which lists every DRIFT row above except DatePickerSplitTrigger's JS disabled shell (DatePickerSplitTrigger.tsx; add at dedupe). No HB finding."],
  ["- → **HB-F9** (the cross-cutting view: five mechanisms and two wrong-element bugs; any one unit saw only its own slice).",
   "- → **already filed as HC-F4** (the same cross-cutting view, with the same locations). No HB finding."],
  ["- → **HB-F10**.",
   "- → **already filed as HC-F3** (Checkbox, CodeDigitInput, ShapeButton, TabsContent). HC judged ModalContent/SheetContent/ToastViewport `outline-none` compliant (tabIndex −1 fallback focus targets outside the tab order). HB's concern is narrower: Radix focuses these programmatically after keyboard activation, and that can match `:focus-visible`. It is recorded here for Phase-4 verification, not filed."],
  ["→ **HB-F11** is the merge vehicle giving the component-level split.", "→ **already filed as HC-F1** (same four mechanisms, same related IDs). No HB finding; this table is the component-level view for that merge."],
  ["- → **HB-F12** (coverage and form).", "- → **HB-F7** (coverage and form)."],
  ["- → **HB-F13** (merge vehicle).", "- → **HB-F8** (merge vehicle)."],
  ["**DRIFT, already the cross-cutting finding U4-F1 + U5-F1** (the orchestrator merges them).", "**DRIFT, already the cross-cutting finding U4-F1 + U5-F1 = HC-F6**."],
  ["- **No HB finding** (HC/units own it; a matrix-level duplicate would add nothing).", "- **No HB finding**: HC-F2 owns it (62 sites, 21 files); a matrix-level duplicate would add nothing."],
];
for (const [a, b] of rep) {
  if (!s.includes(a)) { console.error("MISSING: " + a.slice(0, 70)); process.exitCode = 1; continue; }
  s = s.replace(a, b);
}
// §3 intro: columns with no HB finding
const introStart = s.indexOf("Columns with no HB finding, and why:");
const introEnd = s.indexOf("### HB-F1:");
s = s.slice(0, introStart) +
  "Columns with no HB finding, and where they are owned instead:\n" +
  "- ref type (§2.3): follows R2.1/R8.15; outliers are U4-F12.\n" +
  "- displayName (§2.4): 110/110.\n" +
  "- props type (§2.5): HA-F3.\n" +
  "- asChild (§2.9): U4-F1+U5-F1 = HC-F6.\n" +
  "- consts (§2.10): HA.\n" +
  "- state styling (§2.13): HC-F5.\n" +
  "- disabled (§2.14): HC-F4.\n" +
  "- focus (§2.15): HC-F3.\n" +
  "- typography (§2.16): one mechanism.\n" +
  "- token access (§2.17): HC-F2.\n" +
  "- motion (§2.18): HC-F1.\n" +
  "- outside-subtree (§2.19): clean.\n" +
  "- folder index (§2.22): U2-F14.\n\n" +
  "HB files only where the cross-cutting view was not already filed, or where the matrix surfaced a location no pass had: HB-F1 (DropdownCaret) and HB-F2 (MorphRotationShape ref override, HotkeyIndicator/DropdownCaret/SplitButton refs).\n\n" +
  s.slice(introEnd);
fs.writeFileSync(p, s);
console.log("ok");
