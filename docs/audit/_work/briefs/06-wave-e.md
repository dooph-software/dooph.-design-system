# Wave E — plan items, three agents in parallel (each takes ONE section)

The preamble is identical to `docs/audit/_work/briefs/06-wave-a.md`. Read that file's preamble (above its first `---`) and follow it: rules, drift protocol, docs deferred, look-change rule, record format, no Storybook or build, hand-back ≤15 lines. Do not use the Browser pane. Verify with lint, node/esbuild scripts in your scratchpad, and type probes. Write your record as you go: usage limits have cut agents off before.

Waves A–D are done, including:
- motion scale, `cn` scales, token sweep;
- shapes factory; dialogShell; asChild;
- focus and disabled helpers everywhere;
- IconSize; icons and shapes forward `ref`;
- folder indexes for LoadingSpinner, ProgressIndicator and WavyDivider.

**Shared files.** E1 and E2 may touch the same component file: E1 changes code, E2 changes only comments. Use small anchored Edit calls, never Write on a component file. If an edit fails because the file changed, re-read and retry.

Change record: `docs/audit/_work/changes/06E<n>-<name>.md`.

---

## E1 — Element access: one `useComposedRefs`, `forwardRef` + rest props everywhere (WI-099 → WI-107)
- **Files:**
  - new `src/utils/composeRefs.ts` (or the name WI-099 gives);
  - `src/components/{AIChat,Input,OutlineButton,DropdownTrigger,HotkeyIndicator,MorphRotationShape,ShapeMorphSpinner,SplitButton}/**`, code only.
- **WI-099:** replace the four hand-rolled ref merges with one memoized internal hook. It must not add a `"use client"` file without need: put it where an existing client module already is, or justify it under agent-rules §6.
- **WI-107:** `forwardRef` plus rest props for HotkeyIndicator, MorphRotationShape (composing its own internal ref), ShapeMorphSpinner and SplitButton. The element-access RULE text is deferred to the docs pass.
- **Unchanged output:** markup must stay byte-identical for existing usage. Prove it with a before/after render.

## E2 — Comments, stale descriptions, dead CSS (WI-010, WI-017, WI-026, WI-029, WI-078, WI-088)
- **Files:**
  - comments and JSDoc anywhere in `src/`;
  - `scripts/sync-theme.mjs` (comments only);
  - for WI-026, WI-029 and WI-078: `src/styles/*.css` and token or comment moves, as each WI says.
- **No behaviour change.** WI-078 touches real CSS (dead rules, the ToastClose override). Prove with a Tailwind compile in your scratchpad that only the dead rules disappear.
- **WI-026** also asks for code nits: stray destructures, redeclared props, `Error` story names, the unprefixed `--slider-pct`. Do the code nits only in files E1 doesn't own, and report the rest.
- **Re-derive every comment from the CURRENT code.** Much has changed since the audit, and a WI's replacement text may itself be stale now.

## E3 — Stories (WI-004, WI-020, WI-121)
- **Files:** `src/**/*.stories.tsx` ONLY, plus `.storybook/**` if WI-004 needs it.
- **WI-004:** import Storybook types from the declared `@storybook/react-vite` everywhere. Do it with ONE deterministic script under `docs/audit/_work/scratch/waveE/`, with `--verify`.
- **WI-020 / WI-121:** the story sweep and story hygiene. Use DS components instead of raw elements, no removed spellings, a contradicting story for each uncovered override, DS icons and text roles, no duplicate or dead stories.
  - Many stories have changed or been added since the audit. Apply the rules to the current stories, and don't rename existing story exports: that changes their URLs. Two stories named `IconSizes` stay.
  - Stories are also edited by E1/E2 rarely. Use small anchored edits.
