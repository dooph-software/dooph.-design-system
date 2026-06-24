# Changelog

All notable changes to `@dooph-software/design-system` will be documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

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
