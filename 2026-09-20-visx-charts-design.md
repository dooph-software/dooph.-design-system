# Design — visx chart family

Date: 2026-09-20
Repo: `@dooph-software/design-system`
Status: architecture approved; visual layer pending Figma; implementation pending

---

## 0. Scope

A family of cartesian charts built on visx v4 primitives, shipped in the main barrel.

**In scope (v1):** `BarChart`, `LineChart`, `AreaChart`, `BarStackChart`, `AreaStackChart`,
their composable parts, a chrome token family, and a consuming-project skill section.

**Explicitly out of v1:** series hiding / legend toggling · secondary y axis · non-cartesian
charts (donut, radial, gauge) · animation · keyboard datapoint navigation · data-table
fallback · 100%-stacked variants · sparklines.

### Governing principles

1. **The consumer owns the data and its colour.** The package decides nothing about what
   a series looks like beyond geometry. See §3.2.
2. **Opinionated defaults, total override.** Every chart works with no configuration, and
   every part can be replaced. The `DropdownMenu` shape, not a sealed widget.
3. **Minimal state.** The package holds focused index and measured dimensions. Nothing else.
4. **Token control is live.** A token a consumer overrides must change what renders, at
   paint time. A token read once into a JS number is a dead token — see §8.3.

---

## 1. Engine: hand-built from primitives

**Decision: build the engine from visx primitives. Do NOT use `@visx/xychart`.**

Rationale: xychart is cartesian-only by construction, so the first genuinely unique feature
(radial, dual-axis, a custom mark) forces a rebuild anyway. Starting custom means that day
costs nothing. It also drops `@react-spring/web`, a *required* (non-optional) peer of
`@visx/xychart` whose only payoff is the `Animated*` components — which Rule 6 forbids,
since react-spring holds durations and easings in JavaScript.

### 1.1 Dependencies to add

Runtime `dependencies`, alongside the existing Radix packages:

| Package | Used for |
| --- | --- |
| `@visx/scale` | `scaleBand`, `scaleLinear`, `scaleTime` |
| `@visx/shape` | `Bar`, `LinePath`, `AreaClosed`, `BarStack`, `AreaStack` |
| `@visx/axis` | `AxisLeft`, `AxisBottom` |
| `@visx/grid` | `GridRows`, `GridColumns` |
| `@visx/group` | `Group` (margin offset) |
| `@visx/curve` | curve factories behind `Curves` |
| `@visx/text` | `Text` (also a transitive dep of axis) |
| `@visx/tooltip` | `useTooltipInPortal` for overflow-safe positioning |
| `@visx/event` | `localPoint` |
| `@visx/responsive` | `ParentSize` |
| `@visx/clip-path` | plot-area clip (load-bearing — see §8.3) |
| `@visx/vendor` | `bisector`, `bisectLeft`, `range`, `extent` |

Not used: `@visx/xychart`, `@visx/react-spring`, `@visx/legend` (it emits plain flex
`<div>`s; ours uses `LabelText` + a real `Shapes/` primitive), `@visx/glyph` (points render
as DS shapes or plain `<circle>`).

Conditional on Figma: `@visx/gradient`, only if area fills are gradients rather than flat
alpha.

**Import discipline (visx v4):** root imports only — `import { Bar } from '@visx/shape'`.
Deep imports (`@visx/shape/lib/...`) were removed in v4. d3 utilities come from
`@visx/vendor/d3-array`, never a direct `d3-array` dependency.

---

## 2. Data shape: row-oriented

`data` lives on the chart. One shared `x` accessor. Each series supplies a `y` accessor
naming the field it reads.

```tsx
const data = [
  { month: "Jan", mrr: 100, arr: 1200 },
  { month: "Feb", mrr: 120, arr: 1400 },
];

<LineChart
  data={data}
  x={(d) => d.month}
  series={[
    { id: "mrr", label: "MRR", color: "prominent",         y: (d) => d.mrr },
    { id: "arr", label: "ARR", color: model.providerColor, y: (d) => d.arr },
  ]}
/>
```

**Why rows rather than per-series arrays.** Data arrives as rows from SQL and APIs. A
series-oriented contract would force a pivot at every call site — and that pivot allocates
fresh arrays on every render unless the consumer remembers `useMemo`, which then
invalidates scale memoisation. Rows also make stacking and cross-series tooltips fall out
for free, and they collapse nearest-datum search from per-series to a single lookup (§6.1).

**Accepted cost.** Sparse or irregular series must be padded with holes, and series with
genuinely different x values cannot be expressed. A scatter chart would be the first real
case for a second shape; it is not in v1.

---

## 3. Public type surface

All dot-accessible consts live in `src/components/Chart/constants.ts` with **no**
`"use client"`, per the house rule — a const declared in a client module is a client
reference, not a value, and RSC code could not read `ChartMark.bar`.

### 3.1 Marks

```ts
export const ChartMark = {
  bar: "bar",
  line: "line",
  area: "area",
} as const;
export type ChartMark = (typeof ChartMark)[keyof typeof ChartMark];
```

Named `mark`, not `presentation` or `type`. "Mark" is the Grammar-of-Graphics term for a
visual encoding (Vega, ggplot, Observable Plot), and Rule 1 already exempts *"geometry
props with established Radix/industry names"* — the same carve-out that gave `ShapeButton`
its `shape` and `SheetContent` its `side`.

### 3.2 Series

```ts
type SeriesBase<TDatum> = {
  /** Stable identity. Also the default legend label. */
  id: string;
  label?: string;
  /** REQUIRED. A DS token name or any CSS colour. Resolved by resolveDsColor. */
  color: DsColor;
  /** Which field this series reads out of a row. */
  y: (d: TDatum) => number;
};

/* Discriminated on `mark`, so per-mark options are type-checked:
 * `curve` on a bar series is a compile error. Same pattern as
 * SliderPaintProps and CalendarProps — and unlike those, the
 * discriminant here is a real literal tag, which is why it works. */
type SeriesMark =
  | { mark?: typeof ChartMark.bar;  radius?: number }
  | { mark: typeof ChartMark.line;  curve?: CurveValue; dashed?: boolean; points?: boolean }
  | { mark: typeof ChartMark.area;  curve?: CurveValue; fillOpacity?: number };

export type DataSeries<TDatum> = SeriesBase<TDatum> & SeriesMark;
```

`color` is **required**, and it is the existing `DsColor` (`DsColorToken | (string & {})`)
resolved by the existing `resolveDsColor`. So `color="prominent"` and
`color={model.providerColor}` both work, consumer token overrides still resolve at paint
time, and no new colour machinery is introduced.

**The package ships no categorical, sequential, or diverging palette.** A design system has
no business deciding what colour someone's data is. It owns chart *chrome* only (§8.1) —
that is UI, not data. This is the same boundary the package already draws by shipping no
`line-height` and by making `Avatar` take logo content as children.

Because `mark` is per-series, a combo chart (revenue bars + growth line) needs no new
component and no interface change — only a second y axis, which is deferred.

In `BarStackChart` / `AreaStackChart`, stacking applies to the stackable marks; a `line`
series in a stacked chart **overlays** rather than participating in the stack.

### 3.3 Curves

```ts
export const Curves = {
  linear: curveLinear,       monotone: curveMonotoneX,
  step: curveStep,           stepBefore: curveStepBefore,
  stepAfter: curveStepAfter,
  natural: curveNatural,     basis: curveBasis,
} as const satisfies Record<string, CurveFactory>;

/** Open value: d3 curves are tunable (curveCatmullRom.alpha(0.5)), so the set can't close. */
export type CurveValue = (typeof Curves)[keyof typeof Curves] | CurveFactory;
```

There is no `stepped` flag. "Stepped" is `Curves.step` / `.stepBefore` / `.stepAfter`.

### 3.4 Size

`ChartSize` earns a closed enum by the Rule 1 test: it selects a **bundle** whose members
are tuned together and are not derivable from one another — height, tick density, and type
role.

```ts
export const ChartSize = { sm: "sm", md: "md", lg: "lg" } as const;
export type ChartSize = (typeof ChartSize)[keyof typeof ChartSize];

const SIZE_BUNDLE = {
  sm: { height: "var(--ui-height-chart-sm)", numTicks: 3, tickText: TextVariant.label },
  md: { height: "var(--ui-height-chart-md)", numTicks: 5, tickText: TextVariant.label },
  lg: { height: "var(--ui-height-chart-lg)", numTicks: 8, tickText: TextVariant.body },
} satisfies Record<ChartSize, { height: string; numTicks: number; tickText: TextVariant }>;
```

### 3.5 Axis side

```ts
export const ChartAxisSide = {
  left: "left", right: "right", top: "top", bottom: "bottom",
} as const;
export type ChartAxisSide = (typeof ChartAxisSide)[keyof typeof ChartAxisSide];
```

Prop name is `side`, matching the `SheetContent` precedent.

### 3.6 Focus payload

The contract handed to the tooltip slot and to any consumer-supplied replacement.

```ts
export type ChartPoint<TDatum> = {
  series: DataSeries<TDatum>;
  value: number;
  /** Pixel position within the plot area. */
  cx: number;
  cy: number;
};

export type ChartFocus<TDatum> = {
  index: number;
  datum: TDatum;
  x: XValue;
  /** Every series, in series order. */
  points: ChartPoint<TDatum>[];
};
```

Since series hiding is out of v1, `points` is always every series — there is no "visible
series" concept anywhere in the API.

### 3.7 Formatting

```ts
formatX?: (value: XValue, index: number) => string;
formatY?: (value: number) => string;
```

One formatter feeds both tick labels and tooltip values. When omitted, fall through to the
d3 scale's own default formatter — not `String(value)` — since d3 already formats numbers
and dates sensibly.

The package ships **no locale logic**, matching the `RollingDigitsText` precedent of taking
a pre-formatted string. Where an axis and a tooltip want different precision (`$1.2k` vs
`$1,234`), the tooltip slot is fully replaceable; that is the escape hatch, rather than a
third prop.

---

## 4. Component architecture

Composable parts plus thin presets, mirroring `SliderBase` → three public Sliders.

### 4.1 The parts

| Component | DOM | Notes |
| --- | --- | --- |
| `Chart` | wrapper `<div>` + `<svg>` | Root. Owns dimensions, scales, focus. Provides `ChartContext`. |
| `ChartGrid` | SVG | `GridRows` / `GridColumns` |
| `ChartAxis` | SVG + HTML label | `side` prop; tick marks/labels in SVG, axis label in the wrapper grid (§7.1) |
| `ChartSeries` | SVG | Dispatches per series on `mark` |
| `ChartCrosshair` | SVG | Dashed vertical line at the focused x |
| `ChartTooltip` | HTML | The slot. Children receive `ChartFocus<TDatum>`. |
| `ChartTooltipContent` | HTML | Prerolled default: `Shapes/` glyph + `LabelText` + `MonoText` per series |
| `ChartLegend` | HTML | Display-only. Exported standalone — takes `series`, usable outside the chart. |
| `ChartLegendItem` | HTML | Swatch + label |

### 4.2 Composition

```tsx
/* Out of the box */
<LineChart data={data} x={(d) => d.month} series={series} />

/* Composed — any part replaceable */
<Chart data={data} x={(d) => d.month} series={series}>
  <ChartGrid />
  <ChartAxis side={ChartAxisSide.left} />
  <ChartAxis side={ChartAxisSide.bottom} label="Month" />
  <ChartSeries />
  <ChartCrosshair />
  <ChartTooltip>
    {(focus) => <MyThing points={focus.points} />}
  </ChartTooltip>
</Chart>
<ChartLegend series={series} />
```

Defaults on: grid, both axes, series, crosshair, tooltip. Default off: legend (opt in, or
render `ChartLegend` yourself anywhere).

Exports are **flat and alphabetised in one block at file end**, no `Chart.Axis` dot
notation — matching `Table` and `DropdownMenu`.

### 4.3 The five presets

Each is a thin `forwardRef` over the private base that sets a default `mark` and stacking
mode, exactly as `SliderContinuous` / `SliderStepped` set the private `showSteps` flag:

`BarChart` · `LineChart` · `AreaChart` · `BarStackChart` · `AreaStackChart`

A series may override its own `mark` within any preset.

---

## 5. State model

| State | Owner | Why |
| --- | --- | --- |
| Focused index | **Chart** | Ephemeral interaction state |
| Measured dimensions | **Chart** | `ResizeObserver` output |
| Scales | *derived* | Computed from data + dimensions; not state |
| Data | **Consumer** | Passed in; the package holds no copy |

That is the complete list.

**The accessor is the state boundary.** An accessor is a function the consumer closes over
their own shape, so the package never names a field and never learns about their context,
store, or query client. Same philosophy as `renderDay` receiving `CalendarDayRenderProps`:
the package computes, the consumer shapes.

### 5.1 Memoisation rule (load-bearing)

An inline accessor — `y={(d) => d.mrr}` — is a **new function identity on every render**.
Derived work must therefore be keyed on `data` and the series `id` list, **never on
accessor identity**:

```ts
const seriesKey = series.map((s) => s.id).join(" ");
const yDomain = useMemo(() => computeDomain(data, series), [data, seriesKey]);
```

Getting this wrong recomputes every scale on every render and is miserable to retrofit.

---

## 6. Interaction

### 6.1 Nearest datum

Ported from `@visx/xychart`'s `findNearestDatumSingleDimension`, which branches on scale
type. This branching is the only part genuinely worth porting.

```
pointer → localPoint(svg, event) → x pixel

if xScale has .invert()            // time, linear
    value  = xScale.invert(px)
    index  = bisector(x).left(data, value)
    pick the closer of data[index - 1] and data[index]

else if xScale has .step()         // band (bars)
    rangePoints = range(sortedRange[0], sortedRange[1], xScale.step())
    domainIndex = bisectLeft(rangePoints, px)
    // reverse the domain when the range runs backwards (y axes)
    index = data.findIndex(d => String(x(d)) === String(sortedDomain[domainIndex - 1]))

else
    bail
```

**Do NOT port xychart's cross-series step.** It exists because each xychart series owns its
own data array. Row-oriented data means one search yields the row, and every series' value
at that index is immediately known:

```ts
const index = findNearestIndex(xScale, x, data, pointerX);
const row = data[index];
const focus: ChartFocus<TDatum> = {
  index, datum: row, x: x(row),
  points: series.map((s) => ({
    series: s,
    value: s.y(row),
    cx: scaledX(row) + bandwidth / 2,
    cy: yScale(s.y(row)),
  })),
};
```

That `points` array **is** the unified tooltip.

Two details that are easy to lose:

- **`+ bandwidth / 2`.** Without it, a bar's crosshair and glyph sit on the band's left
  edge instead of its centre. `bandwidth` is `0` for continuous scales, so one expression
  serves both.
- **xychart has a real bug in the step we are not porting.** It computes
  `Math.sqrt((dx ?? Infinity ** 2) + (dy ?? Infinity ** 2))` — `**` binds tighter than
  `??`, so the squaring lands on the *fallback*, not the value. That is Manhattan distance,
  not the intended Euclidean. Noted so nobody "restores" it later.

### 6.2 Crosshair

A dashed vertical line at the focused x, snapped to the datum (`xScale(x(row)) + bandwidth/2`).

Rendered **inside the plot SVG**, not portaled. xychart portals it because its tooltip
machinery already owns a portal; we have a `position: relative` wrapper and a clip path, so
an ordinary `<line>` inside the plot group is simpler and clips correctly.

Dash pattern, width and colour: **TBD — pending Figma**. Token-backed (§8.1).

### 6.3 Tooltip

One tooltip for all series, never one per series. `ChartTooltipContent` renders one row per
series: a `Shapes/` glyph in the series colour (matching the legend swatch), a `LabelText`
name, and a `MonoText` value through `formatY`.

Positioning uses `useTooltipInPortal({ detectBounds: true })` so it escapes overflow and
scroll containers and flips near edges. `containerRef` is a **callback ref** in v4 — attach
with `ref={containerRef}`, not `.current`.

Surface styling reuses the tooltip token family (`ds-tooltip-*`, `--ui-color-tooltip-*`).
The Radix `Tooltip` component itself cannot be reused — it is hover-on-trigger and cannot
follow a cursor — so we reuse its **paint**, not its behaviour.

---

## 7. Text and typography

### 7.1 Only tick labels are trapped in the SVG

The root `<svg>` needs a wrapper `<div>` regardless (visx charts expose no className on it,
and we need one anyway for the tooltip's positioning context). Making that wrapper a grid
lets axis **labels** render as HTML:

```css
.ds-chart {
  display: grid;
  grid-template-areas: "ylabel plot" ".  xlabel";
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr auto;
}
.ds-chart-label-y { writing-mode: vertical-rl; transform: rotate(180deg); }
```

That buys real `LabelText` for axis labels — full prop surface, `tabular`, `axes`, native
CSS wrapping, selectable text — instead of `verticalAnchor`/`dy` arithmetic.

| Surface | DOM | Renders as |
| --- | --- | --- |
| Axis labels (x, y) | HTML | `LabelText` |
| Legend labels | HTML | `LabelText` |
| Tooltip label / value | HTML | `LabelText` + `MonoText` |
| Empty / error state | HTML | `BodyText` |
| **Tick labels** | SVG `<text>` | `text-style-*` class + `fill-*` utility |
| In-chart value labels | SVG `<text>` | same |

### 7.2 Tick labels use the class, not the component

`@visx/text` renders `<text {...textProps}>`, so `fontFamily`, `fontSize`, `fontWeight` and
`fill` land as **presentation attributes** — which sit below author CSS in the cascade, so
any class beats them. (Verified in-browser: a `fill-primary` class overrides `fill="red"`;
inline `style` beats the class.)

`text-style-label` is literally what `LabelText` applies — `TEXT_VARIANT_CLASS` is the same
map `BaseText` reads — so this is one source of truth, not a parallel one. `BaseText` adds
polymorphism and inline prop overrides; a tick needs neither, since the axis supplies
position.

**The one substitution: SVG text is painted by `fill`, not `color`.** So
`fill-chart-tick`, never `text-chart-tick`.

One internal helper owns the whole decision:

```ts
/** The one place that knows in-SVG text takes its paint from `fill`, not `color`. */
const chartTextClass = (variant: TextVariant, paint: string) =>
  cn(TEXT_VARIANT_CLASS[variant], paint);
```

The knob is the **existing** `TextVariant` const — no new enum:
`<BarChart tickText={TextVariant.mono} />`.

**Caveat, narrow:** `@visx/text` measures for word-wrapping off the `fontSize` *prop*, and
that path only runs when `width` or `scaleToFit` is set (`useText` line 59). Ticks never
wrap, so this is inert. If an in-SVG label ever wraps, pass `fontSize` alongside the class.

Do not use `tickComponent` to inject `BaseText as="text"`. It receives `verticalAnchor` and
`dy` that only mean something to `@visx/text`, so it would mean re-implementing its
positioning for no typographic gain.

---

## 8. Token contract

### 8.1 New `--ui-*` tokens

Chrome only. Colours first, because `sync-theme.mjs` maps `--ui-color-*` → `--color-*`,
which makes Tailwind generate `fill-*` and `stroke-*` **for free** — verified by running the
real CLI against `src/styles/index.css`:

```css
--ui-color-chart-tick: var(--ui-color-text-tertiary);
--ui-color-chart-grid: var(--ui-color-border-primary);
--ui-color-chart-axis: var(--ui-color-border-secondary);
--ui-color-chart-crosshair: var(--ui-color-text-tertiary);
```

→ `fill-chart-tick`, `stroke-chart-grid`, `stroke-chart-axis`, `stroke-chart-crosshair`,
with `.dark` handled by the aliases. No hand-written CSS, no `.dark` block.

Non-colour tokens (values **TBD — pending Figma**), each needing an `EXCLUDED` entry in
`sync-theme.mjs` plus a `ds-*` helper or `@layer utilities` class:

```
--ui-height-chart-sm / -md / -lg
--ui-radius-chart-bar
--ui-width-chart-grid            (grid stroke width)
--ui-dash-chart-grid             (grid dash pattern)
--ui-width-chart-axis
--ui-length-chart-tick
--ui-width-chart-line            (line series stroke width)
--ui-size-chart-point            (focused point glyph)
--ui-size-chart-legend-swatch
--ui-opacity-chart-area          (flat alpha for area fills)
--ui-spacing-chart-bar-gap
```

Run `npm run sync-tokens` after adding any of these; it regenerates the `@theme inline`
block in `index.css` **and** the `theme.css` consumer preset in one pass.

### 8.2 Motion family, reserved now

Rule 6 says every animated component owns a `--ui-<component>-*` family. v1 is static, but
reserving the names now stops v2 inventing them ad hoc:

```
--ui-chart-duration
--ui-chart-ease
```

Future animation is CSS-native and needs no JS timing. Verified in-browser that all four
mechanisms register real transitions:

| Motion | Mechanism |
| --- | --- |
| Bar grow/shrink | `transition: height, y` (SVG2 geometry properties are CSS properties) |
| Point move/resize | `transition: cx, cy, r` |
| Line/area path morph | `@property --ds-chart-t` + rAF sampling writes `d` (the `SidebarWithHoverIcon` pattern, with `d3-interpolate-path` for the two-path case) |
| Line draw-on | `transition: stroke-dashoffset` |

`@visx/react-spring` and the `Animated*` components are never used — they hold timing in
JavaScript.

### 8.3 Bar radius: keeping the token live

`rx` **is** a live CSS property on `<rect>` (browser-verified: attribute, inline style and
class all resolve `var()`), so `--ui-radius-chart-bar` genuinely controls rendering.

**But `rx` rounds all four corners.** Top-only rounding normally means a `<path>` with the
radius baked into `d` as a JS number — which makes the token dead, exactly the way the
spinner size tokens were dead for a release.

**Resolution: overdraw the bar below the baseline and clip the plot area.** All four corners
round via the live `rx`; the bottom two fall outside the clip. The plot clip is wanted
anyway so marks cannot bleed into the axes.

**This rules out `@visx/shape`'s `BarRounded`**, which bakes the radius into a path. Do not
substitute it later.

If Figma specifies all-corner rounding, a plain `<rect rx>` suffices and the clip is
optional.

---

## 9. Module boundaries

```
src/components/Chart/
  constants.ts          ← no "use client": ChartMark, Curves, ChartSize, ChartAxisSide
  scales.ts             ← no "use client": pure scale/domain helpers
  nearestDatum.ts       ← no "use client": pure; the §6.1 algorithm
  Chart.tsx             ← "use client": useState + useRef + ResizeObserver
  ChartAxis.tsx         ← "use client": consumes ChartContext
  ChartGrid.tsx         ← "use client": consumes ChartContext
  ChartSeries.tsx       ← "use client": consumes ChartContext
  ChartCrosshair.tsx    ← "use client": consumes ChartContext
  ChartTooltip.tsx      ← "use client": useTooltipInPortal
  ChartLegend.tsx       ← neutral: no hooks, display-only
  presets.tsx           ← "use client": the five preset components
  index.ts              ← components → constants → types
  Chart.stories.tsx
```

Consts and pure helpers stay server-safe so RSC code can read `ChartMark.bar`. A component
that calls `useContext` on a client-provided context belongs in the client graph; only
`ChartLegend`, which takes `series` as a prop and holds no hooks, is neutral.

Re-export from `src/index.ts` near its family, per the existing grouping convention.

---

## 10. Accessibility (v1 scope)

Deliberately minimal, by decision. **No** keyboard datapoint navigation and **no**
data-table fallback in v1.

Included because it is three lines and no design effort: `role="img"` and a consumer-supplied
`aria-label` on the plot `<svg>`, and `aria-hidden` on purely decorative chrome (grid,
crosshair). Nothing here precludes adding navigation later — marks are not made
focus-hostile.

---

## 11. Pending Figma

Blocking the visual layer only; none of the architecture above depends on them.

- Bar corner radius value, **and whether rounding is top-only or all-corner** (§8.3 — this
  picks the implementation, not just the look)
- Bar gap / padding
- Grid density, stroke width, dash pattern
- Axis stroke width, tick length
- Area fill treatment: flat alpha vs gradient (decides whether `@visx/gradient` is a dep)
- Line stroke width; focused-point glyph size and shape
- Legend swatch geometry and which `Shapes/` primitive it uses
- Chart heights per `ChartSize`
- Crosshair dash, width, colour
- Empty, loading and error states
- Dark-mode review of all of the above

---

## 12. Verification plan

This repo has a scar precisely here: the four `--ui-size-spinner-*` tokens existed, were
documented as the contract, and did nothing, because the SVG rendered a JS table instead.
Charts must not repeat it.

For **every** token in §8.1, a Storybook-backed check that overriding it changes computed
style — by reading `getComputedStyle`, not by eye. A class that never generated and a token
that happens to resolve to the same value look identical on screen.

Specific traps to assert against:

1. `--ui-radius-chart-bar` moves the rendered `rx` (the §8.3 failure mode).
2. `--ui-color-chart-tick` moves the tick label's computed `fill` — and that `fill-*`, not
   `text-*`, is what does it.
3. `text-style-*` on a tick beats visx's presentation attributes (`fontFamily` etc.).
4. Series `color` reaches the mark and survives a `.dark` toggle.
5. Scales do not recompute when a parent re-renders with inline accessors (§5.1).

Per the contribution guide, **at least one story per prop where the override contradicts
the role default** — prop combinations that merely match the default cannot catch a dead
prop, which is exactly how two dead text props shipped.

---

## 13. Release

Purely additive: no existing export changes, no token renames, no behaviour changes.

**Minor — 5.5.** No migration skill (those are for majors only). The consuming-project skill
`skills/dooph-design-system-usage/` gains a charts section covering `DataSeries`, the
composable parts, and the chrome token family.
