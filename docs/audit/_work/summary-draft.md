# Audit summary — @dooph-software/design-system @ `b436647`

## 1. Grade: **C−**

| area | grade | | area | grade |
|---|---|---|---|---|
| Public API & naming | C | | Client/server & build/packaging | C− |
| Component internals | B− | | Docs, skills & contracts | C− |
| Styling & tokens | C | | Stories | D+ |

120 findings: 15 S1 · 43 S2 · 54 S3 · 8 S4 (FINDINGS §1). Counted evidence per area is in FINDINGS §1.

## 2. Verdict

The architecture holds, and the rules written mechanically are followed everywhere: forwardRef + `displayName` 110/110, consumer `className` last 119/119, no Rule 5 or 7 violations, and a build that reproduces every generated file byte-for-byte. What ships is weaker. Four consumer-facing defects are already in the published 5.3.0: unstamped client chunks, `theme.css` shrinking widths, `cn` dropping role classes, and `asChild` crashing. About 76 breaking changes are queued behind a 5.3.0 version string. Where the rulebook is silent (disabled, focus, style precedence, callbacks, motion), each component family invented its own answer, and the docs are 80% true but mislead exactly where consumers copy from them.

## 3. Problems
- **RSC breaks:** `scripts/add-use-client.mjs:40` reads `contents.split('\n').slice(0, 5)`, so 16 client modules ship unstamped (9 already in v5.3.0) and fail in Server Components (F-011). Two neutral modules hand functions to a client component (F-012).
- **Unreleased major:** `package.json` says `"version": "5.3.0"` while HEAD holds about 76 breaking changes that the skills call a released "5.4" (F-013, F-049).
- **`asChild` throws** "Slot failed to slot onto its children" on OutlineButton, ShapeButton, DropdownTrigger and TextDropdownTrigger (F-003).
- **`theme.css` remaps widths:** `max-w-md` becomes 16px in a consumer build (F-015). `cn` drops `text-style-hero-*` (F-014) and has no DS scales registered (F-055).
- **Invisible or dead output:** `tokens.css:717-718` makes the dark danger Sticker white-on-white (F-001). `fillColor` does nothing on Pentagon/Puff (F-004). `ToastProvider duration` is ignored (F-005). `<CopyButton />` copies "undefined" (F-002).
- **Behaviour bugs:** VerificationCodeInput (F-040), the ProgressIndicator dot (F-033), NaN progress drawn as a full ring (F-038), toast exit animations skipped (F-035).
- **Shipped docs that don't work:** an example that doesn't compile (F-008), the codemod always exiting 0 (F-007), the v3 skill contradicting itself (F-009), dead utility names (F-006), a `'brand'` colour (F-010), wrong token facts (F-047).

## 4. Inconsistencies
- Disabled state is drawn 4 ways (F-026), focus 3 ways (F-018), inline-style precedence 3 ways (F-029), and `className` lands on a different element in 9 components (F-062).
- Callback names are split three ways (`onValueChange`, `onChange`, `onSelect`) (F-031); there are two colour-prop mechanisms (F-032); ref/rest reachability is answered five ways (F-039).
- `"use client"` follows no single rule (F-027); barrel shapes differ (F-064); consts sit outside `constants.ts` (F-065); naming vocabulary is split (F-098).

## 5. Anti-patterns
- Motion timing is hardcoded in 17 files and 6 helpers; 30 of 41 animated components have no motion tokens (F-016). LoadingSpinner times itself in JS (F-034); the toast mirrors CSS with `setTimeout` (F-035).
- Token bypass: 21 arbitrary literals and 32 numeric-scale utilities equal to a token (F-017). 28 alias tokens break inside nested `.dark` regions (F-019).
- Copy-paste: Modal/Sheet (F-083), shapes ×12 (F-080), RollChange/FadeChange (F-079), SearchBox ×2 (F-082), ref merging ×4 (F-085).

## 6. Rule violations
- R6.1/R6.5 (F-016, F-034), R8.10/R8.11 (F-017), R8.14 (F-018), R8.16 (F-026), R2.9 (F-030), R2.10 (F-022), R1.9 (F-045), R3.4 (F-024), R6.2 (F-020).
- R13.3/R13.10/R13.11 (F-013, F-007, F-009), R11.x header format (F-102), R5.3 (F-059), R9.23/R9.24 stories (F-105).

## 7. Potential improvements
- Register the DS scales in `cn` (F-014, F-055) and fix the stamping window (F-011): two small edits that remove three consumer bug classes.
- Write down the five conventions the rulebook is silent on (D-17): the newcomer test fails on exactly those (FINDINGS §5).

## 8. What's solid — leave alone
- The token pipeline (`sync-theme.mjs` → generated block + `theme.css`), reproducible with no drift; the forwardRef/cn/ComponentRef wrapper shape; Rules 5 and 7 hygiene; the MorphRotationShape and SidebarWithHoverIcon Rule 6 escape hatch; the RollingDigits model.

## 9. Decisions I need from you
- D-01 Release the queued batch as 6.0.0 with a v6 migration skill? · D-02 How to stop `theme.css` remapping container widths?
- D-03 Do hover transitions need motion tokens? · D-04 Move LoadingSpinner timing to CSS, or sanction the JS loop?
- D-05 `"use client"` policy (decide before the F-011 fix ships) · D-06 One colour-prop mechanism via `resolveDsColor`?
- D-07 Intended dark danger Sticker look? · D-08 Extend arch:122's prop-name list? · D-09 Settle RC-2/RC-3/RC-5 and R9.19's scope?
- D-10 One skill-mirroring mechanism? · D-11 Remove the vendored radix skill? · D-12 Tighten the union guards and make Calendar throw?
- D-13 One callback convention (breaking)? · D-14 R1.9 renames? · D-15 Pull internals off the public surface? · D-16 Naming vocabulary?
- D-17 Record the silent conventions? · D-18 Delete or run the orphan test? · D-19 Refresh or delete `figma-variable-jsons/`?
