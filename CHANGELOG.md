# Changelog

All notable changes to `@dooph-software/design-system` will be documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

### Added
- `MorphRotationShape` — DS shapes that spring-morph into one another while turning (`autoplay`, `controlled`, `embedded` modes; `restingAngle`; per-instance `timing`).
- `ShapeMorphSpinner` — M3 Expressive–style shape-morphing loader.
- Tokens `--ui-shape-morph-duration`, `--ui-shape-morph-ease` (generated spring), `--ui-shape-morph-interval`, `--ui-shape-morph-passive-spin-duration`.
- Every `Shapes` component exports its outline as `<NAME>_SHAPE_PATH`.
- `DropdownCaret` — shape-morphing caret (Figma Dropdown Caret); hover leans the shape, open morphs it.
- `MorphRotationShape` hover nudge: `--ds-shape-morph-nudge` input, `--ui-shape-morph-nudge`, `--ui-shape-morph-nudge-duration`, `--ui-shape-morph-nudge-ease` tokens.

### Changed
- `DropdownTrigger` and `TypeableDropdownTrigger` use `DropdownCaret` in place of the plain chevron; right padding is now 0.

---

## [1.1.0] — 2026-06-23

### Added
- **React Server Component (RSC) support is now built in.** Every interactive
  component ships a per-module `"use client"` directive that is preserved into
  `dist`, so a Next.js App Router **Server Component** can
  `import { Button } from "@dooph-software/design-system"` (and context-driven
  components like `Tooltip`/`DropdownMenu`) and `next build` succeeds with no
  `createContext is not a function` error. **Consumers no longer need a local
  `"use client"` re-export wrapper barrel.**

### Changed
- Build now emits one chunk per source module (tsup `splitting`, multi-entry)
  instead of a single inlined barrel, so client and server-safe modules stay
  separate and directives survive per module. `dist/index.js` remains the single
  public entry. Pure/server-safe modules (`cn`, type-only files, variant enums,
  icon/shape SVG components, `BaseText`) intentionally carry **no** directive and
  stay renderable in the RSC layer. ESM + CJS outputs, the exports map,
  `sideEffects`, types, and `styles.css`/`theme.css` emission are unchanged.
- Dot-accessible variant/size enums (`ButtonVariant`, `ButtonSize`, `TabVariant`,
  `TabSize`, `ToggleVariant`, `ToggleSize`, `SegmentedVariant`, `TextDropdownSize`,
  `ShapeButtons`, `CheckboxChecked`, `CheckboxVariant`, `ToastTypes`, `TooltipTypes`)
  moved out of their (now client) component files into sibling server-safe
  `constants.ts` modules, so a Server Component can read enum **values**
  (e.g. `ButtonVariant.primary`) without crossing a client boundary. Public import
  paths via the package barrel are unchanged; only internal deep imports were
  rewired.

---

## [1.0.0] — 2026-06-09

### Added
- Initial public release as `@dooph-software/design-system`.

---

<!-- Add new releases above this line in the format:

## [version] — YYYY-MM-DD
### Added / Changed / Deprecated / Removed / Fixed / Security
- Description of change.

-->
