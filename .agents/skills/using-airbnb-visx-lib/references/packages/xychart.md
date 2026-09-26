# @visx/xychart

<a title="@visx/xychart npm downloads" href="https://www.npmjs.com/package/@visx/xychart">
  <img src="https://img.shields.io/npm/dm/@visx/xychart.svg?style=flat-square" />
</a>

A high-level, opinionated cartesian (x/y) charting API. Compose a chart from declarative `<XYChart>` + `<*Series>` + `<Axis>` + `<Grid>` + `<Tooltip>` children — scales, color mapping, dimensions, and tooltip/event plumbing are derived from context automatically.

## Installation

```
npm install --save @visx/xychart
```

Peers: `react` (`^18 || ^19`), `react-dom`, `@react-spring/web` (`^9.7.5 || ^10`), and `@types/react` (+`@types/react-dom`) if you use TypeScript.

## Exports

- **Container:** `XYChart`; `DataProvider`/`DataContext`, `EventEmitterProvider`, `ThemeProvider`, `TooltipProvider`
- **Axes/grid:** `Axis`, `Grid` (+ `AnimatedAxis`, `AnimatedGrid`) — `Grid` takes `rows`/`columns` props
- **Series:** `BarSeries`, `LineSeries`, `AreaSeries`, `GlyphSeries`, `BarStack`, `BarGroup`, `AreaStack` (+ each `Animated*`)
- **Tooltip:** `Tooltip` (data-aware; distinct from `@visx/tooltip`)
- **Annotation:** `Annotation`, `AnnotationLabel`, `AnnotationConnector`, `AnnotationCircleSubject`, `AnnotationLineSubject` (+ `AnimatedAnnotation`)
- **Theme:** `lightTheme`, `darkTheme`, `buildChartTheme`, plus `allColors`/`grayColors`/`defaultColors`
- **Hook:** `useEventEmitter`. Plus every `…Props`/type export.

## Usage

Scales are **config objects**, not constructed scales: `xScale={{ type: 'band' }}`. Each `<*Series>` takes `dataKey`/`data`/`xAccessor`/`yAccessor` and registers itself; domains are derived from the union of all series. `Tooltip` requires a `renderTooltip` render prop that receives `tooltipData.nearestDatum` and `colorScale`.

```tsx
import { XYChart, Axis, Grid, BarSeries, LineSeries, Tooltip } from '@visx/xychart';

const data = [{ x: '2020-01-01', y: 50 }, { x: '2020-01-02', y: 10 }, { x: '2020-01-03', y: 20 }];
const accessors = { xAccessor: (d) => d.x, yAccessor: (d) => d.y };

<XYChart height={300} xScale={{ type: 'band', paddingInner: 0.3 }} yScale={{ type: 'linear' }}>
  <Grid columns={false} numTicks={4} />
  <Axis orientation="bottom" />
  <Axis orientation="left" />
  <BarSeries dataKey="Bars" data={data} {...accessors} />
  <LineSeries dataKey="Line" data={data} {...accessors} />
  <Tooltip
    snapTooltipToDatumX
    snapTooltipToDatumY
    showVerticalCrosshair
    showSeriesGlyphs
    renderTooltip={({ tooltipData, colorScale }) => (
      <div style={{ color: colorScale?.(tooltipData.nearestDatum.key) }}>
        {tooltipData.nearestDatum.key}: {accessors.yAccessor(tooltipData.nearestDatum.datum)}
      </div>
    )}
  />
</XYChart>;
```

## Notes (v4)

- `xScale` and `yScale` are **required** on `XYChart` (unless you supply your own `DataProvider`); otherwise it warns and returns `null`.
- An `Axis`/`Grid` renders `null` until a non-empty series registers — empty series leave the frame unpainted.
- `Animated*` components require the `@react-spring/web` peer; use the plain variants to avoid it.
- Omit `width`/`height` to make the chart responsive (it wraps itself in `ParentSize`, needing `ResizeObserver`).
- `BarStack`/`BarGroup`/`AreaStack` are containers — nest `<BarSeries>`/`<AreaSeries>` children inside.
- Import only from the package root (`@visx/xychart`).
