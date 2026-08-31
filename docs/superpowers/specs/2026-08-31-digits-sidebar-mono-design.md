# Design — RollingDigitsText rebuild · SidebarWithHoverIcon rebuild · Mono + tabular type

Date: 2026-08-31
Repo: `@dooph-software/design-system`
Status: decisions approved; implementation pending

---

## 1. RollingDigitsText

### Current state (audit)

Kept as-is:

- `rollingDigitsModel.ts` — pure, no React. Place-value keying (not string index) is the
  correct primitive and stays.
- The wheel DOM: `position:relative` host + hidden in-flow `0` spacer + absolutely
  positioned `inset:0` clip. The spacer supplies BOTH width and baseline; this is the only
  arrangement that keeps a clipped inline-block on the text baseline. Stays.
- Roll as a CSS **transition** on `transform`, never a keyframe. Stays.

Broken / replaced:

- **Dead CSS.** The money→digits rename changed three class names in TSX
  (`ds-rolling-digits`, `-figure`, `-decimals`) but `index.css` still defines only
  `.ds-rolling-money`, `-figure`, `-cents`. The root lost `inline-block`; the figure lost
  `inline-flex` / `align-items:baseline` / `white-space:nowrap` / `tabular-nums`; the small
  decimals wrapper is entirely unstyled. Primary cause of the reported jumping.
- **Instant width on enter/exit.** An entering wheel takes a full digit of width in one
  frame and only then fades; an exiting wheel holds full width for the whole fade and snaps
  to zero. Separators pop with no animation at all.
- **Four racing mechanisms** for one job in `useWheels`: a double-rAF reveal, a
  `transitionend`, a 600ms wall-clock backstop, and a deliberately stale closure defended
  by an `eslint-disable`.
- **Key collision.** `${scope}:${place}` means a place that exits and immediately returns
  reuses the same DOM node and cannot replay an entrance.
- `separatorBefore()` — 12 lines of live-wheel counting, replaced by one expression.

### Target design

**Fixed `1ch` slots.** Every animated unit owns an explicit width and animates it.

- wheel: `width: 1ch` (the tabular figure advance)
- separator: `width: var(--ui-rolling-digits-separator-width)` (default `0.3em`)

Enter and exit are two CSS keyframes shared by both element types. The implicit
`to` / `from` keyframe resolves against each element's own computed width, so one pair
covers the digit and the comma:

```css
@keyframes ds-rolling-digits-in  { from { width: 0; opacity: 0; } }
@keyframes ds-rolling-digits-out { to   { width: 0; opacity: 0; } }
```

The clip stays a constant `1ch` anchored `left:0` and overflows the shrinking host, so a
glyph is never horizontally sliced — it sits at its final position while its neighbours
slide past. Opacity is shorter than width, so the overlap happens while the glyph is
mostly transparent.

**Separator ownership moves onto the wheel.** A wheel at place P renders a TRAILING
separator iff `P > 0 && P % 3 === 0`. This is a pure function of place, independent of
every other wheel, and it deletes `separatorBefore()` entirely. More importantly it makes
the comma part of its wheel's own lifecycle: `$1,000 → $999` removes place 3 and its comma
collapses with it instead of popping.

**Entry needs no JavaScript.** A wheel is entering iff it just mounted, so a CSS animation
on `[data-entering]` runs once at mount and is never restarted. The attribute is never
removed — a finished animation leaves the element at its natural style, and re-rendering an
identical attribute does not restart it. This deletes the double-rAF entirely.

**Exit is one `animationend`.** `[data-exiting]` starts the out animation with
`fill-mode: forwards`; `onAnimationEnd` drops the wheel from state. No timers: a wheel
stranded by a throttled background tab is zero-width and transparent, and
`reconcileWheels` drops already-exiting wheels on the next value change, so it self-heals.
Under `prefers-reduced-motion` the durations collapse to `1ms` rather than `none`, so the
event still fires.

**Reconcile moves into render.** React's documented "adjusting state when props change"
pattern replaces the effect:

```ts
if (prevJoined.current !== joined) {
  prevJoined.current = joined;
  setWheels((cur) => reconcileWheels(cur, joined.split(""), epoch.current++));
}
```

The updater form always sees current state, which removes the stale-closure hazard and its
`eslint-disable`, and there is no longer a frame between the value changing and the wheels
reconciling — which also lets `hasDecimals` become a plain `wheels.length > 0` instead of
the union hack it is today.

**Keys.** Live wheels key `p{place}` (stable, preserves roll identity); exiting wheels key
`x{place}-{epoch}` (unique, so a returning place mounts a genuinely new node and animates
in).

### Token rename

`--ui-rolling-money-*` → `--ui-rolling-digits-*`, and `-cents-*` → `-decimals-*`. New:
`--ui-rolling-digits-separator-width: 0.3em`. `EXCLUDED` in `sync-theme.mjs` updated to
match. Breaking for anyone who overrode these in 5.0.0; the component rename already broke
that surface.

### Non-goals

- Prefix/suffix are still plain text and swap without animation (`1.2M → 62.3k` snaps its
  suffix). Out of scope for this pass; noted, not silently worked around.
- Still US format only. `.` decimal, `,` thousands.

### Risk to verify in the browser

`1ch` must equal the tabular figure advance for the loaded face. Verified by measuring a
rendered story, not by eye. If it drifts, the digit column is centred inside its slot so
the error is symmetric rather than cumulative.

---

## 2. SidebarWithHoverIcon

### Current state (audit)

- The morph math is right: collinear control points give a straight rail, `t` lerps to the
  bulge. Keep the parametrisation.
- **Motion amplitude is ~1.9 of 24 user units — about 1.1px at the 14px default.** No
  scheduler can make a one-pixel move look fluid; this is the "3-frame pixel art" report.
- It attaches six listeners (including duplicate `pointerenter` + `mouseenter`) to
  `svg.closest("button, a, [role='button']")` — a component reaching outside itself, which
  the architecture skill names as an anti-pattern.
- Hardcoded `220ms` + hand-rolled `easeOutCubic` + manual rAF scheduling + a `matchMedia`
  reduced-motion check. None of it tokenised.
- No side traversal at all.

### Target design

**CSS owns motion, JS owns geometry.** Two scalars are transitioned as registered custom
properties on the `<path>`; a rAF loop samples them and writes `d`.

```css
@property --ds-sidebar-rail-s { syntax: "<number>"; inherits: false; initial-value: 0; }
@property --ds-sidebar-rail-h { syntax: "<number>"; inherits: false; initial-value: 0; }
```

- `s` in [0,1] — side. 0 = left, 1 = right. Transitions on `--ui-sidebar-icon-duration`.
- `h` in [0,1] — hover. Transitions on `--ui-sidebar-icon-hover-duration` (snappier).

Geometry, with `PULL = 1` and `BULGE = 2.5` so `h = 1` lands exactly on the existing static
`SidebarLeftHoverIcon` / `SidebarRightHoverIcon` poses:

```
dir  = lerp(-1, +1, s)               // outward direction; 0 at mid-traverse
end  = lerp(9, 15, s) + dir * PULL  * h
ctrl = end               - dir * BULGE * h
d    = M{end} 8 C{ctrl} 10.5 {ctrl} 13.5 {end} 16
```

The side-swap-while-hovered case falls out of the math rather than needing a special case:
at `s = 0.5`, `dir = 0`, so both `end` and `ctrl` are 12 — the chevron flattens as it
crosses the centre of the frame and re-forms pointing the other way on arrival.

This deletes `lerp`, `easeOutCubic`, `prefersReducedMotion`, the duration constant, the
manual scheduling and all six listeners. Easing, duration and reduced-motion all become
CSS, which means they are tokens and a consumer can retune them. Interruption is handled by
the transition natively (it retargets from wherever the value currently sits). If
`@property` is unsupported the value jumps to target, the loop writes the final `d` once
and stops — a clean degrade to instant.

The rAF loop is self-terminating: it stops once both sampled values equal their targets.
`getComputedStyle` twice per frame for one icon is acceptable; documented as the reason not
to render hundreds of these.

**API.** `hovered?: boolean` (controlled) replaces the ancestor sniffing. Consumers wire
`onPointerEnter` / `onPointerLeave` on their own button; the stories show it. `side` stays
`SidebarIconSide`. First render writes the resting `d` in JSX from a ref that is set once,
so SSR output is correct and React never clobbers a tween mid-flight.

### New tokens

```
--ui-sidebar-icon-duration:       260ms   /* rail traverse */
--ui-sidebar-icon-hover-duration: 180ms   /* line -> chevron */
--ui-sidebar-icon-ease:           cubic-bezier(0.32, 0.72, 0, 1)
```

### Open risk

If the 1.1px amplitude still reads as too subtle at 14–16px after the rebuild, that is
geometry, not code — the fix is a bigger hover pose, which would desync from the static
hover icons. Flag to the user rather than silently diverging.

---

## 3. Mono role + tabular figures

### Mono as a full role

Mirrors every other role exactly; `MonoText` is `BaseText` with `variant` fixed, built by
the same `createRoleText` factory.

Tokens:

```
--ui-font-mono:     "Google Sans Code", ui-monospace, SFMono-Regular, Menlo, monospace;
--ui-text-mono:     var(--ui-text-body);      /* 14px  — matches ButtonText */
--ui-weight-mono:   var(--ui-weight-button);  /* 500   — matches ButtonText */
--ui-font-var-mono: "MONO" 1;                 /* Google Sans Code mono axis */
```

`.text-style-mono` joins the other role classes in `@layer components` (family,
`font-optical-sizing: auto`, size, weight, `font-variation-settings`).

Surface: `TextVariant.mono`, `Fonts.mono`, `FontSizes.mono`, `TEXT_VARIANT_CLASS.mono`,
`ROLE_AXIS_TOKEN.mono`, `MonoText` / `MonoTextProps`.

`sync-theme.mjs`: the `--ui-font-<role>` regex gains `mono` so `--font-mono` is emitted;
`ui-weight-mono` and `ui-font-var-mono` join `EXCLUDED` alongside their peers.

Storybook `preview-head.html` gains Google Sans Code with the MONO axis.

### Tabular figures

`font-variant-numeric: tabular-nums` makes every digit share one advance width, so a
number does not reflow when its digits change. That is exactly the property the rolling
digits need, and it is an OpenType feature (`tnum`) present in essentially every modern
text face; a face without it degrades to proportional figures with no error.

- `tabular?: boolean` joins `TextStyleProps`, emitted by `buildTextStyle` as an inline
  `fontVariantNumeric` — inline, like every other BaseText typography prop, per the
  architecture rule that design-value props must not be classes.
- `RollingDigitsText` sets it in its own CSS unconditionally and exposes no opt-out: the
  `1ch` slot geometry is only correct with tabular figures.

---

## 4. Incidental

`src/components/Icons/KeyIcon.tsx` currently exports `HideMoneyIcon` (a duplicate of the
existing eye icon) and will hard-fail `npm run build` at the
`generate-icon-exports` step, which rejects any `*Icon.tsx` that does not export a const
matching its filename. Replaced with an actual key glyph exporting `KeyIcon`.
