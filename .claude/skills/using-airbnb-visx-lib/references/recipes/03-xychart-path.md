# The XYChart Path (Path B, opinionated) — v4.0.0

`@visx/xychart` is the batteries-included high-level chart system. You declare scales as **config
objects** and drop in series/axes/grid/tooltip; the library manages scales, data registration, events,
crosshairs, theming, and (optionally) animation. Code below is faithful to the `visx-xychart` sandbox
(verified at tag).

> Do NOT confuse `@visx/xychart` (v4.0.0, in scope) with `@visx/chart` (4.1, OUT of scope).

## Mental model
- `<XYChart>` is the root. If no `<DataProvider>` is in context, **XYChart wraps itself in one** and
  you MUST pass `xScale` + `yScale` config (else it warns and renders `null`).
- **Scales are passed as CONFIG objects, not constructed scales** (verified
  `ExampleControls.tsx:16`): `xScale={{ type: 'band', paddingInner: 0.3 }}`, `yScale={{ type: 'linear' }}`.
  The config is a `@visx/scale` ScaleConfig (`type: 'band' | 'linear' | 'time' | 'log' | ...` plus
  that scale's options).
- **Series self-register their data** into `DataContext`. Axes/grid read from context. (v4: the old
  internal `withRegisteredData` HOC was removed; series register directly.)
- **`BaseAxis` renders `null` until ≥1 series with non-empty `data` has registered** (v4 behavior — no
  more bogus `[0,1]` ticks on first paint). If you need a visible axis pre-data, render a plain
  `@visx/axis` `<Axis>` with your own scale as a placeholder.

## Minimal working example

```tsx
import { XYChart, Axis, Grid, AnimatedAxis, BarSeries, LineSeries, Tooltip, lightTheme } from '@visx/xychart';

const data1 = [{ x: '2020-01-01', y: 50 }, { x: '2020-01-02', y: 10 }, { x: '2020-01-03', y: 20 }];
const accessors = { xAccessor: (d) => d.x, yAccessor: (d) => d.y };

function Chart() {
  return (
    <XYChart
      theme={lightTheme}
      xScale={{ type: 'band', paddingInner: 0.3 }}
      yScale={{ type: 'linear' }}
      width={500}
      height={300}
    >
      <Grid columns={false} numTicks={4} />
      <BarSeries dataKey="Series A" data={data1} {...accessors} />
      <Axis orientation="bottom" />
      <Axis orientation="left" numTicks={4} />
      <Tooltip
        snapTooltipToDatumX
        snapTooltipToDatumY
        showVerticalCrosshair
        showSeriesGlyphs
        renderTooltip={({ tooltipData, colorScale }) => (
          <div>
            <strong>{tooltipData.nearestDatum.key}</strong>
            {': '}
            {accessors.yAccessor(tooltipData.nearestDatum.datum)}
          </div>
        )}
      />
    </XYChart>
  );
}
```

## Series — the common prop signature (verified `src/types/series.ts`)

Every series (`BarSeries`, `LineSeries`, `AreaSeries`, `GlyphSeries`, and stack/group variants) takes:
```ts
{
  dataKey: string;            // REQUIRED, must be unique per series
  data: Datum[];              // REQUIRED
  xAccessor: (d) => xValue;   // REQUIRED
  yAccessor: (d) => yValue;   // REQUIRED
  onPointerMove?/onPointerUp?/onPointerDown?/onPointerOut?, onFocus?/onBlur?,
  enableEvents?: boolean;     // default true
  // series-specific extras, e.g. LineSeries `curve`, BarSeries `colorAccessor`
}
```
Available series: `BarSeries`, `LineSeries`, `AreaSeries`, `GlyphSeries`, `BarStack`, `BarGroup`,
`AreaStack` — each with an `Animated*` twin (`AnimatedBarSeries`, `AnimatedLineSeries`, ...).

## The full export surface (verified `src/index.ts`)
- **Container:** `XYChart`
- **Axes/grid:** `Axis`, `AnimatedAxis`, `Grid`, `AnimatedGrid` (rows/columns are PROPS — no separate
  `AnimatedGridRows/Columns` here).
- **Series:** `AreaSeries`, `AreaStack`, `BarGroup`, `BarSeries`, `BarStack`, `GlyphSeries`,
  `LineSeries` + all `Animated*` variants.
- **Tooltip:** `Tooltip`, `TooltipProvider`, `TooltipContext`.
- **Annotation:** `Annotation`, `AnimatedAnnotation`, `AnnotationLabel`, `AnnotationConnector`,
  `AnnotationCircleSubject`, `AnnotationLineSubject`.
- **Providers/contexts:** `DataProvider`/`DataContext`, `EventEmitterProvider`/`EventEmitterContext`,
  `ThemeProvider`/`ThemeContext`, `TooltipProvider`/`TooltipContext`.
- **Hook:** `useEventEmitter` (the only root-exported hook).
- **Theme:** `lightTheme`, `darkTheme`, `buildChartTheme`, `allColors`, `grayColors`, `defaultColors`.

## Tooltip (built-in)
`<Tooltip>` props of note: `renderTooltip={({ tooltipData, colorScale }) => ...}`,
`snapTooltipToDatumX`/`snapTooltipToDatumY`, `showVerticalCrosshair`/`showHorizontalCrosshair`,
`showSeriesGlyphs`, `showDatumGlyph`, `renderGlyph`. `tooltipData` has `nearestDatum` and
`datumByKey`. Unlike Path A, you don't wire `localPoint` yourself — XYChart captures events.

## Theming
- Prebuilt: `lightTheme`, `darkTheme` (the ONLY two prebuilt themes). Pass via `theme` prop.
- Custom: `buildChartTheme({ backgroundColor, colors, tickLength, gridColor, ... })`. Color palettes
  `allColors`/`grayColors`/`defaultColors` are exported to build from.

## Animation
- `AnimatedAxis`/`AnimatedGrid`/`Animated*Series` require **`@react-spring/web`** as a peer dependency.
- Optional `animationTrajectory` prop ('outside' | 'center' | 'min' | 'max') controls enter/update motion.

## When to drop back to Path A
Non-cartesian charts (radial/hierarchy/geo/network/sankey/chord), unusual geometry, or when you need
control XYChart doesn't expose. XYChart is x/y-cartesian only.
