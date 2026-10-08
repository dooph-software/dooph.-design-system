### 7.1 Method

1. **Baseline (Phase 0).** Tree clean at start. `npm run lint` in place (exit 0). `npm ci && npm run build` and `npm run build-storybook` in a separate worktree at the same SHA (`../dooph-ds-audit-build`, removed at the end) — both exit 0, and `git status --porcelain` there stayed empty after the build, so every generated file (`Icons/index.ts`, the `@theme inline` block, `theme.css`, the shape-morph ease) reproduces byte-for-byte. `npm pack --dry-run` → 2519 files. Evidence: `_work/baseline.md`.
2. **Rulebook (Phase 1).** Every normative source read in full and extracted into R1–R13 (§2), with 7 suspected conflicts (RC-1…RC-7). Ledger seeded from `git ls-files` (504 rows, tier + unit).
3. **Vertical review (Phase 2).** 14 units (U1–U14) read every Tier 1 file in full; ~88 icon leaves pattern-verified by a normalising script (outliers read in full); 11 `Shapes/svgs` verified against the exported path constants by script; Tier 2 docs claims-checked; Tier 3 provenance-only. Raw output: `_work/units/U1.md … U14.md` (≈240 unit findings, fingerprints, claim rows, per-file ledgers).
4. **Horizontal passes (Phase 3).** HA (public API / const table / type safety / dead code, TypeScript compiler-API scripts), HB (consistency matrix, 122 exported components), HC (Rules 2/3/5/6/7 — every grep hit given a verdict; motion and token-bypass tallies), HD (claims register: 1032 raw claim rows → 843 de-duplicated, 15 unit-vs-unit conflicts resolved). Output: `_work/horizontal/`.
5. **Clustering.** Unit and horizontal findings that describe one pattern were merged before verification so each merged finding was refuted once (`_work/clusters.md`, `_work/final-map.psv`).
6. **Adversarial verification (Phase 4).** Eight fresh verifiers (V1–V8) whose only job was to refute, given only the findings and the cited files. Every S1 and S2 cluster was attempted; S3 was sampled at random (seeded Fisher–Yates, 13 of 45 pooled S3 clusters = 29%, plus 3 more S3s inside a V7 batch). Methods included `react-dom/server` renders of the built `dist/`, a Node ESM loader approximating the React Server Components graph (client modules → references, server React build), `tsc` probes against `dist/index.d.ts`, Tailwind CLI compiles of scratch consumer CSS, and Browser-pane computed-style / raster probes of scratch pages. Logs: `_work/verify/V1.md … V8.md`.
7. **Synthesis (Phase 5).** Final F-IDs assigned by script (severity → category in schema order → map order); finding blocks composed per area from the members + verifier corrections, every `path:line` re-opened at the audited SHA.

### 7.2 Refuted, dropped and re-graded items

| item | Phase-4 outcome | where it went |
|---|---|---|
| U3-F6 RollingDigitsText enforces `smallDecimalsComponent` by union only | REFUTED (V4): its own header contract chooses union-only; R1.6's throw applies to bundle enums | dropped |
| U6-F21 "consumers cannot override Slider's inline defaults" | REFUTED (V6): the defaults are `var(--ui-*)` references, overridable per instance | dropped from F-029 |
| U2-F4 "the 'for sibling components' comment is inaccurate" | REFUTED (V6): `DatePickerSplitTrigger.tsx:15-22` does import those helpers | dropped from F-087 |
| HC-F8 "TextDropdownTrigger's bare span has no layout purpose" | REFUTED (V7): removing it collapses spacing and baseline with mixed children | dropped from F-024 |
| RC-6 / U14-F2 file-header-contracts example teaches `ButtonVariant.brand` | REFUTED as a rulebook conflict (V4): vendored cross-project example that shows format only | S4, in F-117 |
| U11-F1 `state` vs `variant` naming on AI parts | DOWNGRADE S4 (V4): consistent semantics (lifecycle vs kind) | F-116 |
| U10-F12 `Shapes` const in the barrel is an RSC hazard | DOWNGRADE S4 (V8): the Shapes chunk is not client-stamped | stays in F-065 at S3 via U12-F14 |
| U14-F9 loading-indicators trigger misses shape-morph files | DOWNGRADE S4 (V8): the same rules sit in those files' own headers | stays in F-100 at S3 via U14-F8 |
| M17 flat ProgressIndicator stray dot | S1 → S2 (V2): visual glitch in ~6% of the range | F-033 |
| M33 shape-morph engine ships without notices | S1 → S2 (V1); 3 missing Radix rows → S4 doc gap | F-056 |
| M63 barrel shapes | S2 → S3 (V3) | F-064 |
| M29 `.dark` duplicates | S2 → S3 (V5): only nested `.dark` regions affected; 2 of 6 lines are needed | F-059 |
| M36 `text-text-primary` | S2 → S3 (V5): no visible effect today | F-060 |
| M30 BaseIcon `color` stroke-only | S2 → S3 (V6): TagIcon's dot is hidden under the stroke unless `strokeWidth < 1` | F-063 |
| M52 className routed to a different element | S2 → S3 (V7): Input documents the same split deliberately | F-062 |
| M43 internals public through barrels | S2 → S3 (V6): `DateMatcher`/`TextStyleProps` legitimately public; `tabTriggerVariants` deliberate | F-087 |
| M26 prop-name exception list | S2 → S3 (V4): `checked` is Radix's own name — not a conflict | F-110 |
| U1-F12 dark danger Sticker | S2 → S1 (V2), merged with U12-F1 | F-001 |
| U4-F2 CopyButtonProps → `any` | S2 → S1 (V7): `<CopyButton />` with no `value` compiles and copies "undefined" | F-002 |
| U5-F11 recommendation "pass `onOpenAutoFocus` directly" | CORRECTED (HA): that prop is private in Radix 2.1.24 (TS2322); the real issue is reliance on a private API | F-113 |

Refute rate in the S3 sample: 0 of 13 sampled clusters fully refuted, 4 partial, 2 of 24 member findings downgraded (≈8%) — below the threshold that would require verifying the remaining S3s.

### 7.3 Verification log (cluster → verdict)

| verifier | clusters | verdicts |
|---|---|---|
| V1 | M1, M16, M5, M7, M33, M13, M2 | all CONFIRMED; M33 → S2; corrections: v5.3.0 already ships 9 unstamped modules (6 break), ≈76 breaking items, cn in v5.3.0 listed 6 roles |
| V2 | M4, M10, M11, M12, M17, M31, M18, M14, M15 | all CONFIRMED/PARTIAL; M17 → S2; U9-F9 comments live in `dist/components/**.d.ts` |
| V3 | M6, M28, M61, M63, M3, M9, M59, M60 | all CONFIRMED; M63 → S3; 9 Radix wrappers render under the RSC approximation without the directive |
| V4 | M8, M21, M22, M23, M24, M25, M26, M42 | M24 refuted as conflict (S4); M26 → S3; M8 S1 only for the two dead utility names; M42 partial (U3-F6 refuted, NaN worse than reported) |
| V5 | HC-F1, HC-F2, HC-F3, HC-F4, M29, M44, M36, M53, M49 | HC-F2 partial (21 not 25 literals); M29/M36 → S3; NEW finding: alias tokens not re-declared in `.dark` (F-019) |
| V6 | M30, M32, M34, M35, M37, M40, M41, M43, HA-F1, HA-F4 | M30/M43 → S3; M35/M37 partial |
| V7 | M45, M47, M48, M50, M51, M52, M54, M55, M56, M57, HC-F5, HC-F7 | M54 → S1; M52 → S3; M50/M56/HC-F5 partial |
| V8 | 13 sampled S3 clusters | 9 confirmed, 4 partial, 0 refuted |

### 7.4 Limits of this audit

- **RSC failures** (F-011, F-012) were demonstrated with a Node loader that approximates a server-components bundler (client modules become references; React's server build lacks client hooks), not inside Next.js. The stamping defect itself is confirmed directly from `dist/`.
- **R12.9 "faithful port"** of `MorphRotationShape/engine/` is UNVERIFIABLE here: no upstream source was downloaded to diff against. The engine files are unchanged since the commit that vendored them.
- **12 claims** remain UNVERIFIABLE (policy statements, external provenance, raster identity) — listed in §4 with reasons.
- Visual findings were verified by computed style and raster probes in Chromium only.
- The `_work/` directory is kept as evidence; every scratch script cited in a `verified_by` field lives under `_work/scratch/`.
