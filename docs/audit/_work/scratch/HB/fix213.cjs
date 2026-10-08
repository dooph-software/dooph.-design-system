// one-off: replace §2.13 body in H2-matrix.md with matrix-derived counts
const fs = require("fs");
const path = require("path");
const p = path.resolve(__dirname, "../../horizontal/H2-matrix.md");
const L = fs.readFileSync(p, "utf8").split("\n");
const i = L.findIndex((l) => l.startsWith("### 2.13 state styling"));
const j = L.findIndex((l, k) => k > i && l.startsWith("- R2.2/R8.9 require"));
const repl = [
  "### 2.13 state styling",
  "",
  "- **Dominant: CSS reads state from attributes or pseudo-classes: 47/65 components that style a state** (matrix `state` column). Breakdown:",
  "  - Radix `data-[state]`/`data-[disabled]`/`data-[highlighted]`: 19",
  "  - the component's own `data-*` or `group-*` read by CSS: 17 (e.g. RollHoverText/UnderlineLinkText `data-active`, RevealChangeText `data-open`, CopyButton `data-copied`, LinearProgressIndicator `data-hidden`, MorphRotationShape `data-mode`)",
  "  - CSS pseudo-classes / host selectors: 11",
  "- 18 use a JS class or ternary:",
  "  - **JUSTIFIED** (8). JS picks content, a lifecycle class or layout, not a style state:",
  "    - RollChangeText/FadeChangeText animation-lifecycle class (header-sanctioned)",
  "    - SliderContinuous/Stepped/Labeled `ds-slider-glide`",
  "    - CalendarGrid range-position classes",
  "    - AIPromptInputSubmit icon/variant swap",
  "    - TableHeaderCell icon swap",
  "  - **DRIFT** (10). A visual state is decided by a JS ternary:",
  "    - the component **also emits the data attribute that nothing reads** (4):",
  '      - AIToolPart (`data-state` + `data-variant` emitted; colour from `state === AIToolPartState.error ? "text-danger-primary" : "text-ghost-fg"`, AIToolPart.tsx:71-73)',
  "      - Input wrapper (`data-disabled` unread; U6-F12)",
  "      - CodeDigitInput (`data-filled`/`data-error` unread; U6-F12)",
  '      - CalendarPresetItem (`data-active` + `isActive && "bg-ghost-active"`; U7-F12)',
  "    - **no attribute at all** (6):",
  "      - TypeableDropdownTrigger disabled (U5-F2)",
  "      - DatePickerSplitTrigger disabled shell",
  "      - HotkeyIndicator `pressed` (HotkeyIndicator.tsx:22-24 `pressed ? 'bg-ghost-active border-border-primary' : 'bg-surface-page border-border-primary'`)",
  "      - ToastProvider per-variant colour for ToastTitle/ToastDescription (U8-F8, 3 matrix rows)",
  "  - AIPromptInput emits `data-state`/`data-disabled` and styles none of them. Presumably a consumer hook; not counted.",
];
L.splice(i, j - i, ...repl);
let s = L.join("\n");
s = s.replace("Even so, five of them emit the attribute that would make the ternary unnecessary", "Even so, four of them emit the attribute that would make the ternary unnecessary");
fs.writeFileSync(p, s);
console.log("replaced", i, j);
