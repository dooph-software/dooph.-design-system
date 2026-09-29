# Third-Party Notices

`@dooph-software/design-system` includes or is derived from third-party software.
This file lists those components and their licenses.

---

## Icon Libraries

Icons under `src/components/Icons/` may be derived from or inspired by the following
open-source icon libraries. Individual icons are not tracked to a specific source;
this notice covers the libraries collectively.

### Material Symbols (Google)
- **License:** Apache 2.0
- **Copyright:** Google LLC
- **Source:** https://fonts.google.com/icons
- **License text:** https://github.com/google/material-design-icons/blob/master/LICENSE

### Lucide
- **License:** ISC
- **Copyright:** Copyright (c) 2026 Lucide Icons and Contributors
- **Source:** https://lucide.dev
- **License text:** https://lucide.dev/license

### Tabler Icons
- **License:** MIT
- **Copyright:** Copyright (c) 2020-2026 Paweł Kuna
- **Source:** https://tabler.io/icons
- **License text:** https://github.com/tabler/tabler-icons/blob/master/LICENSE

### Phosphor Icons
- **License:** MIT
- **Copyright:** Copyright (c) 2023 Phosphor Icons
- **Source:** https://phosphoricons.com
- **License text:** https://github.com/phosphor-icons/core/blob/main/LICENSE

### Heroicons
- **License:** MIT
- **Copyright:** Copyright (c) Tailwind Labs, Inc.
- **Source:** https://heroicons.com
- **License text:** https://github.com/tailwindlabs/heroicons/blob/master/LICENSE

---

## npm Dependencies

The following runtime npm packages are bundled or linked in distributed builds.
Each is used under its stated open-source license.

| Package | License | Source |
|---------|---------|--------|
| @radix-ui/react-checkbox | MIT | https://github.com/radix-ui/primitives |
| @radix-ui/react-dialog | MIT | https://github.com/radix-ui/primitives |
| @radix-ui/react-dropdown-menu | MIT | https://github.com/radix-ui/primitives |
| @radix-ui/react-slot | MIT | https://github.com/radix-ui/primitives |
| @radix-ui/react-tabs | MIT | https://github.com/radix-ui/primitives |
| @radix-ui/react-toast | MIT | https://github.com/radix-ui/primitives |
| @radix-ui/react-toggle-group | MIT | https://github.com/radix-ui/primitives |
| @radix-ui/react-tooltip | MIT | https://github.com/radix-ui/primitives |
| class-variance-authority | Apache-2.0 | https://github.com/joe-bell/cva |
| clsx | MIT | https://github.com/lukeed/clsx |
| tailwind-merge | MIT | https://github.com/dcastil/tailwind-merge |

---

## Shape Morphing Engine

`src/components/MorphRotationShape/engine/` is vendored from shape-morph, a
TypeScript port of Android's `androidx.graphics.shapes`. `engine/svgPath.ts`
and `scripts/shapeMorphSpring.mjs` port further androidx sources
(`SvgPathParser.kt`, `PolygonValidation.kt`, Compose `SpringSimulation.kt`,
`SpringEstimation.kt`), and `MorphRotationShape` follows Compose Material 3
`LoadingIndicator.kt`.

### shape-morph
- **License:** MIT
- **Copyright:** Copyright (c) 2026 Thereallo
- **Source:** https://github.com/Thereallo1026/shape-morph (commit f4d2697)

### Android Jetpack (androidx) — graphics-shapes, Compose animation-core, Compose Material 3
- **License:** Apache 2.0
- **Copyright:** The Android Open Source Project
- **Source:** https://github.com/androidx/androidx
- **License text:** https://www.apache.org/licenses/LICENSE-2.0