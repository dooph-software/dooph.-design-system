# 06A5 — Behaviour bugs: VerificationCodeInput entry, Input aria-invalid, flat ProgressIndicator track

Checklist:
- [x] Sequential verification-code entry [WI-110 / F-040]
- [x] Input `hasError` sets `aria-invalid` [WI-111 / F-070]
- [x] Flat ProgressIndicator shares the wavy track geometry [WI-069 / F-033]
- [x] lint + scoreboard

Scoreboard before: arbitrary px 18, numeric spacing 36, raw var 5, focus 3, disabled 2, use client 28, JS timers 6, onValueChange 0, default exports 74.

## Flat ProgressIndicator no longer paints a stray track dot near completion [WI-069 / F-033]
- files: `src/components/ProgressIndicator/ProgressIndicator.tsx`, `src/components/ProgressIndicator/waveGeometry.ts` (doc comment only).
- what changed: the flat variant drops its own copy of the remainder-track formula and calls `getWavyTrackGeometry`, the function the wavy variant already uses. When it returns null (the clamp band near completion, and p=1) the track `<circle>` is not rendered at all, instead of rendering a zero-length round-capped dash that paints a dot. The track keeps its `ds-progress-arc` class (WI-070 had already landed). Doc comments on `FlatProgressIndicator` and `getWavyTrackGeometry` updated. No header contract in either file.
- consumer impact: no stray grey dot ahead of the arc's head at sm ≈0.82–0.91 … xl ≈0.90–0.95, nor through a translucent `color` at p=1. Also fixes AIContextGauge's dial. A value moving into the band drops the track at once instead of transitioning it to a dot (the wavy variant always behaved this way). All other values render identically.
- breaking: no
- verified: scratch SSR script (copy of `scratch/W4a/flat-track.cjs`, run on an esbuild bundle of the source) before → after: `zero-length track dashes: 12` → `0`; every flat row at p=0.9, 0.94, 1 now `trackCircles=0`; flat and wavy p=0 and p=0.5 rows byte-identical to the baseline (dasharray and dashoffset). `rg trackLength|trackOffset ProgressIndicator.tsx` → 0 hits.
- docs owed: loading-indicators SKILL.md :186-190 "Track arc: computed in render (not rAF). Correct formula:" → "Track arc: computed in render (not rAF) by `getWavyTrackGeometry`, the same function the wavy variant uses. Formula:"; :200-202 "`getWavyTrackGeometry` computes … returns `null` at completion" → "`getWavyTrackGeometry` (shared with the flat variant) computes the circular remainder and returns `null` once it has no length". CHANGELOG Fixed: "The flat `ProgressIndicator` (and `AIContextGauge`) no longer paints a stray track dot near completion."

## Input's `hasError` now announces the error to assistive technology [WI-111 / F-070]
- files: `src/components/Input/Input.tsx`.
- what changed: `hasError` sets `aria-invalid="true"` on the `<input>` in all four variants (text, iconText, number, iconNumber), as CodeDigitInput already did. It is written ahead of `...props`, so a consumer's own `aria-invalid` still wins. Header `## behavior` gains the bullet "`hasError` paints the danger chrome and sets `aria-invalid` on the `<input>` (a consumer's own `aria-invalid` wins)." Constraints untouched; consistent with "every other prop, and `ref`, always land on the `<input>`".
- consumer impact: screen readers now announce errored Inputs as invalid. No visual change.
- breaking: no
- verified: scratch SSR script on an esbuild bundle of the source (the audit's `W7c/invalid-check.cjs` is not on disk, so it was re-created): before → 4 FAIL (all four variants), after → 7 PASS: four variants `aria-invalid="true"`; `hasError` + `aria-invalid={false}` → `"false"`; no `hasError` → attribute absent; VerificationCodeInput control → `"true"`.
- docs owed: codebase SKILL.md :148 "+ `hasError` bool." → "+ `hasError` bool (danger chrome + `aria-invalid` on the input, as `CodeDigitInput`)."; CHANGELOG Fixed: "`Input`: `hasError` sets `aria-invalid` on the `<input>`, matching `CodeDigitInput`."

## VerificationCodeInput entry is sequential, so a digit always lands where it shows [WI-110 / F-040]
- files: `src/components/VerificationCode/VerificationCodeInput.tsx`, `src/components/VerificationCode/VerificationCode.stories.tsx` (new `NonSequentialEntry` story after `Disabled`).
- what changed:
  - `writeDigit` writes at `Math.min(index, value.length)` and auto-advances from there, so a stale focus cannot place a digit out of position.
  - Each cell's `onFocus`: an empty cell past the first empty one moves focus to the first empty cell (tap, Tab).
  - ArrowRight stops at the first empty cell (`focusAt(Math.min(index + 1, value.length))`). The WI only listed `writeDigit` + `onFocus`; this was needed because of the next point.
  - **Deviation from the WI's code, found in testing:** the WI's `onFocus` alone breaks ordinary typing. `focusAt` runs inside the same event as `setValue`, before the new value renders, so the next cell's `onFocus` reads the old value and bounces focus back (typing 7 into cell 1 left focus on cell 1; paste likewise). Fix: a `movingFocusRef` flag set while `focusAt` moves focus, so the redirect only applies to user focus. Hence the ArrowRight clamp (it also goes through `focusAt`).
  - Header: `## behavior` gains the sequential-entry bullet (incl. Backspace on a filled middle cell deletes it, later digits shift left, focus stays). `## constraints` gains a new bullet stating why `focusAt` moves skip the redirect and that every `focusAt` target must be a legal cell — the flag looks removable and is not.
- consumer impact: tapping/Tabbing into a later empty cell now lands on the first empty one; typed digits appear where the caret is. Public value shape unchanged (gapless digit string). Typing in order, paste, ArrowLeft, Backspace unchanged.
- breaking: no
- verified: esbuild bundle of the source mounted in a scratch page (not Storybook), focused browser tab:
  - WI step 1 on empty: `[0, "7|||||", 1]` (before the fix the WI documents `[3, "7|||||", 4]`).
  - Partial "123": focus cell 6 → 3; `type(cells[1],'9')` → `"1|9|3|||"`, focus 2; ArrowRight on cell 4 stays 3; ArrowRight on filled cell 2 → 3rd cell.
  - Filled: Backspace on cell 3 → `"1|2|4|5|6|"`, focus 2.
  - Controlled: focus cell 5 → 0; typing 4,2,0 echoes "420", focus 3; paste "987654" → echo "987654", focus 5.
  - Guard check: same bundle with the `movingFocusRef` check stripped → typing 7 into cell 1 leaves focus on cell 1 (bounce), confirming the constraint.
- docs owed: CHANGELOG Fixed: "`VerificationCodeInput`: focusing an empty cell past the first empty one moves focus to the first empty cell, so a typed digit lands where it shows."

## Verification (all three)
- `npm run lint` → exit 0.
- Scoreboard after: motion 1 (was 0 — the hit is `Toast/Toast.tsx`, agent A4's folder, not this change), JS timers 6 → 5 and default exports 74 → 0 (other agents). Nothing in this change raised any count.
- No build run in this checkout; scratch bundles stub `utils/cn` because `cn.ts` was mid-edit by agent A2 (`./twMergeTheme` not yet present at the time).

## DONE
