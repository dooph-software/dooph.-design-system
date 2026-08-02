# RollHoverText — Design Spec

Date: 2026-08-01
Status: Approved, ready to implement
Component: `RollHoverText`

---

## 1. Purpose

A hover-triggered text animation where each character rolls in place on a shallow
3D barrel, blurring through the rotation, staggered so that many characters are
mid-roll at once. On un-hover the motion reverses from wherever it currently is.

The text **does not change**. The incoming glyph is identical to the outgoing
glyph. This is the constraint that makes the whole component cheap: every
character cell is self-sizing, nothing is measured, no layout interpolation is
required.

### Prior art / naming

There is no canonical industry name. The pattern family is "text roll" /
"rolling text" (motion-primitives `TextRoll`, Animate UI `RollingText`). The
specific variant here is: per-character `rotateX` on a two-face barrel, index-
staggered, with blur used as fake motion blur. Vercel used it on a CTA button
and never published a name for it.

### Relationship to siblings

| | trigger | state | `"use client"` |
|---|---|---|---|
| `ShimmerText` | always-on | none | no |
| `RollChangeText` | content change | `useState` + `useRef` | yes |
| `RollHoverText` | hover / `active` prop | **none** | **no** |

`RollHoverText` is architecturally a sibling of `ShimmerText`, not of
`RollChangeText`: a CSS class plus a thin render-time wrapper. Hover is browser-
owned state, so the component owns nothing.

`RollChangeText` uses a **flat** `translateY` + blur roll. `RollHoverText` uses a
**3D** `rotateX` barrel about a recessed axis. These are different keyframe families;
the existing `ds-roll-in` / `ds-roll-out` keyframes are **not** reused. Only the
blur peak and easing curve are shared, for house consistency.

---

## 2. Files touched

| File | Change |
|---|---|
| `src/components/Text/RollHoverText.tsx` | new |
| `src/components/Text/RollHoverText.stories.tsx` | new |
| `src/components/Text/index.ts` | add 2 export lines |
| `src/styles/tokens.css` | add 4 tokens after line 112 |
| `src/styles/index.css` | add `.ds-roll-hover*` block inside the same `@layer` as `.ds-shimmer-text` |
| `src/index.ts` | **no change** — `./components/Text` barrel already exported |

---

## 3. DOM structure

```
<span class="ds-roll-hover" aria-label="Deploy now" data-active?="true">
  <span aria-hidden="true" class="ds-roll-hover-word">
    <span class="ds-roll-hover-char" style="--i:0">
      <span class="ds-roll-hover-out">D</span>
      <span class="ds-roll-hover-in">D</span>
    </span>
    ... one char cell per character in the word ...
  </span>
  <span aria-hidden="true"> </span>   {/* literal space between words */}
  <span aria-hidden="true" class="ds-roll-hover-word"> ... </span>
</span>
```

### Rules

- **Split by word first, then by character.** Each word wrapper carries
  `white-space: nowrap` so a long line can never break mid-word
  ("Deplo / y now"). Word boundaries remain valid break points.
- **Spaces are rendered as plain text between word wrappers**, never as char
  cells. They are not animated.
- **Two faces per character are mandatory.** With a single face the glyph would
  rotate away and return along the same path, reading as a wobble rather than a
  roll.
- **`out` face is in normal flow** — it is what gives the char cell its natural
  glyph width. **`in` face is absolutely positioned** (`position:absolute;
  inset:0`) so it contributes zero width.
- **The `--i` index is continuous across the whole string**, not restarted per
  word. The wave must sweep across the full phrase.

---

## 4. CSS

Added to `src/styles/index.css`, inside the same `@layer` block that contains
`.ds-shimmer-text` (currently ends at line 239).

```css
/* RollHoverText — per-character 3D barrel roll on hover. Two identical faces
 * per glyph; the offscreen face is hidden by opacity + blur rather than by
 * overflow clipping, so descenders (g, y, p, j) are never cut and the
 * component is safe in inline body text. */
.ds-roll-hover {
  display: inline;
}
.ds-roll-hover-word {
  white-space: nowrap;
}
.ds-roll-hover-char {
  position: relative;
  display: inline-block;
  perspective: var(--ui-roll-hover-perspective);
}
.ds-roll-hover-out,
.ds-roll-hover-in {
  display: inline-block;
  transform-origin: 50% 50% calc(-1 * var(--ui-roll-hover-depth));
  transition:
    transform var(--ui-roll-hover-duration) cubic-bezier(0.32, 0.72, 0, 1),
    filter var(--ui-roll-hover-duration) cubic-bezier(0.32, 0.72, 0, 1),
    opacity var(--ui-roll-hover-duration) cubic-bezier(0.32, 0.72, 0, 1);
  transition-delay: calc(var(--i) * var(--ui-roll-hover-stagger));
}
.ds-roll-hover-in {
  position: absolute;
  inset: 0;
}

/* rest state */
.ds-roll-hover-out {
  transform: rotateX(0deg);
  filter: blur(0);
  opacity: 1;
}
.ds-roll-hover-in {
  transform: rotateX(90deg);
  filter: blur(var(--ui-roll-hover-blur));
  opacity: 0;
}

/* active state — self hover, ancestor .group hover, or data-active */
.ds-roll-hover:hover .ds-roll-hover-out,
.group:hover .ds-roll-hover .ds-roll-hover-out,
.ds-roll-hover[data-active="true"] .ds-roll-hover-out {
  transform: rotateX(-90deg);
  filter: blur(var(--ui-roll-hover-blur));
  opacity: 0;
}
.ds-roll-hover:hover .ds-roll-hover-in,
.group:hover .ds-roll-hover .ds-roll-hover-in,
.ds-roll-hover[data-active="true"] .ds-roll-hover-in {
  transform: rotateX(0deg);
  filter: blur(0);
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .ds-roll-hover-out,
  .ds-roll-hover-in {
    transition: none;
  }
  .ds-roll-hover-in {
    display: none;
  }
  .ds-roll-hover:hover .ds-roll-hover-out,
  .group:hover .ds-roll-hover .ds-roll-hover-out,
  .ds-roll-hover[data-active="true"] .ds-roll-hover-out {
    transform: none;
    filter: none;
    opacity: 1;
  }
}
```

### Non-negotiable CSS decisions

1. **`transition`, never `@keyframes`.** Interrupting a transition retargets from
   the current computed value. This *is* the "true reverse from current
   position" requirement. A keyframe implementation would restart from frame 0
   on interrupt and would need JS to fix.
2. **`perspective` on the char cell, not the wrapper.** Per-character perspective
   keeps depth uniform across the phrase. Scene-level perspective fans the outer
   letters and reads as a corny 3D card flip.
3. **The barrel radius lives in `transform-origin`'s z component, NOT in a
   `translateZ` on the faces.** Recessing the rotation axis behind the text makes
   each face sweep a cylinder while sitting at z:0 when face-on. This is the
   entire source of the "2.5D" quality *and* it is a correctness requirement, not
   a style choice: `translateZ(0.5em)` on the faces pushes them toward the viewer,
   where `perspective: 150px` magnifies them by 150/(150−z) ≈ **1.32×**. Measured
   in-browser, that rendered a 49.72px glyph at 65.42px inside its own 49.72px
   cell — every letter oversized and colliding with its neighbours, at rest,
   before any hover. Do not reintroduce `translateZ` here.
4. **No `overflow: hidden` anywhere.** Opacity + blur do the masking. Clipping
   would cut descenders and would require padding/margin compensation that
   breaks across font sizes.
5. **Same `transition-delay` expression in both rest and active states.** Letter
   0 leads in both directions; the wave sweeps left→right on and left→right off.
   Mirroring the order on exit makes fast in-out flicks look chaotic.

---

## 5. Tokens

Added to `src/styles/tokens.css` immediately after the shimmer block (line 112).

```css
/* Text roll on hover (RollHoverText) */
--ui-roll-hover-duration: 500ms;
--ui-roll-hover-stagger: 35ms;
--ui-roll-hover-blur: 3px;
--ui-roll-hover-depth: 0.5em;
--ui-roll-hover-perspective: 10em;
```

### Why these values

- **duration : stagger ≈ 1:14.** This ratio is the defining characteristic of
  the effect and must not drift. At stagger ≈ duration the result is a
  metronome — discrete, mechanical, one letter at a time. At ~1/14 roughly ten
  characters are mid-roll simultaneously and the eye reads a single travelling
  wave through a shared surface rather than a queue of separate events.
- **blur `3px`** matches the peak of the existing `ds-roll-in` keyframe
  (`index.css:262`), for house consistency.
- **easing `cubic-bezier(0.32, 0.72, 0, 1)`** is the existing roll-in curve
  (`RollChangeText.tsx:47`).
- **depth `0.5em` and perspective `10em`** — both in `em`, and that is a
  correctness requirement, not tidiness. `depth / perspective` is the ratio that
  governs how 3D the roll reads. With a px perspective that ratio drifts with
  font size: measured at a fixed `150px`, the mid-rotation bulge went 2.0% at
  14px → 11.0% at 72px, so the same component reads subtle in a button and
  overdone in a hero. With both in `em` the ratio pins at 0.05 and the bulge at
  2.1% from 14px through 72px, and across serif and monospace families.
- **Typography is entirely inherited.** The component sets no `font-*` property.
  Consumers change size/family/weight by styling an ancestor or the component
  itself; the barrel geometry follows automatically.

---

## 6. Component API

```ts
export interface RollHoverTextProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Text to animate. Must be a string — the component splits it per character. */
  children: string;
  /** Force the rolled state regardless of hover (touch, focus-visible, programmatic). */
  active?: boolean;
}
```

- `children` is narrowed to `string`. Unlike `RollChangeText` (which accepts
  `ReactNode` because it never inspects content), this component must split
  characters. Narrowing in the type prevents a runtime failure on
  `<BodyText>` children.
- `active` writes `data-active="true"`. When `false`/undefined the attribute is
  **omitted entirely** (not `data-active="false"`), so hover still governs.
- No `"use client"` directive. No hooks. No event handlers.
- `forwardRef<HTMLSpanElement>`, `displayName`, `cn()` for className merging —
  matching every other component in the folder.

### Typography

The component does not set font, size, weight, or color. It inherits. Consumers
compose it inside `ButtonText` / `BodyText` etc., or place it inside a `Button`
that already sets typography. Verified across 14–72px and serif/monospace: the
barrel geometry tracks the inherited font with zero rest overflow.

**Known typographic cost:** splitting text into per-character inline-blocks
breaks kerning pairs and ligatures between adjacent glyphs — "AV" will not kern,
"fi"/"ffl" will not form. This is inherent to any per-character animation, not
specific to this implementation. It is invisible at button sizes and in
sans-serif UI faces; it is worth knowing before using this on large display
type or in a serif with aggressive kerning. `letter-spacing` still applies
normally.

---

## 7. Accessibility

- Wrapper carries `aria-label={children}` — the intact, unsplit string.
- Every word wrapper carries `aria-hidden="true"`.
- Result: screen readers announce the phrase once, not character by character.
- `prefers-reduced-motion: reduce` removes all transitions and hides the `in`
  face entirely, leaving static, fully legible text. Same treatment
  `ShimmerText` receives at `index.css:232`.

---

## 8. Exports

`src/components/Text/index.ts` — append:

```ts
export { RollHoverText } from './RollHoverText';
export type { RollHoverTextProps } from './RollHoverText';
```

`src/index.ts` needs no change; `export * from './components/Text'` already
covers it.

---

## 9. Stories

`src/components/Text/RollHoverText.stories.tsx`, title
`"Primitives/RollHoverText"`, `tags: ["autodocs"]`, `layout: "centered"`,
matching `ShimmerText.stories.tsx`.

Required stories:

1. **InButton** — inside `Button`, wrapped in `ButtonText`, text "Deploy now".
   The primary use case. Button must carry `group`.
2. **InOutlineButton** — inside `OutlineButton`, same treatment.
3. **Standalone** — bare, self-hover, demonstrating it works outside a button.
4. **InBodyCopy** — inside a `<p>` of `BodyText` at constrained width,
   demonstrating no mid-word breaking and no descender clipping. Use a phrase
   with descenders, e.g. "Deploy piggyback jerky".
5. **ControlledActive** — `useState` toggle driving the `active` prop, proving
   the prop path works without hover.

---

## 10. Risks — resolved during implementation

**`filter` flattening the 3D context — NOT an issue.** Measured in Chromium: a
face at `rotateX(-45deg)` renders 75.26px wide both with `blur(3px)` and with
`filter: none`, versus 49.72px with `perspective: none`. The perspective
foreshortening survives the filter, so the faces stay leaf nodes and no extra
DOM level is needed.

**Perspective magnification — was a real bug, fixed.** See CSS decision #3. The
original `translateZ(0.5em)` formulation magnified every glyph ~1.32× at rest.
Fixed by moving the barrel radius into `transform-origin`'s z component. Verified
after the fix: rendered face width minus cell width is exactly `0.00` on every
cell at rest, while a mid-rotation face still widens (49.72 → 54.51), confirming
the depth is retained.

---

## 11. Definition of done

- [x] Tokens added to `tokens.css`
- [x] CSS block added to `index.css` inside the correct `@layer` (`utilities`)
- [x] `RollHoverText.tsx` created, no `"use client"`, no hooks
- [x] Exports appended to `Text/index.ts`
- [x] Five stories written
- [x] `npm run lint` (`tsc --noEmit`) passes clean
- [x] DOM/CSS verified in Storybook: 9 cells for "Deploy now" with continuous
      `--i` 0–8 across the word gap, `perspective: 150px` per cell, last delay
      `0.28s` (8 × 35ms), rest overflow 0.00px, `data-active` flips out→opacity 0
      and in→opacity 1
- [ ] **Not verified — requires a visible browser pane:** the animation in
      motion. Transitions do not advance while the pane is hidden (the page
      stops compositing frames), so the stagger overlap, the mid-roll reverse,
      and the subjective "is the depth tasteful" judgement are unconfirmed.
      Open Storybook at `primitives-rollhovertext--standalone` and eyeball it.
