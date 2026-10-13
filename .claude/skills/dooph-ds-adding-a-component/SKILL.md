---
name: dooph-ds-adding-a-component
description: Use when adding a new component, a new member of a component family, or a new Radix wrapper to the dooph design system, or when creating a folder under src/components/, a constants.ts, a barrel index.ts, an export line in src/index.ts, or the first *.stories.tsx for something that does not exist yet.
---

# Adding a component

A new component is one change: the component file, a server-safe
`constants.ts` when it has discrete options, the folder's `index.ts`, one line
in `src/index.ts`, and stories. It is finished when
`npm run lint` exits 0 and the hand-back below is filled in. Type-checking alone
is not "passes".

**Not for** changing an existing component (dooph-ds-writing-components) or
tokens (dooph-ds-editing-tokens).

## Procedure

1. **Spec first.** Read Figma only through a live Figma MCP; if it is expired
   or failing, STOP and tell the maintainer to reconnect it. Never guess a
   design value: list each unknown as an open question in the hand-back.
   *Prevents:* invented values.
2. **Pick the base.** Reuse DS parts (Text components, Button, Shapes, Popover)
   and Radix primitives (`import * as XPrimitive from "@radix-ui/react-x"`). A
   primitive missing from package.json `dependencies` is a new dependency for
   every consumer: add it only with the maintainer's go-ahead, and report it.
   *Prevents:* hand-rolled behaviour, unapproved dependencies.
3. **Choose the folder.** A standalone component gets `src/components/<Name>/`.
   A member of an existing family goes in that family's folder and barrel
   (FancyToggleSwitch is in `Toggle/`).
   *Prevents:* two homes for one family.
4. **Write the files** from [references/file-templates.md](references/file-templates.md).
   No `.css` in the component folder: the build compiles only
   `src/styles/build.css`, which imports `index.css` (placement:
   dooph-ds-styling). *Prevents:* styles
   that never ship: emit-css compiles only `src/styles/build.css`.
5. **Export it.** The barrel names the component, its `*Props` type and its
   consts; `src/index.ts`, the only package entry, gets
   `export * from './components/<Name>';`. *Prevents:* a component no consumer
   can import, missing from `components.md`.
6. **Stories** (`*.stories.tsx`, beside the component): `Default`; every
   variant (one story each, or an `AllVariants` grid); each state, `Disabled`
   included; `Controlled` for a value control; `Practical` for an expressive
   detail. Stories use the same tokens as components, and lint scans them
   for spacing, arbitrary px/rem/em/deg and hex. A demo frame size no token
   describes goes in `style={{ width: … }}` with a short comment.
   *Prevents:* a variant or state nobody has seen render.
7. **Header contract: decide, don't default.** Write one only when the file
   carries an invariant a reasonable edit would break (CTAButton: the shape is
   fixed per size; an expressive detail always gets one, see dooph-ds-styling).
   Most files have none. Every line must be true of the code you wrote.
   *Prevents:* a false contract that later agents obey.
8. **Allowlists are decisions.** A module that truly needs `"use client"` or a
   JS timer gets an entry in `scripts/check-conventions.mjs` (use-client:
   `reason` + `needs`; timers: `reason` + `count`; the rule:
   dooph-ds-writing-components). Report it; never add one just to pass lint.
9. **CHANGELOG:** one line under `## [Unreleased]` → `### Added`. Never bump
   `version`. *Prevents:* a release that ships a component nobody announced.
10. **Verify, in order:** `npm run sync-tokens` (if you changed tokens or
    a `.text-style-*`/`.h-*`/`.size-*`/`.min-w-*` … rule) → `node scripts/generate-docs.mjs` → `node
    scripts/sync-skills.mjs` (generate-docs rewrites the codebase-map skill's
    inventory, so the skill mirrors go stale) → `npm run lint` → every story
    in Storybook (`npm run storybook`). *Prevents:* handing back with lint red
    on stale docs or mirrors.

## Quick reference

| Need | Where | Lint check that guards it |
|---|---|---|
| Option values | `constants.ts`, const + same-named type, no directive | "variant constants named *Type"; "size keys named default or small"; "\"use client\" outside its allowlist" |
| Named exports only | `<Name>.tsx`, `index.ts` | "default exports in component modules" |
| Props documented | first JSDoc sentence → components.md | "generated doc references out of date" |
| Story text | Text components | "text-style classes outside Text components" |

## Rationalizations

| What baseline agents said | Reality |
|---|---|
| "Clean type-check." / "Type-check passes." | `tsc` is half of lint. Both runs had lint red (numeric spacing; a stale generated theme). |
| "All clean." (after `npx tsc --noEmit` only) | Lint failed on `text-style-label` and a raw `var(--ui-*)` class. |
| "Everything passes — type-check and build are clean" | A build is not lint: it failed on a hex colour and a `setInterval`. |
| Header: "`children` is reserved for the label content" | The component never read `children`. A contract must describe the code. |

**Red flags:** a report with no lint line; a value kept because it "follows the
pattern" and not reported; a header line you have not checked against the code.

## Hand-back (fill every slot; "n/a" needs a reason)

```
Lint:              npm run lint → exit 0, "conventions: N checks passed"
                   (a FAIL line only with the reason it is blocked)
Generated docs:    node scripts/generate-docs.mjs → <files it wrote>
Skill mirrors:     node scripts/sync-skills.mjs → <lines it printed> (always: the inventory changed)
Stories:           <each story name and what it shows>
Header contract:   <written: the invariant | none: why no invariant>
Design decisions:  <each value or behaviour you chose, what else it affects, open questions>
New dependency / allowlist entry: <name and reason | none>
```

## Related skills

dooph-ds-writing-components (API, refs, Text components, consumer-owned data),
dooph-ds-styling, dooph-ds-editing-tokens, dooph-ds-codebase-map (inventory,
build, Storybook).
