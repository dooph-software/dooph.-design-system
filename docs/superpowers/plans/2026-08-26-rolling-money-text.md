# RollingMoneyText Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken working-tree `RollingMoneyText` with a transition-driven, place-value-keyed digit wheel that animates reliably on every value change.

**Architecture:** Each digit becomes a *wheel* — a static 0–9 column clipped to one line-height, positioned by `transform: translateY(calc(var(--ds-money-digit) * -10%))` and moved by a CSS **transition**, not a keyframe animation. Wheels are keyed by place value counting rightward, so money aligns from the right and separators are re-derived rather than diffed. Because only a custom property changes between renders, the animation cannot fail to fire — the failure mode that makes the current version work every other time is removed by construction.

**Tech Stack:** React 18 `forwardRef`, TypeScript, Tailwind v4 (`@layer utilities` in `src/styles/index.css`), CSS custom properties, Storybook 8. No new dependencies.

## Global Constraints

Copied verbatim from `docs/superpowers/specs/2026-08-26-rolling-money-text-design.md` and the `dooph-ds-architecture` / `dooph-ds-contribution` skills. **Every task's requirements implicitly include this section.**

- **This repo has no test runner.** `npm run lint` is `tsc --noEmit`. There is no vitest/jest, and this plan does **not** add one — that is out of scope. The red/green cycle is preserved by writing a self-checking Storybook story (`ParseCases`) that renders expected-vs-actual with a ✓/✗ per row: it shows all ✗ before implementation and all ✓ after. Treat a ✗ exactly as you would a failing test.
- **US format only.** `.` is the decimal separator, `,` the thousands separator. No `Intl`, no localization, no separator configuration.
- **No `var(--ui-*)` in a `className`.** Only Tailwind utilities or `ds-*` helper classes.
- **`style={{}}` is permitted only** to carry a `--ds-*` custom property that the component's own CSS reads. Never for a design value the component itself decided — that is a token.
- **New `--ui-*` tokens go in `src/styles/tokens.css`**, then `npm run sync-tokens` regenerates the `@theme inline` block in `index.css` **and** `src/styles/theme.css`. Never hand-edit those generated regions.
- **Tokens that are raw-`var()`-only must be added to `EXCLUDED` in `scripts/sync-theme.mjs`** or the sync emits a bogus Tailwind utility for them.
- **New CSS classes go inside `@layer utilities`** in `src/styles/index.css` (currently lines 195–376), alongside `.ds-roll-hover`. Not unlayered.
- **Never put a Tailwind variant on a package class** (`data-[exiting]:ds-rolling-money-wheel`). Variants compose only with generated utilities, so this emits no rule at all, silently. Put the state in the CSS rule itself: `.ds-rolling-money-wheel[data-exiting]`.
- **`"use client"` only in a module that actually uses** `useState`/`useEffect`/`useRef`/a browser API/a timer. `forwardRef` and `useMemo` do not require it. Pure model modules must **not** carry the directive.
- **`displayName` is required** on every `forwardRef` component.
- **Stories must use `Button` + `ButtonVariant`**, never a raw `<button>`.
- **Verify by reading computed style, not by eye.** A class that never generated and a token that resolves to the same value look identical on screen.
- Custom-property naming is `--ds-*` (per `RollChangeText`'s `--ds-roll-dir`). `RollHoverText`'s bare `--i` is a legacy inconsistency — do not copy it.

---

### Task 1: Motion and layout tokens

**Files:**
- Modify: `src/styles/tokens.css:139-141`
- Modify: `scripts/sync-theme.mjs:93-95` (the `EXCLUDED` set)
- Generated (do not hand-edit): `src/styles/index.css` `@theme inline` block, `src/styles/theme.css`

**Interfaces:**
- Consumes: nothing.
- Produces: `--ui-rolling-money-duration`, `--ui-rolling-money-stagger`, `--ui-rolling-money-ease`, `--ui-rolling-money-cents-rise`, `--ui-rolling-money-cents-gap`. Tasks 2 and 4 read these.

- [ ] **Step 1: Replace the rolling-money token block in `tokens.css`**

Find this block (currently at `src/styles/tokens.css:139-141`):

```css
  /* Rolling money digits (RollingMoneyText) — 2D cash-register snap, not 3D. */
  --ui-rolling-money-duration: 180ms;
  --ui-rolling-money-stagger: 28ms;
```

Replace it with:

```css
  /* Rolling money digits (RollingMoneyText) — 2D cash-register snap, not 3D.
   *
   * `stagger` defaults to 0ms: every wheel starts and lands together, one snap
   * for the whole figure. It stays a token so a consumer can dial in a
   * right-to-left cascade (ones place leads) without patching the package.
   *
   * `cents-rise` / `cents-gap` are in em of the PARENT — the dollars — not of
   * the cents. `smallCentsComponent` brings its own absolute size from its role
   * class, so the component cannot see how large the cents are; expressing the
   * offset against the dollars is the only stable reference. The default is
   * tuned for TitleText + LabelText. */
  --ui-rolling-money-duration: 180ms;
  --ui-rolling-money-stagger: 0ms;
  --ui-rolling-money-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --ui-rolling-money-cents-rise: 0.42em;
  --ui-rolling-money-cents-gap: 0.04em;
```

- [ ] **Step 2: Add the three new tokens to `EXCLUDED` in `scripts/sync-theme.mjs`**

Find (currently `scripts/sync-theme.mjs:93-95`):

```js
  // Rolling money motion — CSS only
  "ui-rolling-money-duration",
  "ui-rolling-money-stagger",
```

Replace with:

```js
  // Rolling money motion / cents offset — raw var() in @layer utilities only
  "ui-rolling-money-duration",
  "ui-rolling-money-stagger",
  "ui-rolling-money-ease",
  "ui-rolling-money-cents-rise",
  "ui-rolling-money-cents-gap",
```

- [ ] **Step 3: Regenerate the theme**

Run: `npm run sync-tokens`
Expected: exits 0.

- [ ] **Step 4: Verify no bogus utilities were generated**

Run: `git diff --stat src/styles/index.css src/styles/theme.css`
Expected: **both files unchanged** (`git diff` prints nothing for them). The five tokens are all `EXCLUDED`, so the generated `@theme inline` block and `theme.css` must not gain entries. If either file changed, Step 2 was applied incorrectly — inspect `git diff` and fix the `EXCLUDED` set before continuing.

- [ ] **Step 5: Verify the tokens resolve**

Run: `grep -n "rolling-money" src/styles/tokens.css`
Expected: five lines, `--ui-rolling-money-stagger: 0ms;` among them.

- [ ] **Step 6: Commit**

```bash
git add src/styles/tokens.css scripts/sync-theme.mjs
git commit -m "feat(tokens): rolling money ease and cents offset tokens, stagger off by default"
```

---

### Task 2: Wheel CSS

**Files:**
- Modify: `src/styles/index.css` — delete the unlayered block at lines ~408–450, add the new block inside `@layer utilities` (which closes at line 376)

**Interfaces:**
- Consumes: the five tokens from Task 1.
- Produces: classes `ds-rolling-money`, `ds-rolling-money-figure`, `ds-rolling-money-wheel`, `ds-rolling-money-clip`, `ds-rolling-money-col`, `ds-rolling-money-space`, `ds-rolling-money-sep`, `ds-rolling-money-cents`. Reads `--ds-money-digit` and `--ds-money-place` set by Task 4. Honors `[data-exiting]` on `.ds-rolling-money-wheel`.

- [ ] **Step 1: Delete the old unlayered block**

Delete everything from the comment `/* RollingMoneyText — 2D cash-register digit roll (no blur / no 3D). */` through the closing `}` of the `@media (prefers-reduced-motion: reduce)` block that targets `.ds-rolling-money-out, .ds-rolling-money-in` — i.e. `.ds-rolling-money-digit`, `.ds-rolling-money-out`, `.ds-rolling-money-in`, `@keyframes ds-rolling-money-out`, `@keyframes ds-rolling-money-in`, and that media block.

**Do not touch** `@keyframes ds-roll-out` / `ds-roll-in` or `--ds-roll-dir` immediately above — those belong to `RollChangeText` and are still in use.

- [ ] **Step 2: Verify the old classes are gone and the sibling survived**

Run: `grep -c "ds-rolling-money" src/styles/index.css; grep -c "ds-roll-in" src/styles/index.css`
Expected: `0` then a non-zero number.

- [ ] **Step 3: Add the new block inside `@layer utilities`**

Insert immediately **before** the closing `}` of `@layer utilities` (line 376 before this edit), after the `.ds-underline-link` rules:

```css
  /* RollingMoneyText — 2D cash-register digit roll (no blur, no 3D).
   *
   * Each digit is a wheel: a static 0-9 column clipped to one line box and
   * positioned by --ds-money-digit. Using a TRANSITION rather than @keyframes
   * is load-bearing for the same reason it is in .ds-roll-hover above —
   * re-applying a class that is already present does not restart an animation,
   * which is why the previous keyframe-based version fired on roughly every
   * other change. A transition on a changed value always runs, and an
   * interrupted one retargets from wherever the wheel currently sits.
   *
   * The hidden "0" spacer is what makes alignment work without magic numbers:
   * it is an ordinary in-flow glyph, so it supplies both the wheel's width and
   * its baseline. The clip is inset:0 against that spacer's line box — exactly
   * 1lh — and each of the ten column children is also 1lh, so -10% per digit
   * lands precisely. A clipped inline-block takes its baseline from its bottom
   * margin edge, which is why the previous `height:1em;overflow:hidden` wheel
   * could not be aligned at any value of 1em. */
  .ds-rolling-money {
    display: inline-block;
  }
  .ds-rolling-money-figure {
    display: inline-flex;
    align-items: baseline;
    font-variant-numeric: tabular-nums;
  }
  .ds-rolling-money-wheel {
    position: relative;
    display: inline-block;
    font-variant-numeric: tabular-nums;
  }
  /* Sets the wheel's width AND its baseline. Never visible. */
  .ds-rolling-money-space {
    visibility: hidden;
  }
  .ds-rolling-money-clip {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .ds-rolling-money-col {
    display: block;
    transform: translateY(calc(var(--ds-money-digit, 0) * -10%));
    transition: transform var(--ui-rolling-money-duration)
      var(--ui-rolling-money-ease);
    /* At the 0ms default every delay computes to zero and the figure moves as
     * one. Raising the token cascades right-to-left, ones place leading. */
    transition-delay: calc(
      var(--ds-money-place, 0) * var(--ui-rolling-money-stagger)
    );
  }
  .ds-rolling-money-col > span {
    display: block;
  }
  /* A departing wheel rolls to 0 and fades at the same time, so it is invisible
   * well before it unmounts. Fading rather than only rolling is deliberate: a
   * wheel resting at 0 would read as a leading zero if cleanup were ever late,
   * and opacity always transitions, which gives a transitionend that firing on
   * transform alone would not (a wheel already showing 0 does not move). */
  .ds-rolling-money-wheel[data-exiting] {
    opacity: 0;
    transition: opacity var(--ui-rolling-money-duration)
      var(--ui-rolling-money-ease);
  }
  .ds-rolling-money-sep {
    display: inline-block;
  }
  /* Stays at the PARENT font size; smallCentsComponent sets its own size
   * inside. See the tokens.css note on why the offset is parent-em. */
  .ds-rolling-money-cents {
    margin-left: var(--ui-rolling-money-cents-gap);
    transform: translateY(calc(-1 * var(--ui-rolling-money-cents-rise)));
  }
  @media (prefers-reduced-motion: reduce) {
    .ds-rolling-money-col,
    .ds-rolling-money-wheel[data-exiting] {
      transition: none;
      transition-delay: 0ms;
    }
  }
```

- [ ] **Step 4: Verify the block landed inside the layer**

Run: `awk 'NR>=195{if($0 ~ /^}/){print NR": utilities layer closes"; exit}}' src/styles/index.css` then `grep -n "ds-rolling-money-wheel {" src/styles/index.css`
Expected: the `.ds-rolling-money-wheel` line number is **less than** the layer-close line number. If it is greater, the block was inserted after the layer and will incorrectly beat consumer utilities — move it.

- [ ] **Step 5: Verify the CSS compiles**

Run: `npm run build:css`
Expected: exits 0, `dist/styles.css` written.

- [ ] **Step 6: Commit**

```bash
git add src/styles/index.css
git commit -m "feat(styles): transition-driven digit wheel css for RollingMoneyText"
```

---

### Task 3: Pure model — parsing and wheel reconciliation

**Files:**
- Create: `src/components/Text/rollingMoneyModel.ts`
- Create: `src/components/Text/RollingMoneyText.stories.tsx` (replacing the existing file — the `ParseCases` story is written here first as the failing check)

**Interfaces:**
- Consumes: nothing.
- Produces — Task 4 imports exactly these:
  - `type ParsedMoney = { prefix: string; integerDigits: string[]; centsDigits: string[]; suffix: string }`
  - `type WheelState = { place: number; digit: number; exiting: boolean }`
  - `parseMoney(value: string): ParsedMoney`
  - `restingWheels(digits: string[]): WheelState[]`
  - `reconcileWheels(prev: WheelState[], digits: string[]): { next: WheelState[]; pending: Map<number, number> }`
  - `separatorBefore(wheels: WheelState[], index: number): boolean`

**Note:** this module is pure — **no `"use client"` directive**, per the Global Constraints.

- [ ] **Step 1: Write the failing check — the `ParseCases` story**

Create `src/components/Text/RollingMoneyText.stories.tsx` with **only** this content for now (the remaining stories arrive in Task 5):

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { BodyText, LabelText } from "./BaseText";
import { parseMoney } from "./rollingMoneyModel";

const meta = {
  title: "Primitives/RollingMoneyText",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/* Expected/actual table. This repo has no test runner, so this story IS the
 * test for the pure model: every row must read PASS. */
const CASES: Array<{
  input: string;
  prefix: string;
  int: string;
  cents: string;
  suffix: string;
}> = [
  { input: "$1,234.56", prefix: "$", int: "1234", cents: "56", suffix: "" },
  { input: "$982.10", prefix: "$", int: "982", cents: "10", suffix: "" },
  { input: "$12,450.00", prefix: "$", int: "12450", cents: "00", suffix: "" },
  { input: "-$5,746.31", prefix: "-$", int: "5746", cents: "31", suffix: "" },
  { input: "$1,234", prefix: "$", int: "1234", cents: "", suffix: "" },
  { input: "1234.5", prefix: "", int: "1234", cents: "5", suffix: "" },
  { input: "$1,234.", prefix: "$", int: "1234", cents: "", suffix: "" },
  { input: "$0.99", prefix: "$", int: "0", cents: "99", suffix: "" },
  { input: "$1.2M", prefix: "$", int: "1", cents: "2", suffix: "M" },
  { input: "—", prefix: "—", int: "", cents: "", suffix: "" },
];

export const ParseCases: Story = {
  render: () => (
    <div className="flex flex-col gap-1 p-4">
      {CASES.map((c) => {
        const got = parseMoney(c.input);
        const ok =
          got.prefix === c.prefix &&
          got.integerDigits.join("") === c.int &&
          got.centsDigits.join("") === c.cents &&
          got.suffix === c.suffix;
        return (
          <div key={c.input} className="flex items-baseline gap-3">
            <LabelText className={ok ? "text-success" : "text-danger"}>
              {ok ? "PASS" : "FAIL"}
            </LabelText>
            <BodyText>{c.input}</BodyText>
            <LabelText className="text-text-secondary">
              {`prefix=${JSON.stringify(got.prefix)} int=${JSON.stringify(
                got.integerDigits.join(""),
              )} cents=${JSON.stringify(
                got.centsDigits.join(""),
              )} suffix=${JSON.stringify(got.suffix)}`}
            </LabelText>
          </div>
        );
      })}
    </div>
  ),
};
```

> If `text-success` / `text-danger` are not the correct token utilities in this repo, run `grep -n "color-success\|color-danger" src/styles/tokens.css` and substitute the utilities that the sync generates. Do not hardcode a hex.

- [ ] **Step 2: Run the check and confirm it fails**

Run: `npm run lint`
Expected: **FAIL** — `Cannot find module './rollingMoneyModel'`. This is the red state.

- [ ] **Step 3: Write the model**

Create `src/components/Text/rollingMoneyModel.ts`:

```ts
/*
 * RollingMoneyText — pure model. No React, no DOM, no "use client".
 *
 * Two jobs:
 *   1. Split a US-formatted money string into prefix / integer digits / cents
 *      digits / suffix. Thousands separators are DISCARDED here and re-derived
 *      at render time, so a separator can never be diffed against a digit.
 *   2. Reconcile the previous wheel set against a new digit string, keyed by
 *      PLACE VALUE counting rightward — never by string index. Index-from-left
 *      matching is what made $982.10 -> $1,240.00 compare the tens digit
 *      against a comma and refuse to animate.
 */

export type ParsedMoney = {
  /** Leading run of non-digit characters, e.g. "$" or "-$". */
  prefix: string;
  integerDigits: string[];
  /** Empty when the value has no decimal separator. */
  centsDigits: string[];
  /** Trailing run of non-digit characters, e.g. "M". */
  suffix: string;
};

export type WheelState = {
  /** Place index counting rightward from 0 within its scope. The React key. */
  place: number;
  digit: number;
  /** Rolling to 0 and fading out; unmounts when the fade ends. */
  exiting: boolean;
};

const isDigit = (c: string) => c >= "0" && c <= "9";

/** Peel the leading and trailing non-digit runs off a fragment. */
function peel(fragment: string) {
  let start = 0;
  while (start < fragment.length && !isDigit(fragment[start])) start++;
  let end = fragment.length;
  while (end > start && !isDigit(fragment[end - 1])) end--;
  return {
    lead: fragment.slice(0, start),
    digits: fragment.slice(start, end).split("").filter(isDigit),
    trail: fragment.slice(end),
  };
}

/**
 * The decimal separator is the LAST "." in the string. US format only — see the
 * spec's non-goals; a consumer wanting another format formats upstream.
 */
export function parseMoney(value: string): ParsedMoney {
  const dot = value.lastIndexOf(".");
  if (dot === -1) {
    const head = peel(value);
    return {
      prefix: head.lead,
      integerDigits: head.digits,
      centsDigits: [],
      suffix: head.trail,
    };
  }
  const head = peel(value.slice(0, dot));
  const tail = peel(value.slice(dot + 1));
  return {
    prefix: head.lead,
    integerDigits: head.digits,
    /* No digits after the "." means no cents group is rendered at all, so
     * "$1,234." shows as "$1,234" rather than a dangling separator. */
    centsDigits: tail.digits,
    suffix: tail.trail,
  };
}

/** Resting set for the initial render. Mount never animates. */
export function restingWheels(digits: string[]): WheelState[] {
  return digits.map((d, i) => ({
    place: digits.length - 1 - i,
    digit: Number(d),
    exiting: false,
  }));
}

/**
 * Structural pass, run synchronously when the value changes.
 *
 * - A place that already exists keeps its React identity and simply receives
 *   its new digit — the transition does the rest.
 * - A place that is newly needed is created at 0 and reported in `pending`, so
 *   the caller can retarget it on the next frame once the browser has painted
 *   a from-state. That is the "wheel turns off zero" behavior.
 * - A place that is no longer needed is kept one more render at 0 with
 *   `exiting: true` so it can roll out and fade.
 * - Wheels already exiting are dropped up front: a new value supersedes an
 *   in-flight exit, which also means a stuck wheel self-heals on the next
 *   change rather than persisting as a phantom leading zero.
 *
 * Returned array is sorted by descending place — left-to-right visual order.
 */
export function reconcileWheels(
  prev: WheelState[],
  digits: string[],
): { next: WheelState[]; pending: Map<number, number> } {
  const pending = new Map<number, number>();
  const byPlace = new Map<number, WheelState>();
  for (const w of prev) {
    if (!w.exiting) byPlace.set(w.place, w);
  }

  const next: WheelState[] = [];
  const n = digits.length;
  for (let i = 0; i < n; i++) {
    const place = n - 1 - i;
    const digit = Number(digits[i]);
    if (byPlace.has(place)) {
      next.push({ place, digit, exiting: false });
    } else {
      next.push({ place, digit: 0, exiting: false });
      pending.set(place, digit);
    }
    byPlace.delete(place);
  }
  for (const w of byPlace.values()) {
    next.push({ place: w.place, digit: 0, exiting: true });
  }

  next.sort((a, b) => b.place - a.place);
  return { next, pending };
}

/**
 * Whether a thousands separator precedes the wheel at `index` in a
 * descending-place array. Counts only non-exiting wheels, so a fading wheel
 * off the left edge does not shift the grouping of the live digits.
 */
export function separatorBefore(wheels: WheelState[], index: number): boolean {
  const live = wheels.reduce((acc, w) => acc + (w.exiting ? 0 : 1), 0);
  let seen = 0;
  for (let i = 0; i < index; i++) {
    if (!wheels[i].exiting) seen++;
  }
  if (wheels[index].exiting || seen === 0) return false;
  return (live - seen) % 3 === 0;
}
```

- [ ] **Step 4: Confirm it type-checks**

Run: `npm run lint`
Expected: PASS (exits 0).

- [ ] **Step 5: Confirm the check passes — every `ParseCases` row reads PASS**

Run: `npm run storybook`, open **Primitives/RollingMoneyText → ParseCases**.
Expected: all ten rows read `PASS`. Any `FAIL` row prints its actual parse next to it — fix `parseMoney`, do not edit the expected values.

- [ ] **Step 6: Commit**

```bash
git add src/components/Text/rollingMoneyModel.ts src/components/Text/RollingMoneyText.stories.tsx
git commit -m "feat(text): place-value parse and wheel reconciliation model"
```

---

### Task 4: Component rewrite

**Files:**
- Modify (full rewrite): `src/components/Text/RollingMoneyText.tsx`

**Interfaces:**
- Consumes: `parseMoney`, `restingWheels`, `reconcileWheels`, `separatorBefore`, `ParsedMoney`, `WheelState` from Task 3; the classes from Task 2; the tokens from Task 1.
- Produces: `RollingMoneyText` and `RollingMoneyTextProps`, already re-exported by `src/components/Text/index.ts` and thus by `src/index.ts:12`. **No barrel changes are needed in this task.**

- [ ] **Step 1: Replace the whole file**

```tsx
/*
 * RollingMoneyText — per-digit 2D roll for US-formatted money strings, on change.
 *
 * ## behavior
 * - Accepts a pre-formatted string (`$1,234.56`). Each digit is a wheel that
 *   transitions to its new position when the value changes; `$`, `,` and `.`
 *   swap without rolling. Mount never animates.
 * - `smallCents` splits on the last `.` and renders `.` plus the cents through
 *   the required `smallCentsComponent` (e.g. LabelText), raised and to the
 *   right. Those cents are ordinary wheels and roll on the same terms.
 * - Wheels are keyed by PLACE VALUE, not string index, so the figure aligns
 *   from the right. A newly needed wheel turns off zero; a departing one rolls
 *   to zero and fades.
 *
 * ## constraints
 * - US format only (`.` decimal, `,` thousands). Do not localize separators.
 * - A wrapper like RollChangeText — inherits typography from the enclosing role
 *   text. No 3D, no blur; that treatment belongs to RollHoverText.
 * - The roll is a CSS transition, never a keyframe animation. Re-applying an
 *   animation class that is already present does not restart it, which is why
 *   the previous version fired on roughly every other change.
 * - `smallCentsComponent` is required when `smallCents` is true — enforced by
 *   the discriminated union below, never by a runtime throw.
 */
"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import {
  parseMoney,
  reconcileWheels,
  restingWheels,
  separatorBefore,
  type WheelState,
} from "./rollingMoneyModel";

type SmallCentsComponent = ComponentType<{
  children?: ReactNode;
  className?: string;
}>;

type RollingMoneyTextBaseProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  /** A pre-formatted US money string. The component does not format. */
  children: string;
};

export type RollingMoneyTextProps =
  | (RollingMoneyTextBaseProps & {
      smallCents?: false;
      smallCentsComponent?: never;
    })
  | (RollingMoneyTextBaseProps & {
      smallCents: true;
      /** Required when `smallCents` is true — e.g. `LabelText`. */
      smallCentsComponent: SmallCentsComponent;
    });

const DIGIT_COLUMN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/* Generous relative to the 180ms token default. Only a backstop: an exiting
 * wheel is already invisible via the opacity transition, and any survivor is
 * dropped by the next reconcile regardless. */
const EXIT_FALLBACK_MS = 600;

function Wheel({
  state,
  onExited,
}: {
  state: WheelState;
  onExited: (place: number) => void;
}) {
  return (
    <span
      className="ds-rolling-money-wheel"
      data-exiting={state.exiting ? "" : undefined}
      style={{ "--ds-money-place": state.place } as CSSProperties}
      onTransitionEnd={(e) => {
        if (state.exiting && e.propertyName === "opacity") {
          onExited(state.place);
        }
      }}
    >
      <span className="ds-rolling-money-clip">
        <span
          className="ds-rolling-money-col"
          style={{ "--ds-money-digit": state.digit } as CSSProperties}
        >
          {DIGIT_COLUMN.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </span>
      </span>
      {/* Sets width and baseline. Never visible. */}
      <span className="ds-rolling-money-space">0</span>
    </span>
  );
}

function Strip({
  wheels,
  scope,
  separators,
  onExited,
}: {
  wheels: WheelState[];
  scope: string;
  separators: boolean;
  onExited: (place: number) => void;
}) {
  return (
    <>
      {wheels.map((w, i) => (
        <span key={`${scope}:${w.place}`} className="contents">
          {separators && separatorBefore(wheels, i) ? (
            <span className="ds-rolling-money-sep">,</span>
          ) : null}
          <Wheel state={w} onExited={onExited} />
        </span>
      ))}
    </>
  );
}

/**
 * Drives one scope's wheel set. Kept as a hook so the integer and cents strips
 * are genuinely independent — a change confined to the cents must not disturb
 * the dollars' wheels or vice versa.
 */
function useWheels(digits: string[]) {
  const joined = digits.join("");
  const [wheels, setWheels] = useState<WheelState[]>(() =>
    restingWheels(digits),
  );
  const prevRef = useRef(joined);

  useEffect(() => {
    if (prevRef.current === joined) return;
    prevRef.current = joined;

    const { next, pending } = reconcileWheels(wheels, joined.split(""));
    setWheels(next);

    /* Retarget brand-new wheels on the NEXT frame. They mount showing 0; the
     * browser has to paint that from-state before a transition to the real
     * digit can run, otherwise the wheel simply appears at its final value. */
    let raf = 0;
    if (pending.size > 0) {
      raf = requestAnimationFrame(() => {
        setWheels((cur) =>
          cur.map((w) =>
            pending.has(w.place) ? { ...w, digit: pending.get(w.place)! } : w,
          ),
        );
      });
    }

    const timer = window.setTimeout(
      () => setWheels((cur) => cur.filter((w) => !w.exiting)),
      EXIT_FALLBACK_MS,
    );

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
    /* `wheels` is read but deliberately not a dependency: this effect must run
     * once per VALUE change, and depending on the state it sets would loop. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);

  const handleExited = (place: number) =>
    setWheels((cur) => cur.filter((w) => !(w.exiting && w.place === place)));

  return { wheels, handleExited };
}

const RollingMoneyTextBase = forwardRef<
  HTMLSpanElement,
  RollingMoneyTextProps
>((props, ref) => {
  const {
    children,
    smallCents = false,
    smallCentsComponent: SmallCents,
    className,
    style,
    ...rest
  } = props as RollingMoneyTextBaseProps & {
    smallCents?: boolean;
    smallCentsComponent?: SmallCentsComponent;
    className?: string;
  };

  const parsed = useMemo(() => parseMoney(children), [children]);
  const intStrip = useWheels(parsed.integerDigits);
  const centsStrip = useWheels(parsed.centsDigits);

  const hasCents = parsed.centsDigits.length > 0;
  const centsBody = (
    <>
      <span className="ds-rolling-money-sep">.</span>
      <Strip
        wheels={centsStrip.wheels}
        scope="cents"
        separators={false}
        onExited={centsStrip.handleExited}
      />
    </>
  );

  return (
    <span
      ref={ref}
      className={cn("ds-rolling-money", className)}
      style={style}
      {...rest}
    >
      {/* Ten glyphs per wheel would be announced as "0123456789" once per
       * digit, so the figure is hidden and the real value is exposed here.
       * No aria-live: a total driven by row hover must not narrate. */}
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="ds-rolling-money-figure">
        {parsed.prefix}
        <Strip
          wheels={intStrip.wheels}
          scope="int"
          separators
          onExited={intStrip.handleExited}
        />
        {hasCents ? (
          smallCents && SmallCents ? (
            <span className="ds-rolling-money-cents">
              <SmallCents>{centsBody}</SmallCents>
            </span>
          ) : (
            centsBody
          )
        ) : null}
        {parsed.suffix}
      </span>
    </span>
  );
});
RollingMoneyTextBase.displayName = "RollingMoneyText";

/* forwardRef collapses the discriminated union when props are destructured, so
 * the public identifier is cast back to it — the same technique BaseText uses
 * to restore its polymorphic typing. */
const RollingMoneyText = RollingMoneyTextBase as (
  props: RollingMoneyTextProps & { ref?: React.Ref<HTMLSpanElement> },
) => ReactNode;

export { RollingMoneyText };
```

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Verify the union is actually enforced**

Add this temporarily at the bottom of the file, run `npm run lint`, then **delete it**:

```tsx
// @ts-expect-error smallCents requires smallCentsComponent
const _bad = <RollingMoneyText smallCents>{"$1.00"}</RollingMoneyText>;
```

Expected: `npm run lint` PASSES with the `@ts-expect-error` present. If it reports the directive is *unused*, the union is not enforcing the pairing — fix the type before continuing.

- [ ] **Step 4: Commit**

```bash
git add src/components/Text/RollingMoneyText.tsx
git commit -m "feat(text): transition-driven wheel rewrite of RollingMoneyText"
```

---

### Task 5: Stories

**Files:**
- Modify: `src/components/Text/RollingMoneyText.stories.tsx` (append to the `ParseCases` story from Task 3)

**Interfaces:**
- Consumes: `RollingMoneyText` from Task 4; `Button` / `ButtonVariant`; `TitleText` / `HeroText` / `LabelText` / `BodyText`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Append the interactive stories**

Add these imports to the top of the file:

```tsx
import { useState } from "react";
import { Button } from "../Button/Button";
import { ButtonVariant } from "../Button/constants";
import { HeroText, TitleText } from "./BaseText";
import { RollingMoneyText } from "./RollingMoneyText";
```

Append below `ParseCases`:

```tsx
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("$1,240.00");
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <TitleText>
          <RollingMoneyText>{value}</RollingMoneyText>
        </TitleText>
        <div className="flex gap-2">
          {["$1,240.00", "$3,891.45", "$2,507.62"].map((v) => (
            <Button
              key={v}
              variant={ButtonVariant.secondary}
              onClick={() => setValue(v)}
            >
              {v}
            </Button>
          ))}
        </div>
        <BodyText className="text-text-secondary">
          Same digit count. Press the same button twice, then alternate — every
          change must roll.
        </BodyText>
      </div>
    );
  },
};

export const MagnitudeChange: Story = {
  render: () => {
    const [value, setValue] = useState("$982.10");
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <TitleText>
          <RollingMoneyText>{value}</RollingMoneyText>
        </TitleText>
        <div className="flex gap-2">
          {["$982.10", "$1,240.00", "$12,450.00"].map((v) => (
            <Button
              key={v}
              variant={ButtonVariant.secondary}
              onClick={() => setValue(v)}
            >
              {v}
            </Button>
          ))}
        </div>
        <BodyText className="text-text-secondary">
          Exercises wheels turning off zero and rolling out. Cycle up and down
          repeatedly — no phantom leading zero may remain.
        </BodyText>
      </div>
    );
  },
};

export const SmallCents: Story = {
  render: () => {
    const [value, setValue] = useState("$5,746.31");
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <TitleText>
          <RollingMoneyText smallCents smallCentsComponent={LabelText}>
            {value}
          </RollingMoneyText>
        </TitleText>
        <div className="flex gap-2">
          {["$5,746.31", "$8,102.37", "$912.04"].map((v) => (
            <Button
              key={v}
              variant={ButtonVariant.secondary}
              onClick={() => setValue(v)}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>
    );
  },
};

/* The cents/dollars ratio is set by whichever role is passed as
 * smallCentsComponent, NOT by the wrapping role — so --ui-rolling-money-cents-rise
 * can only be correct for one pairing at a time. This story exists to make that
 * drift visible; it is a known limitation, not a bug to silently patch. */
export const RoleScaling: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-md p-4">
      <TitleText>
        <RollingMoneyText smallCents smallCentsComponent={LabelText}>
          {"$5,746.31"}
        </RollingMoneyText>
      </TitleText>
      <HeroText>
        <RollingMoneyText smallCents smallCentsComponent={LabelText}>
          {"$5,746.31"}
        </RollingMoneyText>
      </HeroText>
      <BodyText className="text-text-secondary">
        Same cents role at two dollar sizes. The rise token is tuned for Title.
      </BodyText>
    </div>
  ),
};

const ROWS = [
  { label: "Acquisition", amount: "$3,891.45" },
  { label: "Retention", amount: "$982.10" },
  { label: "Expansion", amount: "$12,450.00" },
  { label: "Services", amount: "$5,746.31" },
];
const TOTAL = "$23,069.86";

/* The motivating use case, and the one that catches "fires only every other
 * change": hovering back and forth between two rows. */
export const TableScrub: Story = {
  render: () => {
    const [amount, setAmount] = useState(TOTAL);
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <TitleText>
          <RollingMoneyText smallCents smallCentsComponent={LabelText}>
            {amount}
          </RollingMoneyText>
        </TitleText>
        <div
          className="flex flex-col items-start"
          onMouseLeave={() => setAmount(TOTAL)}
        >
          {ROWS.map((r) => (
            <BodyText
              key={r.label}
              className="cursor-default px-2 py-1"
              onMouseEnter={() => setAmount(r.amount)}
            >
              {r.label}
            </BodyText>
          ))}
        </div>
        <BodyText className="text-text-secondary">
          Hover rows. Alternate between two rows repeatedly — every crossing
          must animate.
        </BodyText>
      </div>
    );
  },
};
```

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/Text/RollingMoneyText.stories.tsx
git commit -m "test(text): RollingMoneyText stories for scrub, magnitude change, role scaling"
```

---

### Task 6: Documentation and full verification

**Files:**
- Modify: `docs/superpowers/specs/2026-08-26-ds-updates-design.md` (the `## RollingMoneyText` section, line ~55)
- Modify: `docs/superpowers/specs/2026-08-26-rolling-money-text-design.md` (§2, exit mechanism)
- Modify: `docs/superpowers/plans/2026-08-26-ds-updates.md` (Task 5 checkbox)

**Interfaces:**
- Consumes: everything above.
- Produces: nothing.

- [ ] **Step 1: Point the umbrella spec at the detailed one**

Replace the body of the `## RollingMoneyText` section in `2026-08-26-ds-updates-design.md` with:

```markdown
## RollingMoneyText
Superseded in full by `2026-08-26-rolling-money-text-design.md`. Summary: a
transition-driven 0–9 digit wheel keyed by place value, `smallCents` +
`smallCentsComponent` enforced by a discriminated union, stagger off by default.
```

- [ ] **Step 2: Correct §2 of the detailed spec to match what was built**

In `2026-08-26-rolling-money-text-design.md`, replace the departing-wheel bullet:

```markdown
- **A departing wheel rolls to `0`, then unmounts** on `transitionend`, with a
  `--ui-rolling-money-duration`-length timeout as a fallback, since
  `transitionend` does not fire when the wheel was already showing `0`.
```

with:

```markdown
- **A departing wheel rolls to `0` and fades out simultaneously**, unmounting on
  the *opacity* `transitionend`. Fading is what makes this safe: a wheel resting
  at `0` would read as a leading zero if cleanup were ever late, and opacity
  always transitions, so the event always fires — transform alone would not fire
  for a wheel that was already showing `0`. A 600ms timeout backstops it, and
  `reconcileWheels` drops any in-flight exit on the next value change, so a
  stuck wheel self-heals.
```

- [ ] **Step 3: Tick the umbrella plan**

In `docs/superpowers/plans/2026-08-26-ds-updates.md`, change the Task 5 line to:

```markdown
- [x] Component + CSS keyframes/tokens if needed + stories + export
```

- [ ] **Step 4: Full build verification**

Run: `npm run lint`
Expected: PASS.

Run: `npm run build`
Expected: exits 0, `dist/` written without errors.

- [ ] **Step 5: Verify the roll actually fires — the defect that motivated this**

Run `npm run storybook`, open **Primitives/RollingMoneyText → TableScrub**.

- Alternate the pointer between "Acquisition" and "Retention" **at least six times**. Every single crossing must animate. This is the exact interaction the previous version failed on roughly every other pass.
- Open **MagnitudeChange** and cycle `$982.10 → $12,450.00 → $982.10` five times. Then in devtools run:

```js
document.querySelectorAll('.ds-rolling-money-wheel').length
```

Expected: **5** while resting on `$982.10` — three integer wheels (`9`,`8`,`2`) plus two cents wheels (`1`,`0`). The count must equal integer digits + cents digits and must **not** grow across cycles. A climbing count means exiting wheels are not being cleaned up.

- [ ] **Step 6: Verify alignment by computed style, not by eye**

Per the contribution skill — a class that never generated and one that resolves correctly look identical on screen. In the **SmallCents** story, run in devtools:

```js
const wheel = document.querySelector('.ds-rolling-money-wheel');
const clip  = wheel.querySelector('.ds-rolling-money-clip');
const col   = wheel.querySelector('.ds-rolling-money-col');
console.log({
  wheelH: wheel.getBoundingClientRect().height,
  clipH:  clip.getBoundingClientRect().height,
  colH:   col.getBoundingClientRect().height,
  transition: getComputedStyle(col).transitionDuration,
  ease: getComputedStyle(col).transitionTimingFunction,
  delay: getComputedStyle(col).transitionDelay,
});
```

Expected:
- `clipH` equals `wheelH` (the clip is `inset: 0` on the spacer's line box).
- `colH` is **10×** `clipH` — if it is not, `-10%` per digit will not land on a digit boundary.
- `transition` is `0.18s`, `ease` is `cubic-bezier(0.32, 0.72, 0, 1)`, `delay` is `0s`. A duration of `0s` means the token did not resolve — check that Task 1 landed and that the class is inside `@layer utilities`.

- [ ] **Step 7: Verify reduced motion**

In devtools → Rendering → *Emulate CSS prefers-reduced-motion: reduce*, reload, and click through **MagnitudeChange**.
Expected: values swap instantly, no layout shift, no residual wheels.

- [ ] **Step 8: Commit**

```bash
git add docs/superpowers/specs/2026-08-26-ds-updates-design.md docs/superpowers/specs/2026-08-26-rolling-money-text-design.md docs/superpowers/plans/2026-08-26-ds-updates.md
git commit -m "docs: point ds-updates spec at the RollingMoneyText design, correct exit mechanism"
```

---

## Self-Review

**Spec coverage** — every section of `2026-08-26-rolling-money-text-design.md` maps to a task:

| Spec § | Task |
|---|---|
| §1 wheel model, CSS | Task 2 |
| §1 stagger wiring (`--ds-money-place`) | Task 2 Step 3, Task 4 `Wheel` |
| §1 `9 → 0` reverses, no wrap | Task 3 — plain `DIGIT_COLUMN`, no wrap logic |
| §2 parse, place-value keys, turn-off-zero, roll-out | Task 3 |
| §3 US format only | Task 3 `parseMoney` |
| §4 discriminated union, no runtime throw | Task 4 Steps 1 and 3 |
| §5 `smallCents`, `.` with the cents, parent-em offset | Task 1 tokens, Task 2 `.ds-rolling-money-cents`, Task 4 render |
| §6 tokens | Task 1 |
| §7 reduced motion | Task 2 Step 3 |
| §8 `sr-only`, `aria-hidden`, no `aria-live` | Task 4 Step 1 |
| §9 old CSS removed | Task 2 Steps 1–2 |
| §10 files | all tasks; barrel confirmed unchanged in Task 4 |
| §11 stories | Task 5 (plus `ParseCases`, added in Task 3 as the failing check) |
| §12 verification | Task 6 Steps 4–7 |
| §13 non-goals | no task adds formatting, `Intl`, 3D, colour, or wrap |

**Deviations from the spec, both deliberate and both corrected in Task 6 Step 2:**
1. Exit is roll-to-zero **plus fade**, unmounting on the opacity `transitionend`. The spec's transform-only exit had a real hole — a wheel already at `0` never fires `transitionend`, and a late cleanup shows a phantom leading zero.
2. `ParseCases` is an extra story beyond the spec's five, standing in for the unit test this repo has no runner for.

**Type consistency** — `parseMoney`, `restingWheels`, `reconcileWheels`, `separatorBefore`, `ParsedMoney`, `WheelState` are defined in Task 3 and used under exactly those names in Tasks 4 and 5. `--ds-money-digit` and `--ds-money-place` are written in Task 4 and read in Task 2 under the same names. Class names match one-for-one between Tasks 2 and 4.

**Placeholder scan** — no TBD, no "handle edge cases", no "similar to Task N". Every code step carries the literal content.
