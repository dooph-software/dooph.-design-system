# Wave D — plan items, three agents in parallel (each takes ONE section)

The preamble is identical to `docs/audit/_work/briefs/06-wave-a.md`. Read that file's preamble (above its first `---`) and follow it: rules, drift protocol, docs deferred, look-change rule, record format, no Storybook or build, hand-back ≤15 lines. Do not use the Browser pane. Verify with lint, node/esbuild scripts in your scratchpad, and type probes. Write your record as you go: usage limits have cut agents off before.

Waves A–C are done. That includes:
- the motion scale; `cn` scales;
- the token sweep: no arbitrary px or numeric spacing left;
- the shapes `createShape` factory;
- Modal/Sheet `dialogShell`;
- asChild; no default exports.

Change record: `docs/audit/_work/changes/06D<n>-<name>.md`.

---

## D1 — One focus ring and one disabled look (WI-062 → WI-066 → WI-067 → WI-075, then the rest of WI-125)
- **Files:** every file those four WIs name, plus `src/styles/{tokens.css,index.css,dooph-component-tokens.css}`. Among them: Tabs, VerificationCode/CodeDigitInput, Checkbox, ShapeButton, Calendar (CalendarPresetItem / CalendarGrid), SearchBox, Input, DropdownTrigger, Toggle/toggleOption, AIChat (AIPromptInput, AIToolPart), SplitButton, HotkeyIndicator.
  - **NOT** Icons/Shapes/BaseIcon (D2), nor Sticker/Table/DatePicker/AnimatedText/Text/LoadingSpinner/ProgressIndicator/WavyDivider (D3).
- **Order:** do them in WI order. They depend on each other.
- **Contract conflicts:** WI-067 changes `toggleOption`'s disabled handling. `toggleOption.ts` and `FancyToggleSwitch.tsx` carry header contracts, and the fancy toggle reuses the disabled helper. Keep both working and update both headers. FancyToggleSwitch is in `src/components/Toggle/`, and it's yours for this purpose.
- **WI-125's last helper:** once WI-067 leaves `ds-disabled-control` unused (AIPromptInput and toggleOption used it), delete it, completing WI-125. Confirm with `rg` first.
- **Look:** these are bug fixes. Missing focus rings and disabled looks should appear; existing correct looks should not change. If a mechanism collapse would visibly change a control that looks right today, skip that control and report it.
- **Scoreboard:** m5 (hand-rolled focus) and m6 (hand-rolled disabled) should reach 0.

## D2 — Icons and shapes: `IconSize` and element access (WI-065, WI-108's code part)
- **Files:**
  - `src/components/Icons/**` (BaseIcon, the leaves, and the GENERATED barrel via `scripts/generate-icon-exports.mjs`, never by hand);
  - `src/components/Shapes/{BaseShape.tsx,createShape.tsx}`;
  - `src/components/SidebarWithHoverIcon/**`;
  - where `IconSize` is renamed, the import lines in other components, as small anchored edits.
- **WI-065:** rename the source const/type to `IconSize` with a non-widening type, put the open arm on the prop, and drop the generator alias. Read the WI for the exact shape. The rename across call sites is ONE deterministic script under `docs/audit/_work/scratch/waveD/`, with `--verify`.
- **WI-108:** BaseIcon and BaseShape accept `ref` and SVG rest props, so every icon, every shape (through `createShape`) and SidebarWithHoverIcon reach their `<svg>`. The element-access RULE text in WI-107 is deferred to the docs pass; do only the code.
- **Markup must stay byte-identical** for existing usage. Prove it with a before/after render script.

## D3 — Leaf cleanups (WI-083, WI-119, WI-049, WI-027)
- **Folders:** `src/components/{Sticker,Table,DatePicker,AnimatedText/RollingDigitsText.tsx,Text,LoadingSpinner,ProgressIndicator,WavyDivider}/**`, `src/utils/length.ts` (new or existing per WI-119), and `src/index.ts` (WI-027 routing only; small anchored edits).
- **WI-083:** remove Sticker's inner children wrapper, so a consumer `gap` on Sticker works. Record the reason at the other purposeful wrappers WI-083 names, but only those in your folders; report the others.
- **WI-119:** the leaf cleanups listed, as they apply now. DatePicker has changed a lot since; re-derive from F-113 where anchors are gone.
- **WI-049:** rewrite ProgressIndicator's stale `wavy` and `progress` JSDoc.
- **WI-027:** give LoadingSpinner, ProgressIndicator and WavyDivider a named folder index, and route `src/index.ts` through it. If the WI also touches AIChat, report that part rather than editing; D1 owns AIChat.
