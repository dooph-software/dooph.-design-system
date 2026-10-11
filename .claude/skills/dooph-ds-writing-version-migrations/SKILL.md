---
name: dooph-ds-writing-version-migrations
description: Use when the maintainer asks for the migration skill for a new major of @dooph-software/design-system, or asks whether a release needs one; when creating or amending skills/dooph-design-system-vN-migration/ or its codemod.mjs; or when a breaking change turns up that the CHANGELOG [Unreleased] breaking list or an existing migration skill does not cover.
---

# Writing a version migration skill

A migration skill is what a consuming project's agent follows after installing a new major. Every item in it comes from a mechanical diff of two built trees (the last release tag and the release candidate), reconciled against the CHANGELOG `[Unreleased]` breaking list. Every fix in it must compile against the candidate's build.

**Use when** the maintainer asks for it, right before they cut a major. **Not for** minor or patch releases, which never get one, or for cutting the release.

## Rules

1. **Start only when asked. Never run `npm version`, `prep-release:*`, tag, publish or commit, and never edit `package.json` `version` by hand.** *Prevents:* a version, or a skill, the maintainer did not choose.
2. **Inventory by diffing built trees, never from memory or change records.** Use two scratch worktrees, `npm ci && npm run build` in each, extract each with `scripts/surface.mjs`, then diff with `scripts/surface-diff.mjs`. Never build in the main checkout: the build rewrites tracked files. *Prevents:* unannounced breaks.
3. **Reconcile every diff line against the breaking list, in both directions.** Under-claims are breaks the list omits or calls minor. Over-claims are "breaks" in things never released: judge each one against the tag. *Prevents:* missed fixes, and phantom ones.
4. **Prove compile-time breaks with a TypeScript probe** against both trees' `dist/`. *Prevents:* guessing. A props type that became a union breaks `interface X extends ButtonProps`; one that became an intersection does not.
5. **Write each breaking item as before → after → consumer fix, and compile the fix against the candidate's `dist/`.** *Prevents:* a migration step that is itself an error.
6. **Hunt for the breaks the diff cannot see:** throws, ARIA roles, defaults, layout, and values behind unchanged class names. *Prevents:* silent runtime breaks.
7. **A codemod applies only renames that render identically. Everything else it reports as file:line, and its exit code means "work pending".** *Prevents:* guessed redesigns, and CI gates that pass before any work is done.
8. **Re-verify every older migration skill against the candidate.** It ships in the new package, and a consumer two majors back reads it before yours. *Prevents:* a chain that ends on names that no longer exist.
9. **Write for the consumer:** no repo paths, no maintainer skills, and a description that says when it stops applying. `init-skills` copies all of `skills/` and never deletes. *Prevents:* dead links, and a skill that triggers forever.

## Quick reference

| Step | Where |
|---|---|
| Inventory: worktrees → build → extract → diff → triage | [surface-diff.md](references/surface-diff.md) §1–4 |
| Reconcile with the CHANGELOG; probes | surface-diff.md §5–7 |
| Does it need a skill? How it ships; its shape | [migration-skill-shape.md](references/migration-skill-shape.md) §1–3 |
| Token-rename and prop-change playbooks | migration-skill-shape.md §3 |
| Codemod and its fixture test | migration-skill-shape.md §4 |
| Older skills: forward note, re-verify, chain test | migration-skill-shape.md §5 |

## Common mistakes

| Tempting thought | Reality |
|---|---|
| "The CHANGELOG lists the breaks." | Records mislabel breaks in both directions. The diff and the probes settle it. |
| "Interface became a type, so `extends` breaks." | Only for a union. Probe it. |
| "`color` is still `string`." | The checker collapses `DsColor` to `string`. The renames are in the `DS_COLOR_TOKENS` keys, and an old name still compiles. |
| "These utilities vanished from `styles.css`; list them." | Generated ones are not consumer surface (a class no `src/` file writes is a leak). Hand-written ones in `src/styles/` (`h-button` …) are. |
| "tsc passes, so we're done." | Token overrides and colour strings fail silently. Grep for the removed names, and look. |

## Verify

1. Every diff line has a verdict. Every breaking item has before, after and a fix that compiles against the candidate.
2. Each codemod passes its fixture test, and the chain of migration skills compiles on the candidate.
3. `npm run lint` passes.
4. Remove the worktrees (`git worktree remove --force`). Hand back inventory, verdicts and open questions. The maintainer reviews, commits and cuts the release.

## Related

dooph-ds-codebase-map (the build and the Tailwind source scope), dooph-ds-editing-tokens (how token names map to theme keys), and the shipped dooph-design-system-usage and dooph-design-system-theming.
