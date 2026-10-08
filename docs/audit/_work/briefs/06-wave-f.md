# Wave F — the last plan items, three agents in parallel (each takes ONE section)

The preamble is identical to `docs/audit/_work/briefs/06-wave-a.md`. Read that file's preamble (above its first `---`) and follow it: rules, drift protocol, docs deferred, look-change rule, record format, no Storybook or build, hand-back ≤15 lines. Do not use the Browser pane. Verify with lint, node/esbuild scripts in your scratchpad, and type probes. Write your record as you go: usage limits have cut agents off before.

Waves A–E are done:
- motion; tokens; `cn`; shapes factory; dialogShell;
- focus and disabled helpers; `IconSize`;
- every component forwards `ref`, using `useComposedRefs` in `src/utils/composeRefs.ts`;
- comment and story sweeps.

**Batch 05 added a union props type to Button:** medium/big sizes only for primary, secondary and prominent. Keep it working through any type change.

Change record: `docs/audit/_work/changes/06F<n>-<name>.md`.

---

## F1 — SplitButton (WI-084 → WI-085 → WI-117)
- **Folders:** `src/components/SplitButton/**`. For WI-117's DatePicker part, `src/components/DatePicker/DatePickerSplitTrigger.tsx` only.
- **Note:** SplitButton was given `forwardRef` + rest props in wave E. Keep that.
- **WI-084** rebuilds the parts on the secondary `buttonVariants` recipe. Compare the computed classes before and after, using `cn` output from an esbuild bundle. Report every class that changes, and why each change is a fix. If the visible look of a correct state would change, keep that state's current classes and report it.

## F2 — Types say what the runtime does (WI-030, WI-126, WI-091)
- **Folders:** `src/components/{Button,OutlineButton,ShapeButton,DropdownTrigger,Text,Sheet,Checkbox,Tabs,CTAButton}/**`.
- **Types only, no runtime change.** Prove it with a before/after render of each touched component, using the esbuild bundle.
- **Probe both directions.** Use a type probe, with `@ts-expect-error` cases, that today's valid usages still compile and that the WI's invalid cases now fail.
- **WI-126 is a v6 type-level change.** Record the before → after for the migration list.

## F3 — Constants placement, geometry helpers, type nits (WI-032, WI-071, WI-120)
- **Folders:** `src/components/{Avatar,Shapes,Slider,LinearProgressIndicator,LoadingSpinner,ProgressIndicator,Calendar,ShapeMorphSpinner,MorphRotationShape,OutlineSection}/**`, plus `src/styles/dooph-component-tokens.css` (slider and progress helpers only).
- **WI-071:** wave C may already have done part of it. C1 added `h-linear-progress` and made some geometry classes `cn`-mergeable utilities instead of `ds-*` helpers, so consumer overrides still win. Check the current state, finish what's left, and keep that override-friendly approach.
- **WI-032:** move `AvatarSize` and `Shapes` into sibling `constants.ts` files; public exports are unchanged. `Shapes` is now built with `createShape`, so keep its `satisfies` check.
- **WI-120:** the type nits as they apply now.
