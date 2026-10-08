# Wave A — plan items, five agents in parallel (each takes ONE section)

Every agent reads first:
1. `docs/audit/_work/agent-rules.md` (mandatory).
2. The full block of each work item (WI) in its section, in `docs/audit/REMEDIATION.md`. Each block has steps, anchors and verification.
3. Each finding the WI addresses, in `docs/audit/FINDINGS.md`.

**Drift protocol.** Line numbers in WIs are from `b436647`. A lot has changed since, all by script or batch:
- spacing renamed (`xs`→`sm` etc.); size words (`standard`); the motion scale (`ds-motion-*`);
- `onValueChange` callbacks; `FontAxis` / `ProgressIndicatorVariant`;
- `"use client"` only where needed; new Button/CTA/spinner/slider/fancy-toggle work.

Locate code by its quoted anchor. If an anchor is gone, re-derive the change from the finding. Never guess.

**Docs are deferred.** Skip WI steps that edit CHANGELOG, README or skills, and record them as "docs owed" instead. Header contracts are NOT deferred.

**Look changes.** If a step would visibly change how an existing component looks in a way the WI doesn't already justify as a bug fix, skip it and report it.

Change record: `docs/audit/_work/changes/06A<n>-<name>.md`. Keep a checklist, write as you go, and end with `## DONE`. Don't run Storybook and don't run a build in this checkout; the orchestrator verifies visually. Hand back in ≤15 lines.

---

## A1 — `asChild` on decorated leaves + OutlineButton handlers (WI-081, WI-087)
- **Folders:** `src/components/{OutlineButton,ShapeButton,DropdownTrigger,Button}/**`.
- **WI-081:** `asChild` must work, using Radix `Slottable`, on the four leaves that throw "Slot failed to slot onto its children". Add the missing asChild stories.
- **WI-087:** compose OutlineButton's glow handlers with the consumer's `onMouseMove` / `onMouseLeave`.
- **Note:** batch 05 just added Button `medium` / `big` and a union props type. Keep them working.

## A2 — Register every text-style role and the DS theme scales in `cn` (WI-035)
- **Files:** `scripts/sync-theme.mjs`, `src/utils/cn.ts`, `src/utils/twMergeTheme.ts` (create it if the WI says to), and the package export or config the WI describes.
- **Do:**
  - Generate the list from one source.
  - It must include every `text-style-*` role: hero, hero-body, hero-button, cta, title, heading, subheading, body, label, mono, button. Batch 05 added `text-style-hero-button` and `text-style-cta` to `cn.ts` by hand; fold them into the generated list.
  - Include the DS spacing, height and radius scales, so `cn("p-md", "p-lg")` dedupes.
- **Verify:** a node script calls `cn` on conflicting pairs and gets the expected merges.

## A3 — Vestigial default exports, drifted SVG copies, BaseIcon colour (WI-001, WI-025, WI-076)
- **Folders:** `src/components/{Icons,Shapes,SidebarWithHoverIcon}/**`. Also the one import line in `src/components/Menu/DropdownMenu.tsx` that WI-001 names: only that line.
- **The icon barrel `src/components/Icons/index.ts` is GENERATED.** Change `scripts/generate-icon-exports.mjs` if needed, and re-run its npm script. Don't hand-edit the barrel.
- **WI-001:** remove the 74 default exports; switch in-repo default imports to named. Story files keep `export default meta`.
- **WI-025:** delete `src/components/Shapes/svgs/`. Check whether it holds the maintainer's new `eightleafclover.svg`. If it does, or if anything imports from the folder, keep that file and report it.
- **WI-076:** BaseIcon's `color` prop drives `currentColor`; drop the per-icon fill re-wiring.
- **Scoreboard:** m10 (default exports) should fall to about 0.

## A4 — Toast exit animation, description colour, plus the fancy-toggle reuse (WI-096, WI-100, follow-up)
- **Folders:** `src/components/Toast/**` and `src/components/Toggle/{Toggle.tsx,FancyToggleSwitch.tsx}`.
- **WI-096:** every provider-rendered toast plays its exit animation and is removed on `animationend`, not on a 200ms timer.
  - **Caution:** reduced motion sets overlay durations to 1ms via the global rule, and `animationend` still fires at 1ms. Confirm that `animationend` fires in the reduced-motion case too, by reading the CSS.
- **WI-100:** move the prominent description colour into ToastDescription, keyed off `data-variant` on ToastRoot.
- **Follow-up (maintainer asked for maximum reuse so the two toggles don't drift):** batch 05 copied ToggleSwitch's "single mode can never be cleared" rule (~8 lines) into FancyToggleSwitch.
  - Extract it into ONE shared internal helper, e.g. a small hook or function in `src/components/Toggle/`, and use it from both. Same for any other duplicated selection logic you find.
  - Update both header contracts. Each currently says the two must change together; they now share code instead.
  - Behaviour must not change.

## A5 — Behaviour bugs: VerificationCodeInput entry, Input `aria-invalid`, ProgressIndicator dot (WI-110, WI-111, WI-069)
- **Folders:** `src/components/{VerificationCode,Input,ProgressIndicator}/**`.
- **WI-110:** sequential entry, so a digit always lands where it shows, and focus never sits past the first empty cell.
- **WI-111:** Input's `hasError` sets `aria-invalid` on its `<input>`.
- **WI-069:** the flat ProgressIndicator uses `getWavyTrackGeometry` and omits the track when it returns null.
