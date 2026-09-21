# Figma checklist — visx chart family

Components and states the spec demands. Companion to `2026-09-20-visx-charts-design.md`.

## Charts

- [ ] `BarChart` — single series
- [ ] `BarChart` — multi series (grouped)
- [ ] `LineChart` — single + multi series
- [ ] `AreaChart` — single + multi series
- [ ] `BarStackChart`
- [ ] `AreaStackChart`

Each at `ChartSize` **sm / md / lg** (height, tick density and type role change together).

## Chrome

- [ ] `ChartAxis` — x (bottom): axis line, tick marks, tick labels
- [ ] `ChartAxis` — y (left): axis line, tick marks, tick labels
- [ ] Axis label — x and y (y is rotated; renders as HTML, not SVG text)
- [ ] `ChartGrid` — rows, columns, both. Stroke width + dash pattern
- [ ] `ChartCrosshair` — dashed vertical line. Dash, width, colour

## Interaction

- [ ] `ChartTooltipContent` — unified, one row per series: glyph + name + value
- [ ] Focused-point glyph on line/area (size, shape — which `Shapes/` primitive?)
- [ ] Bar hover/focus treatment
- [ ] `ChartLegend` + `ChartLegendItem` — swatch geometry, spacing, wrapping.
      Display-only in v1; no toggled/off state needed

## States

- [ ] Empty (no data)
- [ ] Loading
- [ ] Error

## Decisions the mockups need to settle

- [ ] **Bar rounding: top-only or all four corners?** This picks the implementation, not
      just the look — see §8.3. All-corner is a live CSS `rx` token; top-only needs the
      overdraw-and-clip technique.
- [ ] Bar corner radius value, and bar gap / padding
- [ ] **Area fill: flat alpha or gradient?** Gradient adds `@visx/gradient` as a dependency
- [ ] Line stroke width
- [ ] Chart heights per size
- [ ] Axis stroke width and tick length

## Also

- [ ] Dark-mode pass on everything above
