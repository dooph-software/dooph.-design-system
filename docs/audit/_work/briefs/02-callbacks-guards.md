# Brief 02 — Value callbacks, inverse-theme flag, Calendar/DatePicker guards (agent A)

Read first: `docs/audit/_work/agent-rules.md` (mandatory). Then, in `docs/audit/REMEDIATION.md`:
- the WI-127 and WI-128 blocks;
- decision lines D-12 and D-13.

Also read the maintainer defaults in `docs/audit/figma-additions.md` (section "Defaults accepted"). Line numbers in the WIs are from `b436647`; locate code by its quoted anchors (drift protocol). Since then the spacing scale, size words and motion have changed by script, so anchors can differ in class names.

Change record: `docs/audit/_work/changes/02-callbacks-guards.md`.

## Your files (only these)
`src/components/VerificationCode/**`, `src/components/DatePicker/**`, `src/components/Calendar/**`, `src/components/OutlineButton/**`, `src/components/Input/**`, and the stories in those folders.

Also `src/index.ts`, but only if a renamed export requires it.

NOT ProgressIndicator: agent B owns it, including its NaN guard.

## Do
1. **Value controls use `value` / `defaultValue` / `onValueChange(value)` (WI-127, D-13).**
   - **VerificationCodeInput:** `onChange(value: string)` → `onValueChange`. Its `Omit<…, "onChange" | "defaultValue">` changes accordingly. Keep `value` and `defaultValue`.
   - **DatePicker:** `value` stays, `onChange` → `onValueChange`.
   - **Calendar:** `selected` → `value`, `onSelect` → `onValueChange`.
   - **DatePickerSplitTrigger:** `onSelect` → `onValueChange`, keeping `value`.
   - **CalendarPresetsPanel**, and any other internal part with the same pattern, internally. Rename only: do NOT add uncontrolled `defaultValue` where none exists (maintainer default 1).
   - Update all internal forwarding (`selected={props.value}` / `onSelect={props.onChange}` disappear), comments (`rangeSelection.ts` mentions `onChange`), header contracts and stories.
   - Leave the force-look booleans (`active`, `hovered`, `glowing`, `pressed`) alone; per D-13 they stay.
2. **OutlineButton `inverseTheme` → `themeInverse`**, matching Tooltip/AIModelSelect. Update its JSDoc and stories.
3. **Discriminated-union guards (WI-128, D-12 = render nothing):**
   - **Input:** icon variants type `icon` as `ReactElement`, so `null`/`undefined`/`false`/`""` are compile errors. The runtime guard throws on a non-element (per WI-128 / Input's header).
   - **Calendar:** on an invalid `value` (not a valid Date in single-day mode; not `{from: Date, to: Date}` in range mode), warn in development, then render NOTHING. Today it crashes with a TypeError.
   - **Calendar `mode` values:** any value other than the two known ones must not silently render as a range. Treat it as invalid: development warning, render nothing.
   - **DatePicker / DatePickerTrigger:** the date labels must tolerate an invalid value without crashing. No label, or the placeholder, is fine.
   - Keep the existing dev-warning wording style.
   - Update header contracts so they describe render-nothing.
4. **Stories:**
   - Fix every story broken by the renames.
   - Add one story per new guard behaviour where cheap, e.g. "Calendar — invalid value renders nothing".

## Verify
- `npm run lint` exits 0.
- A tsc probe (as WI-127/128 describe, in a temporary `.tmp-probe-A/` folder, deleted after) confirms:
  - the old prop names fail and the new ones pass;
  - `icon={null}` / `icon={false}` fail on Input icon variants.
- Scoreboard: m9 (callbacks not named `onValueChange`) must drop to 0 within your files. No metric may rise.
- No browser and no `npm run build` here.

## Change record must include
For the v6 migration skill, an exact old → new list of every renamed prop, per component. Also every header contract touched.
