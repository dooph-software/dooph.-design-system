# 08E — Input: fixed-width number variants, opt-in hug, opt-in number formatting

### Number inputs fill their container by default; `autoWidth` hugs; `format` formats on blur [next-plan: "Input number variants: hug + centre", "Number formatting with separators"]
- files:
  - `src/components/Input/Input.tsx` (header contract rewritten)
  - `src/components/Input/constants.ts` (variant doc comment)
  - `src/components/Input/Input.stories.tsx`
- what changed:
  - Number variants (`number`, `iconNumber`) are now FIXED width like the text variant: they fill their container or take a consumer width (`className="w-32"`), never narrower than a square, and the content (icon included) is left-aligned.
  - New boolean prop `autoWidth` restores the old behaviour for number variants: hug the value through the hidden mirror span, content centred. That code path is untouched, now behind the prop. Ignored on text variants.
  - New props for number variants (default off): `format?: boolean | Intl.NumberFormatOptions` and `locale?: string`. Format on blur: while focused the field shows the raw value, blurred it shows `Intl.NumberFormat` output ("1234567" focused, "1,234,567" blurred in en-US). `format={true}` keeps every fraction digit; pass options for control. Typed or pasted grouping separators and whitespace are stripped; the locale's decimal separator is read as the decimal point (the focused field shows it, e.g. "1234567,25" in de-DE). Text that is not a plain number is shown as typed.
  - New prop `onValueChange(value: string)` on every variant, per the repo's value-control rule. It fires on every change with the raw string (separators stripped, "." decimal when `format` is on; the input's own value otherwise). `onChange` is unchanged and still runs first; with `format` on its `event.target.value` is the displayed text.
  - `value` / `defaultValue` stay raw strings in both modes. With `format` on the input is internally always controlled by the display text; the component keeps raw state itself when the consumer passes `defaultValue`.
  - Number variants set `inputMode="decimal"` (a consumer's own `inputMode` wins).
  - With `autoWidth` + `format`, the mirror follows the displayed (formatted) text.
  - Stories: `NumberGrows` replaced by `NumberFixedWidth` (fixed default, plus a `w-32` consumer width), `NumberAutoWidth`, and `NumberFormatted` (en-US, de-DE, de-DE currency, controlled with `onValueChange`). The `Variants` grid now uses fixed 160px columns.
- header contract change (for the maintainer to commit on its own, per AGENTS.md): the constraint "The number variants HUG their value through a hidden mirror span" is reworded to "ONLY `autoWidth` number variants hug"; the mirror-follows-value constraint now says it follows the displayed text; a new constraint says that with `format` on the input is always controlled by the display text and raw state never stores display text. `## behavior` states the new fixed-width default, `format`, `onValueChange` and `inputMode`.
- consumer impact: number variants that relied on hugging now stretch to their container. They need `autoWidth` to keep the old look. Layout in a flex row with no width will now fill the row. Nothing else changes unless `format` / `onValueChange` / `autoWidth` are used. With `format` and no `locale`, the runtime's locale is used, so server and client can differ in SSR: pass `locale` for stable output.
- breaking: yes — v6 (visual/layout only; no API removed). Old → new: `<Input variant="number" />` hugged its value, content centred → fills its container, content left-aligned; migration: add `autoWidth` to keep the hugging, centred look.
- verified:
  - `npm run lint` (tsc) exits 0; all existing usages (stories, other components) compile.
  - Scoreboard before == after: nothing moved ("use client" stays 27; Input already had it).
  - Real-DOM check (esbuild bundle of the component, rendered with React 19 in the browser pane, input events dispatched): en-US blurred "1,234,567"; focused "12345678" after typing "1,234,5678" (separators stripped), `onValueChange` got "12345678", blurred "12,345,678"; de-DE "1234567.5" blurred "1.234.567,5", pasting "1.234.567,25" focused "1234567,25" with raw "1234567.25", blurred "1.234.567,25"; `inputMode` "decimal"; default number has no mirror span, `autoWidth` has one.
  - Not verified: pixel widths and left alignment (the scratch page had no stylesheet), caret behaviour when typing mid-string in a formatted field, Storybook.
- docs owed:
  - `skills/**` Input docs and README: fixed-width default, `autoWidth`, `format` / `locale`, `onValueChange`, the SSR `locale` note.
  - CHANGELOG: v6 breaking note above.
  - v6 migration skill: number Input layout change.

## DONE
