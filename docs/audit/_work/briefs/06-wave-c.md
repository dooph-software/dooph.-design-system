# Wave C — plan items, five agents in parallel (each takes ONE section)

The preamble is identical to `docs/audit/_work/briefs/06-wave-a.md`. Read that file's preamble (above its first `---`) and follow it: rules, drift protocol, docs deferred, look-change rule, record format, no Storybook or build, hand-back ≤15 lines. Do not use the Browser pane; the orchestrator is using it. Verify with lint, node/esbuild scripts in your scratchpad, and type probes.

Waves A and B are done, among them:
- asChild; `cn` scales (generated `src/utils/twMergeTheme.ts`); no default exports; Toast exits on `animationend`;
- Modal/Sheet portal plus `dialogShell.tsx`; Table roles; Slider types and keyboard;
- Menu submenu parts and the HotkeyIndicator `menu` variant; AIChat parts; Checkbox pressed state.

Change record: `docs/audit/_work/changes/06C<n>-<name>.md`.

---

## C1 — Token sweep: numeric spacing and arbitrary px → DS tokens, plus OutlineButton tokens (WI-059, WI-060, WI-082's remaining part)
- **Files:** every component file the three WIs name, plus `src/styles/{tokens.css,index.css,dooph-component-tokens.css}` and `scripts/sync-theme.mjs` (EXCLUDED only). Scoreboard m3 and m2 list the worst offenders.
  - **Avoid** `src/components/{Shapes,MorphRotationShape,ShapeMorphSpinner,DropdownCaret,AnimatedText,Calendar,DatePicker}/**` and VerificationCodeInput.tsx: other agents own those. If a WI hit is in one of them, report it.
  - `CodeDigitInput.tsx` is yours.
- **Spacing names changed since the WIs were written.** The scale is now `xxxs` 2, `xxs` 4, `xs` 6, `sm` 8, `rg` 10, `md` 12, `lg` 16, `xl` 20, `xxl` 26, `xxxl` 42.
  - Map each numeric utility by PIXEL VALUE, e.g. Tailwind `gap-2` = 8px → `gap-sm`; `px-3` = 12px → `px-md`.
  - Replace a value ONLY when a DS token has exactly the same px, so there is zero visual change.
  - A value with no exact token needs a new component token, used through a `ds-*` helper as WI-060 describes; never an arbitrary value.
  - Do the mechanical replacements with ONE deterministic script (old → new table, word-boundary safe), saved under `docs/audit/_work/scratch/waveC/`, with a `--verify` mode. That is the maintainer's rule for repo-wide renames.
- **WI-082's remaining part:** OutlineButton's orb paint and box geometry become `--ui-outline-button-*` tokens read by `ds-*` classes. Its orb timing is already on the motion scale.
- **Target:** scoreboard m2 (arbitrary px) and m3 (numeric spacing) fall to 0. Report the before → after for each.

## C2 — Shapes: key-based MorphRotationShape, one `createShape` factory (WI-034 → WI-115)
- **Folders:** `src/components/{Shapes,MorphRotationShape,ShapeMorphSpinner,DropdownCaret}/**`.
- **Shapes already changed:**
  - there are now 13 shapes: the maintainer added EightLeafCloverShape, exporting `EIGHT_LEAF_CLOVER_SHAPE_PATH`;
  - `ShapeProps.size` became `number | string` (batch 05b);
  - default exports are gone;
  - BaseIcon / BaseShape colour handling changed in wave A.
- **The factory must produce byte-identical SVG** for every shape, except the vestigial clipPaths the WI removes. Prove it with a before/after render script.
- **WI-034** also clears the `"use client"` trigger that batch 04 deferred: function props passed to MorphRotationShape. Re-check the directive policy (agent-rules §6) for every touched file.

## C3 — AnimatedText: one change-text render shell; RollHoverText `sr-only` words (WI-031, WI-086)
- **Folder:** `src/components/AnimatedText/**`.
- **Note:** batch 01 moved these components onto the motion scale (`--ui-motion-*`) and kept their reduced-motion `transitionend` needs, which RevealChangeText's header explains. Don't regress that.

## C4 — Build, packaging, licence, tooling (WI-002, WI-005, WI-038, WI-040, WI-039)
- **Files:** `scripts/**` (but NOT `scripts/sync-theme.mjs`, which C1 owns, nor `scripts/add-use-client.mjs` except where WI-040 requires its sourcemap shift), `tsup.config.ts`, `package.json` (NEVER the `version` field; no dependency changes), `bin/**`, `.github/workflows/**`, a new `THIRD_PARTY_NOTICES.md`, and `src/utils/color.ts` comments only (WI-005).
- **Verification needs a build.** Use a scratch worktree per agent-rules §7: `git worktree add ../ds-wi-c4 HEAD`, copy the working-tree versions of the files that matter into it, then `npm ci && npm run build && npm pack --dry-run`, and compare tarball contents before and after.
  - If `npm ci` or a build hangs for more than ~5 minutes, stop it and report. Don't wait.
  - Remove the worktree when done.

## C5 — Calendar & DatePicker element access; overridable accessible names (WI-109, WI-101)
- **Folders:** `src/components/{Calendar,DatePicker}/**`, plus, for WI-101's other parts, `src/components/Toast/Toast.tsx` (closeLabel, and export `ToastOptions`), `src/components/Slider/Slider.tsx` (thumb `aria-labelledby`), and `src/components/VerificationCode/VerificationCodeInput.tsx` (`digitLabel`).
- In those three outside files make only WI-101's changes. Small anchored edits; C1 may be touching nearby class strings in other files.
- **Note:** batch 02 renamed Calendar to `value` / `onValueChange` and made invalid values render nothing; keep that.
