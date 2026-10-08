# Wave B — plan items, five agents in parallel (each takes ONE section)

The preamble is identical to `docs/audit/_work/briefs/06-wave-a.md`. Read that file's preamble (everything above its first `---`) and follow it: rules, drift protocol, docs deferred, look-change rule, change-record format, no Storybook or build, hand-back ≤15 lines.

Since wave A, these are also done:
- `asChild` works on OutlineButton / ShapeButton / DropdownTrigger;
- `cn` knows every text style and the DS scales, via the generated `src/utils/twMergeTheme.ts` (don't hand-edit; `npm run sync-tokens` regenerates it);
- no default exports remain;
- Toast exits on `animationend`;
- VerificationCodeInput enters digits sequentially.

Change record: `docs/audit/_work/changes/06B<n>-<name>.md`.

---

## B1 — Modal & Sheet: portal escape hatch, then one shared dialog shell (WI-095 → WI-098)
- **Folders:** `src/components/{Modal,Sheet}/**`, plus a new internal `dialogShell.tsx` where WI-098 says.
- **Order:** WI-095 first, then WI-098. Batch 01 put both on `ds-motion-overlay-dialog` / `-sheet` helpers. Keep those exact classes, so timing doesn't change.

## B2 — Table: style merge, roles, `aria-sort`, `buttonProps`, header text (WI-106, WI-074, WI-114)
- **Folder:** `src/components/Table/**`.
- **WI-114:** every header label renders as ButtonText. If that visibly changes the header typography compared with today's correct rendering, skip it and report.

## B3 — Slider / LinearProgressIndicator / CopyButton / CTAButton types, Slider keyboard, LPI colour docs (WI-116, WI-105, WI-046)
- **Folders:** `src/components/{Slider,LinearProgressIndicator,CopyButton,CTAButton}/**`.
- **Note:** batch 05 just added `highlightedStep` and `SliderSteppedProps` to Slider, and rebuilt CTAButton. Keep both working.
- **WI-046:** the source JSDoc, header and stories. The skill and CHANGELOG parts are deferred.

## B4 — Menu family (WI-089, WI-090, WI-092, WI-102, WI-118, and WI-024's story part)
- **Folders:** `src/components/{Menu,SearchBox,HotkeyIndicator,DropdownCaret}/**`. In `src/components/DropdownTrigger/**`, only what WI-118 names. Wave A already edited DropdownTrigger for `asChild`, so keep that.
- **WI-090** adds a HotkeyIndicator `menu` variant to replace descendant overrides. The rendered look inside the menu must stay the same; it is a refactor, not a restyle.
- **WI-024:** stories only; the skills are deferred.

## B5 — AIChat parts + Checkbox (WI-094, WI-103, WI-104, WI-097, WI-054, WI-052, WI-018)
- **Folders:** `src/components/{AIChat,Checkbox}/**`. In `src/components/VerificationCode/CodeDigitInput.tsx` and `src/components/AnimatedText/RollingDigitsText.tsx`, ONLY their header-contract comment blocks, per WI-018. No code changes there.
- **Styles:** `src/styles/dooph-component-tokens.css` only for WI-054's `ds-*` rule and WI-097's reduced-motion tone. Small anchored edits.
- **WI-104:** `cn` now knows `h-button`, so its precondition is met.
- **WI-052** gates Checkbox's pressed background to the unchecked state. That is a bug fix; the checked state's look stays.
