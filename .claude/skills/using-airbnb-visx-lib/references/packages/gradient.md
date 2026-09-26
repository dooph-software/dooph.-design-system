# @visx/gradient

<a title="@visx/gradient npm downloads" href="https://www.npmjs.com/package/@visx/gradient">
  <img src="https://img.shields.io/npm/dm/@visx/gradient.svg?style=flat-square" />
</a>

React wrappers for SVG `<linearGradient>` / `<radialGradient>` (rendered inside `<defs>`), plus ten
preset two-color linear gradients, all referenced by `url(#id)` as a fill or stroke.

## Installation

```
npm install --save @visx/gradient
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Components:** `LinearGradient`, `RadialGradient`
- **Presets (all linear):** `GradientDarkgreenGreen`, `GradientLightgreenGreen`, `GradientOrangeRed`,
  `GradientPinkBlue`, `GradientPinkRed`, `GradientPurpleOrange`, `GradientPurpleRed`,
  `GradientPurpleTeal`, `GradientSteelPurple`, `GradientTealBlue`
- **Types:** `LinearGradientProps`, `RadialGradientProps`

## Usage

Define a gradient with a unique `id`, then reference it via `fill="url(#id)"` (or `stroke`). Each
component renders its own `<defs>` — don't wrap them. `LinearGradient` defaults to **vertical**; pass
`vertical={false}` or explicit `x1/x2/y1/y2` for horizontal.

```tsx
import { LinearGradient, RadialGradient, GradientPinkBlue } from '@visx/gradient';

<svg width={400} height={300}>
  {/* each renders its own <defs> */}
  <GradientPinkBlue id="preset-grad" />
  <LinearGradient id="custom-lin" from="#a18cd1" to="#fbc2eb" vertical={false} />
  <RadialGradient id="custom-rad" from="#a18cd1" to="#fbc2eb" />

  <rect width={200} height={150} fill="url(#preset-grad)" />
  <rect x={200} width={200} height={150} fill="url(#custom-lin)" />
  <circle cx={100} cy={220} r={60} fill="url(#custom-rad)" />
</svg>;
```

## Notes (v4)

- Each component renders its own `<defs>` — do not nest in your own `<defs>` (no double-wrap).
- `LinearGradient` defaults to vertical (`vertical={true}`); pass `vertical={false}` for horizontal.
- `rotate` wins over `transform` (both map to `gradientTransform`).
- Passing `children` replaces the auto-generated `from`/`to` stops entirely — supply your own
  `<stop>`s for multi-stop gradients.
- All ten presets are linear (none radial). Import only from `@visx/gradient`.
