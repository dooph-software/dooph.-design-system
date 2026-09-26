# @visx/mock-data

<a title="@visx/mock-data npm downloads" href="https://www.npmjs.com/package/@visx/mock-data">
  <img src="https://img.shields.io/npm/dm/@visx/mock-data.svg?style=flat-square" />
</a>

Sample datasets ("mocks") plus data generators for testing and prototyping visx charts.

## Installation

```
npm install --save @visx/mock-data
```

No React peer dependency.

## Exports

- **Generators:** `genDateValue`, `genRandomNormalPoints`, `genBin`, `genBins`, `genPhyllotaxis`,
  `genStats`, `getSeededRandom`, `getRandomNormal` (d3-random's `randomNormal`)
- **Datasets:** `appleStock`, `bitcoinPrice`, `letterFrequency`, `browserUsage`, `groupDateValue`,
  `cityTemperature`, `lesMiserables`, `exoplanets`, `planets`, `shakespeare`
- **Types:** `Bin`, `Bins`, `DateValue`, `PointsRange`, `Stats`, `BoxPlot`, and per-mock interfaces
  (`AppleStock`, `CityTemperature`, `LesMiserables`, etc.)

## Usage

```ts
import { genRandomNormalPoints, genDateValue, genBins, appleStock, cityTemperature } from '@visx/mock-data';

const points = genRandomNormalPoints(300, 0.5); // 900 [x, y, cluster] rows (3 clusters), seeded
const series = genDateValue(20, 0.5);           // 20 { date, value } points
const grid   = genBins(10, 5);                  // 10 columns × 5 bins each

appleStock[0];      // { date: '2007-04-24T07:00:00.000Z', close: 93.24 }
cityTemperature[0]; // { date: '2011-10-01', 'New York': '63.4', ... } — temps are STRINGS
```

## Notes (v4)

- Many mock numeric fields are **strings**, not numbers: `browserUsage`, `cityTemperature`, `planets` (`radius`/`distance`), and `groupDateValue.value`. Parse before plotting.
- `planets` (string fields) vs `exoplanets` (numeric `radius`, `distance: number | null`) are two different datasets with near-identical names — pick deliberately.
- `bitcoinPrice` and `lesMiserables` are single **objects**, not arrays (`bitcoinPrice.prices`, `lesMiserables.nodes/links`). `bitcoinPrice.prices` is newest-first.
- `genRandomNormalPoints(count)` returns `3 * count` rows (default 900), not `count`.
- `genDateValue` walks **backward** in time from the start (older dates at higher index).
- `getRandomNormal` is d3-random's `randomNormal` re-exported under a new name.
