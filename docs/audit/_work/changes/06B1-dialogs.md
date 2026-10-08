# 06B1 — Modal & Sheet: portal escape hatch, one shared dialog shell

Checklist
- [x] Scoreboard before
- [x] Harness: esbuild bundle of src → scratch build root, run wi-c6-03-check / wi-c6-06-snapshot
- [x] WI-095 portal / portalProps on ModalContent + SheetContent (+ stories)
- [x] WI-098 internal dialogShell.tsx
- [x] lint, type probes, scoreboard after

Harness (no build in checkout, no worktree): `esbuild` bundles `src/components/{Modal,Sheet}` to
`<scratch>/b/dist/index.cjs` (packages external, `b/node_modules` is a junction to the repo's),
so the audit's `wi-c6-03-check.cjs` / `wi-c6-06-snapshot.cjs` run unchanged against it.

## Modal and Sheet content can skip the portal or target a container [WI-095, F-030]
- files: `src/components/Modal/Modal.tsx`, `src/components/Sheet/Sheet.tsx`,
  `src/components/Modal/Modal.stories.tsx`, `src/components/Sheet/Sheet.stories.tsx`
- what changed: `ModalContent` and `SheetContent` take `portal` (default `true`) and
  `portalProps` (passed to Radix `Dialog.Portal`: `container`, `forceMount`), like Tooltip,
  Popover and DropdownMenu content. `portal={false}` renders the overlay and panel in place.
  The overlay and panel go to the portal as two children (never one Fragment), so Radix
  Presence keeps its ref and the exit animation still plays. New exported types
  `ModalContentProps`, `SheetContentProps`. Class lists unchanged. New story "Custom Container"
  in Overlays/Modal and Overlays/Sheet.
- consumer impact: can mount a dialog into a shadow root / iframe / themed wrapper, or render
  it in place; default output is the same tree as before.
- breaking: no
- verified: `wi-c6-03-check.cjs` before = `FAILURES: 3` (the three `portal={false}` cases render
  ""), after = `ALL PASS`. Snapshot Overlay/Title/Description lines byte-identical before/after.
- docs owed: CHANGELOG `[Unreleased]` → Added: "`ModalContent` and `SheetContent` accept
  `portal` (default `true`) and `portalProps`, like the other overlay contents;
  `ModalContentProps` and `SheetContentProps` are exported." `.agents/skills/dooph-ds-codebase/SKILL.md`
  Modal and Sheet rows: `` `withOverlay` bool `` → `` `withOverlay` bool; `portal` (default true) /
  `portalProps` escape hatch ``. `skills/dooph-design-system-usage/references/responsive-sheet-modal.md`
  props cell: "both have `withOverlay`, `portal` and `portalProps`".

## Modal and Sheet share one internal dialog shell [WI-098, F-083]
- files: new `src/components/Modal/dialogShell.tsx`; `src/components/Modal/Modal.tsx`,
  `src/components/Sheet/Sheet.tsx`
- what changed: the backdrop base, the panel surface (surface colour, border style/colour,
  shadow, overflow, focus reset), the portal-or-in-place logic, and the title/description
  styling now live once in `dialogShell.tsx` (`DialogShellOverlay`, `DialogShellContent`,
  `DialogShellTitle`, `DialogShellDescription`). Every public Modal/Sheet part is a thin
  `forwardRef` wrapper with its old name, props type and `displayName`. Motion classes stay in
  Modal.tsx / Sheet.tsx on the exact batch-01 helpers (`ds-motion-overlay-dialog`,
  `ds-motion-overlay-sheet`), so timing is unchanged. `sheetVariants` dropped the three surface
  strings the shell now owns. JSDoc on SheetOverlay and sheetVariants now points at the shell
  (the stale "durations" wording went with it). No `"use client"` (Modal.tsx/Sheet.tsx have none;
  the shell uses no hooks or handlers). The shell is not re-exported from `Modal/index.ts` or
  `src/index.ts`. Also moved `ModalContentProps` / `SheetContentProps` above the component JSDoc
  so the "Raw modal/sheet primitive" doc stays on the component.
- consumer impact: none visible. Class token order inside ModalContent/SheetContent's `class`
  attribute changes (surface classes first); the set is identical and the consumer `className`
  still merges last.
- breaking: no
- verified: `wi-c6-06-snapshot.cjs` (22 cases: every part, each Sheet side, with/without overlay,
  with/without consumer className; sorted classes, ids stripped) run before and after this item →
  `diff` empty; all 22 lines non-empty. `wi-c6-03-check.cjs` still `ALL PASS`. Outside stories,
  `bg-modal-surface`, `bg-modal-backdrop`, `text-style-heading text-text`,
  `text-style-body text-text-secondary` appear exactly once each under Modal+Sheet, all in
  `dialogShell.tsx`. Type probe (scratch tsc against `src/index`): `<ModalContent portal={false}>`,
  `<SheetContent portalProps={{ container: null }}>`, `forceMount`, both Props types compile;
  `@ts-expect-error` holds on `Lib.DialogShellContent` (not public) and on `overlay` passed to
  ModalContent. `npm run lint` exit 0. Scoreboard identical before/after.
- not verified here (orchestrator, Browser pane): Storybook Overlays/Modal › Default and
  Overlays/Sheet › Right/Left/Top/Bottom open/close look and motion; dialogs are direct children
  of `body`; no "Invalid prop `ref` supplied to `React.Fragment`" console error; Escape leaves
  `[role=dialog]` mounted with `data-state="closed"` during the exit; the two "Custom Container"
  stories mount `[role=dialog]` inside `[data-testid=modal-container]` / `sheet-container` and Tab
  stays trapped. No dist build was made (rule 7), so the `dist/*.d.ts` greps were replaced by the
  type probe above.
- docs owed: `.agents/skills/dooph-ds-codebase/SKILL.md`: after the `SheetTitle`, `SheetDescription`
  row add `| (internal) DialogShell* | Modal/dialogShell.tsx | shared backdrop base, panel surface,
  portal-or-in-place shell, title/description; not exported — Modal and Sheet wrap it |`, and the
  architecture skill's "copy Modal.tsx" advice should mention the shell. No CHANGELOG line.

## DONE
