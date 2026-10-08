# Brief 03 — Const renames, one colour lookup, public-surface cleanup (agent B)

Read first: `docs/audit/_work/agent-rules.md` (mandatory). Then, in `docs/audit/REMEDIATION.md`:
- the WI-129, WI-068, WI-123 and WI-125 blocks;
- decision lines D-06, D-14 and D-15;
- the WI-128 block, for its ProgressIndicator NaN part only.

Line numbers are from `b436647`; locate code by its quoted anchors.

Change record: `docs/audit/_work/changes/03-renames-color-internals.md`.

## Your files (only these)
- `src/components/ProgressIndicator/**`, `src/components/LinearProgressIndicator/**`, `src/components/AIChat/AIContextGauge*`.
- In `src/components/LoadingSpinner/**`: ONLY the colour lookup. Do NOT touch its animation or timing; a later batch rebuilds that.
- `src/utils/color.ts`.
- Text/font constants: wherever `FontAxes` is defined and used. Find them with `rg -n "FontAxes|FontAxis" src`.
- The folder barrels (`src/components/*/index.ts`) and `src/index.ts`, for the public-surface cleanup.
- `src/styles/index.css` and `src/styles/dooph-component-tokens.css`, ONLY to delete the three unused helpers (WI-125). Nothing else there.
- Stories in your folders.

NOT Calendar/DatePicker/Input/OutlineButton/VerificationCode: agent A owns those, so leave their exports alone and report anything needed there. Exception: the barrel lines exporting the date helpers are yours, but coordinate by only removing exports. Never edit the helper source files in agent A's folders.

## Do
1. **Const/type renames, v6 (WI-129, D-14):**
   - `FontAxes` → `FontAxis`: the const now shares the type's name.
   - `ProgressIndicatorVariants` → `ProgressIndicatorVariant`.
   - Do NOT rename `TrackingValue`; the maintainer didn't ask for it.
   - Update all uses, stories and `src/index.ts`.
2. **One colour lookup (WI-068, D-06):**
   - ProgressIndicator, LoadingSpinner (colour only), ShapeMorphSpinner if it has its own copy, and AIContextGauge resolve `color` through `resolveDsColor` in `src/utils/color.ts`.
   - Delete the private name→var tables.
   - Result: `color="text-secondary"` / `"danger"` work on every progress and loader component.
   - Keep `LoadingSpinnerColor` / `ProgressIndicatorColor`-style consts if they exist, but make them resolve through the shared lookup.
3. **ProgressIndicator NaN guard (WI-128 part):** `progress={NaN}` throws like the other out-of-range values. Today it draws a full ring.
4. **Public surface (WI-123/125, D-15, agent discretion):**
   - Stop exporting `isSameDay`, `startOfDay`, `formatRangeLabel`, `formatSingleLabel`, `formatTriggerLabel` and `serializeAxes` from the folder barrels and `src/index.ts`. Internal imports switch to direct file paths if they went through the barrel.
   - Keep `buttonVariants` and `tabTriggerVariants`.
   - Keep `stickerVariants` / `checkboxVariants` only if another component imports them; otherwise remove them from the public surface.
   - Keep the `DateMatcher` and `TextStyleProps` types public.
   - Delete the three unused CSS helpers. They are `ds-focus-ring`, `ds-disabled-control`, and the margin helper the audit called `ds-my-ui-xs`, now renamed by the spacing pass to `ds-my-ui-sm`. Verify with `rg` that nothing in `src/` uses each one before deleting it.
5. **Header contracts:** update any header whose described behaviour changes, e.g. ProgressIndicator's colour or NaN behaviour.

## Verify
- `npm run lint` exits 0.
- `rg -n "FontAxes|ProgressIndicatorVariants\b" src` → nothing.
- `rg -n "isSameDay|startOfDay|formatRangeLabel|formatSingleLabel|formatTriggerLabel|serializeAxes" src/index.ts src/components/*/index.ts` → nothing.
- A tsc probe confirms `color="text-secondary"` type-checks on every progress/loader component.
- Scoreboard: no metric rises.
- No browser and no `npm run build` here.

## Change record must include
- The exact old → new / removed-export list for v6.
- Which recipes stayed public and why.
- The colour behaviour change: names that used to draw nothing now draw.
