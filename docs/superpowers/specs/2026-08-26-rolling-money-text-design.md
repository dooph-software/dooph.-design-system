# RollingMoneyText — Design

**Date:** 2026-08-26
**Status:** Approved
**Supersedes:** the `## RollingMoneyText` section of `2026-08-26-ds-updates-design.md`

A pre-animated text wrapper for US-formatted money figures. When the value
changes, each digit rolls vertically into place like an analog cash register.
The animation fires **on change only** — never idle, never on mount.

Sibling of `RollChangeText` / `RollHoverText` / `ShimmerText`: a wrapper that
inherits typography from whatever role text encloses it, not a role of its own.

---

## Why the working-tree implementation is being replaced

The version currently in the working tree has defects that are structural, not
cosmetic. They are recorded here because the new design exists to make them
unrepresentable.

1. **Animation fires roughly every other change.** Digit cells are keyed
   `d-${i}` and animated by *applying a class*. Re-applying a class already
   present on an element does not restart a CSS animation, so a second change
   at the same digit index swaps text content silently.
2. **Diffing is left-anchored.** `buildCells` walks old and new strings by index
   from the left. Money must align from the right. On `$982.10 → $1,240.00` the
   tens digit is compared against a comma, `bothDigits` fails, and most of the
   figure does not animate at all — while the digits that do animate show the
   wrong travel.
3. **Outgoing faces never unmount.** `animating` is never cleared, so each
   change leaves a permanent `aria-hidden` span at `opacity: 0` (`forwards`).
4. **The two faces use different layout modes** — outgoing is
   `absolute inset-0 flex items-center justify-center`, incoming is
   `relative inline-block`. They are never vertically aligned to each other.
5. **`.ds-rolling-money-digit` cannot be aligned correctly.** It is
   `height: 1em; line-height: 1em; overflow: hidden; vertical-align: baseline`.
   A clipped inline-block takes its baseline from its bottom margin edge, so the
   glyphs clip and ride above the text baseline. No value of `1em` fixes this.
6. **Cents positioning is tuned against an unknown.** `smallCentsComponent`
   brings its own absolute size from its role class; `ml-[0.15em]
   translate-y-[-0.15em]` is a guess against a size the component cannot see.
7. **The decimal point is dropped.** The reference treatment keeps it in the
   raised small part (`$5,746` + a small `.31`).

---

## 1. Rendering model — the wheel

Each digit is a **wheel**: a static 0–9 column whose position is driven by one
custom property. Nothing mounts, unmounts, or changes class to animate.

```html
<span class="ds-rolling-money-wheel">
  <span class="ds-rolling-money-clip">
    <span class="ds-rolling-money-col" style="--ds-money-digit: 4">
      <span>0</span><span>1</span>…<span>9</span>
    </span>
  </span>
  <span class="ds-rolling-money-space" aria-hidden="true">0</span>
</span>
```

```css
.ds-rolling-money-wheel { position: relative; display: inline-block;
                          font-variant-numeric: tabular-nums; }
.ds-rolling-money-space { visibility: hidden; }
.ds-rolling-money-clip  { position: absolute; inset: 0; overflow: hidden; }
.ds-rolling-money-col   { display: block;
  transform: translateY(calc(var(--ds-money-digit, 0) * -10%));
  transition: transform var(--ui-rolling-money-duration)
                        var(--ui-rolling-money-ease); }
.ds-rolling-money-col > span { display: block; }
```

**Why this shape:**

- *It cannot fail to fire.* Only `--ds-money-digit` changes between renders. A
  transition on a changed value always runs. Defects 1 and 3 become
  unrepresentable rather than patched.
- *Alignment needs no magic numbers.* The hidden `0` spacer is a normal in-flow
  glyph, so it supplies both the wheel's width and its baseline. The clip is
  `inset: 0` against that spacer's line box — exactly `1lh` — and each of the
  ten column children is also `1lh`, so `-10%` per digit lands precisely.
  Defects 4 and 5 are resolved by construction.
- *Fixed duration regardless of distance.* `3 → 8` visibly passes 4,5,6,7 in the
  same ~180ms a `3 → 4` takes. Far travel reads as a fast streak into place.
  This is the cash-register feel.

**Accepted behavior: `9 → 0` reverses.** With a plain ten-cell column, a ones
wheel going 9→0 rolls backwards through 8…1 while the tens wheel rolls forward.
A forward-wrapping variant (eleven cells ending in a duplicate `0`, snapping back
with the transition suppressed for one frame) was considered and **deliberately
rejected** in favour of the simpler column. Do not add wrap logic later without
revisiting this decision.

**Stagger is off by default.** Every wheel starts and lands together — one
~180ms snap for the whole figure. `--ui-rolling-money-stagger` remains as a
token defaulting to `0ms` so a consumer can dial in a cascade. For the token to
mean anything it must still be wired up, so each wheel sets

```css
transition-delay: calc(var(--ds-money-place, 0) * var(--ui-rolling-money-stagger));
```

where `--ds-money-place` is the wheel's place index — right-to-left, so raising
the token above `0ms` produces a right-to-left cascade (ones lead). At the `0ms`
default every delay computes to zero and the figure moves as one.

## 2. Place-value model — the parse

`parseMoney(value: string)` returns:

```ts
{ prefix: string;        // leading run of non-digit chars, e.g. "$" or "-$"
  integerDigits: string[];
  centsDigits: string[]; // empty when there is no "." in the value
  suffix: string }       // trailing run of non-digit chars
```

The decimal separator is the **last** `.` in the string. Thousands commas are
**discarded on parse and re-derived** at render time, every three places from the
right. A separator therefore can never be diffed against a digit — this is the
fix for defect 2, and the reason commas are not part of the cell model.

Wheels are keyed by **place value, not string index**, counting rightward within
each scope: `int:0`, `int:1`, `int:2`, `cents:0`, `cents:1`.

`$982.10 → $1,240.00`:

| | `int:3` | `int:2` | `int:1` | `int:0` | `cents:1` | `cents:0` |
|---|---|---|---|---|---|---|
| before | — | 9 | 8 | 2 | 1 | 0 |
| after  | 1 | 2 | 4 | 0 | 0 | 0 |

- Every surviving wheel keeps its React identity, so the tens wheel rolls 8→4.
- **A newly-needed wheel mounts showing `0`** and rolls to its value on the next
  frame (a `requestAnimationFrame` after commit, so the browser has painted the
  `0` and the transition has a from-state). `int:3` above rolls 0→1, like a
  register wheel turning off zero.
- **A departing wheel rolls to `0` and fades out simultaneously**, unmounting on
  the *opacity* `transitionend`. Fading is what makes this safe: a wheel resting
  at `0` would read as a leading zero if cleanup were ever late, and opacity
  always transitions, so the event always fires — transform alone would not fire
  for a wheel that was already showing `0`. A 600ms timeout backstops it, and
  `reconcileWheels` drops any in-flight exit on the next value change, so a
  stuck wheel self-heals.

## 3. US format only

`.` is the decimal separator, `,` the thousands separator. No localization, no
`Intl` dependency, no separator configuration. A consumer wanting a different
format formats upstream and passes the resulting string.

## 4. API

```ts
type RollingMoneyTextBaseProps =
  Omit<HTMLAttributes<HTMLSpanElement>, "children"> & { children: string };

export type RollingMoneyTextProps =
  | (RollingMoneyTextBaseProps & { smallCents?: false; smallCentsComponent?: never })
  | (RollingMoneyTextBaseProps & {
      smallCents: true;
      smallCentsComponent: ComponentType<{ children?: ReactNode; className?: string }>;
    });
```

The pairing is enforced by the discriminated union. **The render-time
`throw new Error` is removed** — a type-level constraint must not be a runtime
failure.

`forwardRef` erases the union when destructuring, so the `forwardRef` result is
cast to a typed function component — the same technique `BaseText` already uses
for its polymorphic typing (`BaseText.tsx`, `PolymorphicTextComponent`).

`children` is a pre-formatted string, matching the existing contract. The
component does not accept a number and does not format.

## 5. `smallCents`

- The split puts **`.` with the cents**: `$5,746` + a raised small `.31`.
- Cents wheels are ordinary wheels and roll on the same terms as the dollars.
- Root is `inline-flex` with `align-items: baseline`.
- The cents live in a wrapper that stays at the **parent's** font size — the
  passed role sets its own size *inside* that wrapper. The wrapper carries:

  ```css
  .ds-rolling-money-cents {
    margin-left: var(--ui-rolling-money-cents-gap);
    transform: translateY(calc(-1 * var(--ui-rolling-money-cents-rise)));
  }
  ```

  Expressing the rise in **parent**-em is the only way to get a stable result
  when the caller controls the cents font size. It is a tunable token, not a
  hardcoded guess (Rule 5: appearance logic belongs in tokens).

**Known limitation of this API shape.** Because `smallCentsComponent` brings an
absolute size from its role class, the cents-to-dollars *ratio* changes with
whichever role wraps `RollingMoneyText`, and `--ui-rolling-money-cents-rise` can
only be correct for one ratio at a time. The default is tuned for
`TitleText` + `LabelText`. Stories must render Title and Hero side by side so
the drift is visible and a consumer knows to retune the token. This was an
accepted trade against an em-relative, token-sized alternative.

## 6. Tokens (`src/styles/tokens.css`)

| Token | Current | Target |
|---|---|---|
| `--ui-rolling-money-duration` | `180ms` | `180ms` (unchanged) |
| `--ui-rolling-money-stagger` | `28ms` | `0ms` |
| `--ui-rolling-money-ease` | — | `cubic-bezier(0.32, 0.72, 0, 1)` |
| `--ui-rolling-money-cents-rise` | — | `0.42em` |
| `--ui-rolling-money-cents-gap` | — | `0.04em` |

`cubic-bezier(0.32, 0.72, 0, 1)` matches `--ui-underline-link-ease` and the
existing `ds-roll-in` curve — decisive out, soft settle, no overshoot.

## 7. Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .ds-rolling-money-col { transition: none; transition-delay: 0ms; }
}
```

The value still updates; it arrives instantly. No `!important` is needed because
nothing else sets the transition.

## 8. Accessibility

Ten glyphs per wheel would be announced as "0123456789" once per digit. So:

- The visual strip is `aria-hidden="true"`.
- The root carries the real value in an `sr-only` span — the pattern already in
  use at `CopyButton.tsx:96`.
- **No `aria-live`.** A total that updates on every table-row hover must not
  narrate.

## 9. CSS removed from `src/styles/index.css`

Delete (currently lines ~408–450):

- `.ds-rolling-money-digit`
- `.ds-rolling-money-out` / `.ds-rolling-money-in`
- `@keyframes ds-rolling-money-out` / `@keyframes ds-rolling-money-in`
- the `prefers-reduced-motion` block targeting those two classes

`ds-roll-in` / `ds-roll-out` and `--ds-roll-dir` stay — they belong to
`RollChangeText`, which is unaffected.

## 10. Files

| File | Change |
|---|---|
| `src/components/Text/RollingMoneyText.tsx` | Rewrite |
| `src/styles/index.css` | Replace the RollingMoneyText block |
| `src/styles/tokens.css` | Update stagger default, add three tokens |
| `src/components/Text/RollingMoneyText.stories.tsx` | Rewrite |
| `docs/superpowers/specs/2026-08-26-ds-updates-design.md` | Point its RollingMoneyText section here |

No barrel changes: `src/components/Text/index.ts` already exports the component
and its props type, and `src/index.ts:12` re-exports the Text barrel.

## 11. Stories

1. **Default** — buttons swapping between values of the *same* digit count.
2. **MagnitudeChange** — `$982.10 → $1,240.00 → $12,450.00`, exercising wheel
   mount-from-zero and roll-to-zero-then-unmount.
3. **SmallCents** — `smallCents` with `smallCentsComponent={LabelText}`.
4. **RoleScaling** — the same value at `TitleText` and `HeroText`, side by side,
   so the cents-ratio drift from §5 is visible.
5. **TableScrub** — a small table whose row hover drives an aggregate figure.
   This is the motivating use case and the one that catches "fires only every
   other change".

## 12. Verification

- `npm run lint`
- `npm run build`
- Storybook: **TableScrub, alternating between two rows repeatedly** — the
  specific interaction that fails today. Every change must animate.
- Storybook: MagnitudeChange run in both directions repeatedly, confirming no
  orphaned spans accumulate in the DOM.
- Storybook with reduced motion forced: values swap instantly, no layout shift.

## 13. Non-goals

- Number formatting, `Intl`, or non-US separators.
- Idle or ambient animation. The roll is change-driven only.
- 3D, blur, or perspective. That treatment belongs to `RollHoverText`.
- Colour change or flash on increase/decrease.
- Forward wrap on `9 → 0` (see §1).
