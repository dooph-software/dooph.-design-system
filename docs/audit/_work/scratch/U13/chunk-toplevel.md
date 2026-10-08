
<!-- chunk: items 6-8 (README, CHANGELOG, NOTICES, CONTRIBUTING, SECURITY) -->
### U13-F11: README's font contract drops the mono role and two of the axes the theming skill says must be requested, so a README-following app silently loses them
- severity: S2
- category: doc-drift
- rules: []
- scope: consumer-visible
- confidence: plausible
- verified_by: "Read README.md in full; compared with theming/SKILL.md:54-93 and token-contract.md:9; tokens.css:388-436 (`--ui-font-mono`, `--ui-font-var-*` use wdth/GRAD/ROND/slnt; `--ui-font-var-mono: \"MONO\" 1`); FontAxes keys (exports-head.tsv) include slant, opticalSize, mono."
- locations:
  - README.md:62-71
  - README.md:81-141
  - README.md:163-172
- evidence: |
    README.md:62  … It defines default font-family tokens only — one per text role, so each role can be overridden independently:
    README.md:65-70  six declarations (body, button, heading, label, title, hero) — no `--ui-font-mono`
    README.md:95  axes: ["GRAD", "ROND", "wdth"],
    theming/SKILL.md:83  - **Google Sans Flex** — `GRAD`, `ROND`, `opsz`, `slnt`, `wdth`, `wght`.
    theming/SKILL.md:85  - **Google Sans Code** — `MONO`. The family has a *proportional* cut at MONO 0,
- impact: README ships in the tarball and is the setup doc most consumers follow. An app built from it never loads Google Sans Code, so `MonoText` falls back to the platform monospace (theming:71-72 calls this "almost right … goes unnoticed"), and it requests Google Sans Flex without `opsz`/`slnt`, so `axes={{[FontAxes.slant]: …}}` / `FontAxes.opticalSize` silently no-op (token-contract:9: "pinned or omitted, the provider serves a file without the axis and the token silently does nothing"). "One per text role" lists six of seven.
- recommendation: Add `--ui-font-mono` + Google Sans Code (MONO range) and the full Flex axis set to both README examples, or replace them with a pointer to the theming skill.
- breaking: none
- contract: n/a
- remediation: tbd
- related: []

### U13-F12: CHANGELOG.md has no entries for 2.x–5.3.0 (≈30 tags, three majors) and its [Unreleased] section omits every breaking change on HEAD
- severity: S2
- category: doc-drift
- rules: [R13.5]
- scope: docs
- confidence: plausible
- verified_by: "`git tag --sort=-creatordate` → v2.1.0 … v5.3.0 (incl. v3.0.0, v4.0.0, v5.0.0); CHANGELOG.md headings: [Unreleased], [1.1.0] — 2026-06-23, [1.0.0] — 2026-06-09. [Unreleased] compared with the §6 inventory."
- locations:
  - CHANGELOG.md:10-23
  - CHANGELOG.md:25
- evidence: |
    CHANGELOG.md:5   Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
    CHANGELOG.md:10  ## [Unreleased]
    CHANGELOG.md:12  ### Added   (MorphRotationShape, ShapeMorphSpinner, 4 shape-morph tokens, *_SHAPE_PATH, DropdownCaret, hover nudge)
    CHANGELOG.md:20  ### Changed (DropdownTrigger/TypeableDropdownTrigger use DropdownCaret; right padding 0)
    CHANGELOG.md:25  ## [1.1.0] — 2026-06-23
- impact: The file declares Keep-a-Changelog/SemVer but is silent on every release a consumer can actually install, so the release notes a consumer's agent would consult before upgrading do not exist; [Unreleased] lists 7 additive items and omits the 26 token removals, 19 utility removals, `ButtonVariant.brand`, `IconSize`, `TwoWayToggle`, `DropdownMenuCheckboxItem`, `DropdownMenuVariant`, `SegmentedVariant`, `GemShape`/`ShapeButtons` removals, and additions AIChat, Sticker, ToggleSwitch, FadeChangeText, HeroBody/HeroButton, InputVariant, SliderVariant … (§6). No `### Removed` heading exists although the format requires one for removals. The vm skill's Step 2 ("Diff the tags … never from memory") is the only inventory mechanism; the changelog neither records its output nor is referenced by the migration skills. CHANGELOG.md is not in the npm tarball (pack.txt), which limits reach to GitHub readers.
- recommendation: Seed [Unreleased] from the §6 inventory with Added/Changed/Removed; either backfill 2.0–5.3.0 from `git diff` of tags or state explicitly that history before X lives in git tags/releases.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U13-F1]

### U13-F13: THIRD_PARTY_NOTICES.md lists 11 of 14 runtime dependencies and is not shipped in the npm tarball, although dist/ contains the vendored MIT shape-morph engine and androidx-derived code whose attribution survives only in source maps
- severity: S2
- category: build-packaging
- rules: []
- scope: consumer-visible
- confidence: plausible
- verified_by: "package.json dependencies (14) vs THIRD_PARTY_NOTICES.md:51-63 table (11); `grep -c \"THIRD_PARTY\\|NOTICE\" docs/audit/_work/pack.txt` → 0 (tarball ships LICENSE.txt, README.md, bin, dist, skills only); `grep -rl Thereallo dooph-ds-audit-build/dist` → only chunk-*.js.map files; src/components/MorphRotationShape/engine/{utils,polygon,morph,cubic}.ts:2-4 carry 'Vendored from shape-morph … MIT … See THIRD_PARTY_NOTICES.md'."
- locations:
  - THIRD_PARTY_NOTICES.md:51-63
  - package.json:36-40 (files) ; package.json:80-95 (dependencies)
  - src/components/MorphRotationShape/engine/cubic.ts:2-4
- evidence: |
    THIRD_PARTY_NOTICES.md:48  The following runtime npm packages are bundled or linked in distributed builds.
    missing rows: @radix-ui/react-popover ^1.1.23, @radix-ui/react-progress ^1.1.16, @radix-ui/react-slider ^1.4.7
    package.json:36  "files": [ "dist", "skills", "bin" ],
    cubic.ts:2  * Vendored from shape-morph (https://github.com/Thereallo1026/shape-morph, MIT,
    cubic.ts:4  * (Apache 2.0). See THIRD_PARTY_NOTICES.md.
- impact: The notice file's own claim ("The following runtime npm packages …") is incomplete by three packages. More materially, the MIT license of shape-morph requires its copyright and permission notice in "all copies or substantial portions"; the npm artifact ships the ported engine in dist/*.js with neither the notice file nor the MIT text (the source headers point at a file that is not in the package), and LICENSE.txt names only Dooph LLC. The engine section of the file itself (:67-85) is accurate. (Separately noted, not filed: ProgressIndicator/waveGeometry.ts:2 calls itself a "Custom SVG port of Material 3's circular wavy-indicator geometry"; whether that is a code port needing an Apache-2.0 notice is unverifiable from the repo.)
- recommendation: Add the three Radix rows; add THIRD_PARTY_NOTICES.md (with the shape-morph MIT text) to `files`, or append the notices to LICENSE.txt.
- breaking: none
- contract: n/a
- remediation: tbd
- related: []

### U13-F14: CONTRIBUTING.md and SECURITY.md link to a repository path that 404s, so the documented private vulnerability-reporting channel is unreachable
- severity: S2
- category: doc-drift
- rules: []
- scope: docs
- confidence: plausible
- verified_by: "WebFetch https://github.com/dooph-software/dooph-Design-System → HTTP 404; WebFetch https://github.com/dooph-software/dooph.-Design-System → repository 'dooph.-design-system'; `git remote -v` → https://github.com/dooph-software/dooph.-Design-System.git; package.json:10 url …/dooph.-design-system.git"
- locations:
  - SECURITY.md:11
  - CONTRIBUTING.md:7
- evidence: |
    SECURITY.md:11     **[Report a vulnerability](https://github.com/dooph-software/dooph-Design-System/security/advisories/new)**
    CONTRIBUTING.md:7  To file a bug or question, open an [issue](https://github.com/dooph-software/dooph-Design-System/issues) — fixes are not guaranteed.
    package.json:10    "url": "https://github.com/dooph-software/dooph.-design-system.git"
- impact: A researcher following SECURITY.md lands on a 404 and, told not to open a public issue (SECURITY.md:9), has no working channel; bug reporters likewise. (The repo name is missing the `.` after `dooph`.)
- recommendation: Use `dooph.-design-system` in both links.
- breaking: none
- contract: n/a
- remediation: tbd
- related: []

### U13-F15: S4 batch — cosmetic inaccuracies in the consumer docs
- severity: S4
- category: doc-drift
- rules: []
- scope: consumer-visible
- confidence: plausible
- verified_by: "Read in full; `ls` repo root (LICENSE.txt only); theme-keys-head.txt (130 keys) vs tokens.cjs (259 tokens); tokens.cjs .dark-vs-:root identity check."
- locations:
  - README.md:208 ; README.md:209 vs LICENSE.txt:3
  - README.md:185 ; skills/dooph-design-system-theming/SKILL.md:45-46 ; token-contract.md:220
  - skills/dooph-design-system-theming/SKILL.md:16-17
  - skills/dooph-design-system-theming/SKILL.md:176-177
  - skills/dooph-design-system-usage/SKILL.md:26-28
- evidence: |
    README.md:208   MIT — see [LICENSE](./LICENSE) for the full text.      (file is LICENSE.txt → broken link on GitHub/npm)
    README.md:209   … remain trademarks of dooph software.                (LICENSE.txt:3 "Copyright (c) 2026 Dooph LLC")
    README.md:185   so your Tailwind learns every `--ui-*` token.         (theme.css maps 130 keys; tokens.css defines 259 — motion/size/opacity tokens are deliberately unmapped)
    theming:16-17   > **Upgrading from v2?** The `--ui-*` names below are the v3 contract.   (names below are HEAD's post-rename names, not v3's; no pointer exists for a 5.3.0 → HEAD upgrader)
    theming:176-177 Mode-invariant tokens (spacing, radius, sizing, fonts) are defined once on `:root`/`.light`   (tokens.css .dark redeclares 6 identical values: --ui-size-checkbox, --ui-radius-checkbox, --ui-radius-avatar, --ui-radius-avatar-sm, --ui-color-primary-disabled, --ui-color-primary-border-disabled — cross-ref tokens unit, R5.3)
    usage:26-28     `BaseText` or a pre-composed variant (`BodyText`, … `MonoText`)   (lists 8 of the 10 role components; :237 says ten)
- impact: Each is individually minor: a dead license link, an entity-name mismatch, "every token" overstating the preset, a version label that points the reader at the wrong contract.
- recommendation: Fix in one docs pass.
- breaking: none
- contract: n/a
- remediation: tbd
- related: []
