# Overnight run — progress (started 2026-10-03, COMPLETE 2026-10-04)

**FINAL:**
- Plan: 95 items in `review` (done, awaiting commit), 23 `deferred(docs pass)`, 7 `todo (needs maintainer)` (see Morning list), 2 `blocked(maintainer: cut v6)`, 4 dropped.
- Scoreboard: every target metric is 0. "use client" files 40→27; JS timers 8→5.
- Nothing committed. Per-batch patches are in `_work/patches/` (00 … 06F), and `git apply -R` backs one out.

The resume point if the session is cut off. Pick the first batch not marked DONE.

**Infrastructure**
- Agent rules: `_work/agent-rules.md`.
- Per-agent change records: `_work/changes/*.md`, merged into CHANGES.md after each batch.
- Per-batch patches: `node docs/audit/_work/scratch/snap-tree.mjs NN-name` → `_work/patches/NN-name.patch`. Nothing is committed; `git apply -R` backs a batch out.
- Story measurement (one line in the manager page): `(0,eval)(await fetch("/@fs/C:/Users/stick/Github/dooph/dooph-Design-System/docs/audit/_work/scratch/story-snapshot.js").then(r=>r.text()))`. Snapshots also persist in IndexedDB via `__idb("readwrite", tag, data)` once defined (see the batch 01 notes). Originally: load `_work/scratch/story-snapshot.js` into the Storybook manager page; `__snapRun(tag)` / `__diffSummary(a, b)`.
- Scoreboard: `node docs/audit/_work/scratch/scoreboard.mjs [--record note]`.

**Per-batch gate:**
1. Lint exits 0.
2. The all-stories snapshot diff contains only the expected changes.
3. No scoreboard number rises.
4. The change record is merged into CHANGES.md.
5. The status board is updated.
6. The patch is saved.

| # | batch | agents / files | status |
|---|---|---|---|
| 00 | pre-overnight state (fixes + token pass) | — | DONE (patch 00) |
| 01 | Motion scale | brief 01-motion.md | DONE: patch 01-motion; scoreboard m1 102→0; WI-058/063/064/070 → review, WI-082 motion part |
| 02 | Callbacks, themeInverse, Calendar/DatePicker guards | agent A + finisher | DONE (patch 02-03-conventions; m9 7→0) |
| 03 | Const renames, colour lookup, public surface | agent B + finisher + orchestrator unblock | DONE (same patch; ds-disabled-control kept until WI-067) |
| 04 | `"use client"`: stamping fix (WI-033) + scarce policy (WI-037) | agent C | DONE (patch 04-use-client; m7 40→28; RSC root import FAIL→OK). The agent stalled after its last step; the work was complete |
| 05 | New components: Button medium/big · Hero CTA shapes · spinner (CSS rebuild WI-050 + star) · slider tall step · Fancy toggle | 5 parallel agents | DONE (patch 05-components). Verified in Storybook: Button big/medium 54/46, pill, 16px label; CTA clover/puff, 24/28 semibold, 60 gap, 16 pill padding; spinner CSS-only (flat 1800ms, spokes/star per-size), star in box; slider tall dot 10×6 animating 200ms; fancy toggle 54/2px/12 gap, selected not interactive. All-stories diff shows only the touched families. m2 19→18, m8 8→6 |
| 06A | Wave A: asChild + OutlineButton handlers (A1) · cn registration (A2) · default exports, svgs, BaseIcon colour (A3) · Toast exit/description + fancy-toggle shared logic (A4) · VerificationCode entry, Input aria-invalid, PI dot (A5). Brief _work/briefs/06-wave-a.md | DONE (patch 06A-wave-a). Default exports 74→0, JS timers 6→5. Snapshot: only new stories plus the PI track fix. Toast exit verified live |
| 06B | Wave B: Modal/Sheet (B1) · Table (B2) · Slider/LPI/CopyButton/CTA types (B3) · Menu family (B4) · AIChat + Checkbox (B5). Brief _work/briefs/06-wave-b.md | DONE (patch 06B-wave-b). Snapshot: only new stories plus the Table role wrapper |
| 06C | Wave C: token sweep m2/m3 (C1) · shapes factory (C2) · AnimatedText (C3) · build/packaging/licence (C4) · Calendar refs + a11y labels (C5). Brief _work/briefs/06-wave-c.md | DONE (patch 06C-wave-c). m2 18→0, m3 →0 (zero resets no longer counted; audited baseline 28 under that rule), m7 →27. Snapshot: no layout or colour change |
| 06D | Wave D (3 agents) | DONE (patch 06D-wave-d). Focus rings m5 3→0; disabled helpers consolidated; IconSize; icon/shape refs; Sticker gap fix; orchestrator follow-ups applied |
| 06E | Wave E (3 agents, resumed once after the usage limit) | DONE (patch 06E-wave-e). One ref hook; every component forwards refs; comments, dead CSS and stories swept |
| 06F | Wave F (3 agents) | DONE (patch 06F-wave-f) |

## Morning list (needs the maintainer)
- **EightLeafCloverShape:** its exported `EIGHT_LEAF_CLOVER_SHAPE_PATH` still held the FOUR-leaf path; the eight-leaf path was only inline in the JSX. Batch 05b pointed the constant at the drawn path, so the render is identical and MorphRotationShape now morphs to the right shape. Please glance at it.
- **Hero CTA big min content width:** the code keeps 350px; Figma's frame says 330px. Which one?
- **Hero CTA label:** done as a `.text-style-cta` class. There is no `TextVariant.cta` / `CTAText` component. Want one?
- **Fancy toggle calls where Figma is silent:**
  - the whole option dims when disabled (Figma dims only the label);
  - a disabled selected option keeps its prominent paint;
  - in multi mode a selected option can be clicked to deselect, with no hover look.
- **Fancy toggle selection modes:** my "same as ToggleSwitch" default was based on a wrong premise. ToggleSwitch is single-select only, but FancyToggleSwitch also offers multi (`FancyToggleSelectType`), which duplicates `DropdownMenuSelectType`'s values. Keep multi? Share one select-type const?
- **Fancy toggle reuse:** the "single mode never clears" rule is copied into FancyToggleSwitch, not shared with ToggleSwitch. A shared helper is queued in wave A.
- **Star spinner speed:** it uses the spokes rate. Want its own token? Default colour is code `primary` vs Figma `text-primary`.
- **eightleafclover.svg:** wave A deleted the drifted shape SVG copies (`Shapes/svgs/`). Only your untracked `eightleafclover.svg` is left there. Nothing references it; delete it too?
- **Table header labels:** the Header, CellStackedContent and Placeholder stories now show header labels in the button text style instead of BodyText (the audit's consistency finding F-074). Same size, different font and weight. Check that this is the look you want.
- **Chat header contracts:** per the plan item, ChatDivider and UserMessageHeader headers went from `## behavior/## constraints` blocks to plain prose. The rules are still written, but only `## constraints` is protected by AGENTS.md, and UserMessageHeader's "NOT sticky" rule is a real decision. Keep the prose form (commit it separately, per AGENTS.md) or restore the constraint heading?
- **AIThinkingEffortSelector** now THROWS on a `value` that isn't in `steps` (the plan item). Your Calendar decision was "render nothing". Same treatment here, or throw? The throw breaks renders that used to work, so it belongs on the v6 list either way.
- **Look-changing plan items, not done overnight; each needs your call:**
  - dark alias tokens in nested `.dark` regions (WI-061), four needless `.dark` re-declarations (WI-073), and a danger focus-shadow token (WI-077), all of which may fold into your dark overhaul;
  - HeartFillIcon redraw on the 24 grid (WI-072);
  - chat-prose headings matching the text-style roles (WI-079);
  - PopoverContent getting the shared floating-panel look (WI-112);
  - both loaders sharing one default size `rg` (WI-113).
- **Scoreboard rule change (FYI):** numeric spacing no longer counts `p-0` / `m-0` resets, which have no DS token. Re-measured baseline: 28.
- **Story renames left alone** (they change story URLs): `Brand` / `Error` stories (e.g. Toast Brand/Error, Input/VerificationCode Error) and two `IconSizes` stories. Rename them?
- **SplitButton look (wave F, WI-084):** the parts now use the secondary button recipe. The border is now the secondary border (was the primary one), hover and press change the border, and disabled / aria-disabled get the secondary disabled paint. Padding, gap, corners and the group wrapper are unchanged. Check it in Storybook.
- **Ghost foreground** (from 2026-10-03): kept shared; review it in Storybook.
- 2026-10-04: an agent ran `taskkill` on all node.exe processes (now forbidden by agent-rules §11). The maintainer was told.
