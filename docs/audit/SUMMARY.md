# Audit summary — @dooph-software/design-system @ `b436647`

## 1. Grade: **C−**

| area | grade | | area | grade |
|---|---|---|---|---|
| Public API & naming | C | | Client/server & build/packaging | C− |
| Component internals | B− | | Docs, skills & contracts | C− |
| Styling & tokens | C | | Stories | D+ |

120 findings: 15 S1 · 43 S2 · 54 S3 · 8 S4 (FINDINGS §1, with counted evidence per area). Plan: 131 work items (26 P1 · 6 P2 · 89 P3 · 10 P4; 25 blocked) and 19 decision items in REMEDIATION.md.

## 2. Verdict

The architecture holds, and the rules written mechanically are followed everywhere: forwardRef + `displayName` 110/110, consumer `className` last 119/119, no Rule 5 or 7 violations, and a build that reproduces every generated file byte-for-byte. What ships is weaker. Three consumer-facing defects are verified in the published 5.3.0 (unstamped client chunks, `theme.css` shrinking widths, `cn` dropping role classes), and `asChild` crashes on four components at HEAD. About 76 breaking changes are queued behind a 5.3.0 version string. Where the rulebook is silent (disabled, focus, style precedence, callbacks, motion), each component family invented its own answer, and the docs are 80% true but mislead exactly where consumers copy from them.

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

## 6. Rule violations (your own skills' rules the code breaks)
- **Motion hardcoded instead of tokenised.** Durations and curves are written as literals in 17 component files and 6 CSS helpers, and LoadingSpinner times itself in JS. Decided 2026-10-02: every motion value becomes a token from a shared scale. *(R6.1/R6.5; F-016, F-034)*
- **Arbitrary values in className.** 21 raw `[13px]`-style literals, 32 Tailwind numeric utilities whose value equals a DS token, and 5 raw `var(--ui-…)` inside className. *(R8.10/R8.11; F-017)*
- **Focus ring drawn ad hoc.** Some components hand-roll the focus look instead of using the `ds-focus-*` helpers. *(R8.14; F-018)*
- **Disabled look drawn ad hoc.** Same problem, with the `ds-disabled-*` helpers. *(R8.16; F-026)*
- **Modal/Sheet can't opt out of portalling.** Every overlay is meant to take `portal`/`portalProps`; these two don't. *(R2.9; F-030)*
- **SliderStepped calls `preventDefault` on a Radix key event**, which the Radix rules forbid. *(R2.10; F-022)*
- **A const and its type have different names**, e.g. `FontAxes`/`FontAxis`. The rule is that both share one name. *(R1.9; F-045)*
- **Sticker wraps its children in an extra div**, so a `gap` set on Sticker does nothing. *(R3.4; F-024)*
- **PopoverContent ignores reduced motion.** *(R6.2; F-020)*
- **Release rules.** Breaking renames are queued for a minor, the v5 codemod always exits 0, and the v3 migration skill contradicts itself. *(R13.x; F-013, F-007, F-009)*
- **Header contracts not in the required format.** *(R11.x; F-102)* · **Dark theme repeats light values that don't change.** *(R5.3; F-059)* · **Stories don't show overrides beating defaults, and use raw `<button>`.** *(R9.23/R9.24; F-105)*

## 7. Potential improvements
- Register the DS scales in `cn` (F-014, F-055) and fix the stamping window (F-011): two small edits that remove three consumer bug classes.
- Write down the five conventions the rulebook is silent on (D-17): the newcomer test fails on exactly those (FINDINGS §5).

## 8. What's solid — leave alone
- The token pipeline (`sync-theme.mjs` → generated block + `theme.css`), reproducible with no drift; the forwardRef/cn/ComponentRef wrapper shape; Rules 5 and 7 hygiene; the MorphRotationShape and SidebarWithHoverIcon Rule 6 escape hatch; the RollingDigits model.

## 9. Decisions
Answered 2026-10-02:
- **Release:** v6, which you cut yourself; the migration skill comes at release time. *(D-01)*
- **Motion:** every value becomes a token, from a small shared scale. *(D-03)*
- **Dark danger Sticker:** leave it for your dark-theme overhaul. *(D-07)*
- **Figma exports:** deleted. *(D-19)*

Second batch, the same day:
- **`theme.css` size names:** intended. The DS owns its size names. *(D-02)*
- **LoadingSpinner:** CSS-driven on the motion scale (inferred from the motion answer; confirm when it starts). *(D-04)*
- **`"use client"`:** as rarely as possible. *(D-05)*
- **Colour props:** one shared lookup. *(D-06)*
- **Option prop names:** allow-list extended. *(D-08)*
- **Skills:** contradictions, mirroring and unwritten conventions all go to the end-of-work rebuild in doc-refresh.md. *(D-09, D-10, D-17)*
- **Radix skill:** deleted. *(D-11)*
- **Bad Calendar values:** render nothing. *(D-12)*
- **Callbacks:** `value`/`defaultValue`/`onValueChange`. *(D-13)*
- **Renames:** `FontAxis` and `ProgressIndicatorVariant`. *(D-14)*
- **Internals:** removed at the agent's discretion. *(D-15)*
- **Size words:** `standard`, `sm`, `micro`, `*Variant`. *(D-16)*
- **Orphan test:** deleted. *(D-18)*

No decision is pending.
