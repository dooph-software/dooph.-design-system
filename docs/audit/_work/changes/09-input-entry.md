# 09 — Input: number entry filter and range-derived error

### Number inputs block invalid characters at entry; `min` / `max` drive the error state
- files:
  - `src/components/Input/Input.tsx` (header contract: behavior + new constraint)
  - `src/components/Input/Input.stories.tsx`
- what changed:
  - Number variants (`number`, `iconNumber`) only accept digits, one decimal separator and a leading minus (the minus only when `min` is undefined or below 0). Typing a character that adds nothing valid is blocked in `onBeforeInput`. Anything else that gets in (a partly valid paste, autofill, IME) is sanitised in the change handler before `onChange` / `onValueChange` run, with the caret kept in place. Paste "12ab3.4.5" gives "123.45"; "--1" gives "-1"; "1.2.3" gives "1.23".
  - The decimal separator is the `locale`'s when `format` is on, and "." otherwise. Grouping (the comma, or the locale's group separator) and whitespace are stripped, as before for `format`, now also without `format`.
  - New props `min?: number` and `max?: number` (number variants). A committed value outside [min, max] shows the danger chrome and sets `aria-invalid`. Committed = value at last blur when uncontrolled (the `defaultValue` until then), the current `value` when controlled. Empty or half-typed text is never out of range. The value is never clamped.
  - `hasError` is now authoritative: `true` forces the error, `false` suppresses the automatic one, omitted lets the range decide.
  - Consumer `onBeforeInput`, `onChange` and `onPaste` still run (`onBeforeInput` runs first; if it calls `preventDefault`, the filter steps aside). On text variants `min` / `max` are still passed through to the DOM; their type is now `number`.
  - Stories: new "Number — range"; the formatted story's comment now notes the entry filter.
- consumer impact: number variants no longer accept letters or symbols, and a comma typed without `format` is now treated as grouping and removed (before it was kept). Anyone typing decimal commas needs `format` plus `locale`. `min` / `max` on number variants now change visual error state. `min` / `max` props typed as `string` on Input no longer compile (now `number`).
- breaking: yes — v6. Old → new: number Input accepted any text → only digits, one decimal separator and an allowed leading minus; `min` / `max` accepted `number | string` → `number`; `hasError` omitted never errored → may error when `min` / `max` are set.
- verified:
  - `npm run lint` exits 0. Scoreboard metrics before == after (only the plan line moved, from other agents' work).
  - Real browser (esbuild bundle in the browser pane, real key events): per-key "a", "$", ",", "2" with "1" gives "12" (blocked keys fire no change); "--1" with `min=-5` gives "-1"; "1.2.3" gives "1.23"; a chunked insert of "12ab3.4.5" gives "123.45"; consumer `onBeforeInput`/`onChange` logged; `min=0 max=100` typing "500" has no `aria-invalid` until blur, then `true`; `hasError={false}` with 150 has none; `hasError` with 5 has `true`; a controlled field with 250 is invalid right away.
  - Not verified: the `min >= 0` blocks minus by key press (same code path as the negative case), IME, autofill, locale-decimal typing (de-DE) with the new filter, Storybook, pixel look.
- docs owed:
  - `skills/**` Input docs and README: entry filtering, `min` / `max`, `hasError` precedence, decimal comma needs `format` + `locale`.
  - CHANGELOG and v6 migration skill: the breaking note above.

## DONE
