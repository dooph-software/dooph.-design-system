
<!-- chunk: example type-check (item 1) — findings go to §1, table to §5 at final assembly -->
### U13-F3: The usage skill's typography example uses `HeroText` but its own import line omits it — the block does not compile as written
- severity: S1
- category: doc-drift
- rules: []
- scope: consumer-visible
- confidence: plausible
- verified_by: "scratch/U13/examples/ex06_usage_L254.tsx (import line verbatim) → tsc: `ex06_usage_L254.tsx(9,2): error TS2304: Cannot find name 'HeroText'.`; ex06b (same block, HeroText added to the import) → 0 errors."
- locations:
  - skills/dooph-design-system-usage/SKILL.md:255-259
- evidence: |
    SKILL.md:255  import { BodyText, Fonts, FontSizes, FontWeights, Tracking, FontAxes } from "@dooph-software/design-system";
    SKILL.md:259  <HeroText as="h1" lineHeight={1.05}>Dashboard</HeroText>
- impact: The one example in the skill that ships a complete import line is the one a consumer's agent copies verbatim; it fails with TS2304. Trivial to repair, but it is exactly the "shipped skill example that doesn't compile against shipped types" case. (`Tracking` and `FontAxes` are imported and unused in the block — harmless.)
- recommendation: Add `HeroText` to the import on line 255.
- breaking: none
- contract: n/a
- remediation: tbd
- related: []

### U13-F4: The usage skill's component inventory omits required props, so calls written from it fail to compile (`MorphRotationShape` `shapes`, `CTAButton` `text`/`icon`)
- severity: S2
- category: doc-drift
- rules: []
- scope: consumer-visible
- confidence: plausible
- verified_by: "scratch/U13/examples/ex15_usage_prose_claims.tsx → tsc: `(67,6) TS2322 … Property 'shapes' is missing in type '{ mode: \"autoplay\"; }'` and `(77,6) TS2739 … missing the following properties from type 'CTAButtonProps': text, icon`; dist/components/MorphRotationShape/MorphRotationShape.d.ts `shapes: ShapeComponent[]` (\"At least two\"); dist/components/CTAButton/CTAButton.d.ts `text: string; icon: ReactNode;`"
- locations:
  - skills/dooph-design-system-usage/SKILL.md:210
  - skills/dooph-design-system-usage/SKILL.md:117-119
- evidence: |
    SKILL.md:210  `MorphRotationShape` (shape morph primitive; required `mode`: `MorphRotationShapeMode.autoplay` | `.controlled` (activeIndex) | `.embedded` ...
    SKILL.md:117  `CTAButton` (marketing CTA — fully round, padded outline ring on `primary`,
    SKILL.md:118  label-only hover roll; `CTAButtonVariant`: `primary` | `secondary`,
- impact: The skill names `mode` as "required" and stops, so an agent writes `<MorphRotationShape mode={…} />` and gets TS2322; the `shapes` it needs are DS shape components (`CloverShape`, `PuffShape`, …) that the usage skill never mentions anywhere (see U13-F9). `CTAButton` reads like a Button (`<CTAButton>Label</CTAButton>` compiles the children but fails on the missing `text`/`icon`). The compiler catches both, so the cost is a wasted round-trip and a guess at what `shapes` takes, not a silent failure.
- recommendation: State `shapes` (≥2 `*Shape` components) next to `mode`, and `text`/`icon` for `CTAButton`.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U13-F9]

<!-- §5 table -->
### [§5 part] Code-example type-check (item 1)

Setup: `docs/audit/_work/scratch/U13/examples/tsconfig.json` (`jsx: react-jsx`, `moduleResolution: bundler`, `strict`, `noEmit`, `skipLibCheck`, `paths` → `C:/Users/stick/Github/dooph/dooph-ds-audit-build/dist/index.d.ts`, React types and `tailwind-merge` from the build's node_modules). Command: `node C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/typescript/bin/tsc -p tsconfig.json --pretty false` (TS 5.9.3) → exit 2, output saved to `examples/tsc-output.txt`. Theming SKILL.md and token-contract.md contain **no** ts/tsx blocks (css + one URL block only), so nothing to compile there.

| Example (file) | Source | Scaffolding added | Result |
|---|---|---|---|
| ex01_usage_L19.tsx | usage/SKILL.md:19-22 | `export {}` | PASS |
| ex02_usage_L52.tsx | usage:52-60 | imports, wrapper + fragment, `//` comments → `{/* */}` | PASS |
| ex03_usage_L64.tsx | usage:64-75 | imports, `declare function save()`, wrapper | PASS |
| ex04_usage_L79.tsx | usage:79-86 | wrapper; doc's three `<div …>` are unclosed illustrative fragments → self-closed | PASS (the unclosed tags are a presentation choice in an anti-pattern block, not filed) |
| ex05_usage_L96.tsx | usage:96-101 | import `TitleText`, wrapper | PASS |
| ex06_usage_L254.tsx | usage:254-260 | wrapper only; import line verbatim | **FAIL** — `TS2304: Cannot find name 'HeroText'` (×2). REAL doc error → U13-F3 |
| ex06b (same, HeroText imported) | usage:254-260 | + `HeroText` import | PASS — rest of the block matches the types (`fontSize={16}`, `fontWeight={450}`, `lineHeight`, `letterSpacing`, `as="h1"`) |
| ex07_usage_L278.tsx | usage:278-281 | imports, `declare const elapsed/balance`, wrapper | PASS |
| ex08_usage_L325.ts | usage:325-337 | none (verbatim) | PASS against tailwind-merge 3.x types |
| ex09_usage_L351.tsx | usage:351-361 | none (verbatim) | PASS |
| useIsDesktop.tsx | responsive-sheet-modal.md:29-46 | none | PASS |
| ResponsiveDialog.tsx | responsive-sheet-modal.md:50-95 | none (relies on global `React` namespace for `React.ReactNode`, which @types/react provides) | PASS |
| ex12_responsive_L99.tsx | responsive-sheet-modal.md:99-103 | imports `Button`, `ResponsiveDialog`, wrapper | PASS |
| ex13_readme_L23_L35.tsx | README.md:23-26 + 35-42 | none | PASS |
| README.md:81-125 (next/font) | README | — | NOT RUN — `next` is not installed in the build; `Google_Sans_Flex` availability in `next/font/google` unverifiable offline |
| ex15_usage_prose_claims.tsx | probes of usage-skill PROSE claims | n/a (probe file) | 4 errors: `MorphRotationShape` missing `shapes` (REAL omission → U13-F4); `CTAButton` missing `text`,`icon` (REAL omission → U13-F4); `ShapeMorphSpinner size={32}` (probe error: `size` is `LoadingSpinnerSize`; the skill never says number — not a finding); `DatePicker mode=dateRange` without `value`/`onChange` (probe scaffolding — not a finding). All four `@ts-expect-error` assertions held: Sticker `custom` without `color`, Slider `custom` without `color`, `RollingDigitsText smallDecimals` without `smallDecimalsComponent`, `MorphRotationShape` without `mode` are compile errors, as the skill claims. |
