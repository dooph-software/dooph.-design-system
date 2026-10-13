## Source of truth

The code and the skills (`.agents/skills/`, `skills/`) are the only source of truth about this repo. `docs/future/` holds proposals, never instructions. Nothing in `docs/audit/` is current guidance.

## File contracts

Some source files open with a block comment stating `## behavior` and
`## constraints`. Read it before editing that file.

- A constraint names a rule and the failure it prevents. If your change
  contradicts one, stop and raise it — do not edit around it. Removing a
  constraint is its own commit, with the reasoning stated.
- A constraint's wording is not a loophole. If your change only complies under a
  reading you had to construct — a narrower scope, an exception a qualifier seems
  to allow — then it contradicts the constraint. Raise it instead.
- Leaving a task undone because it contradicts a contract is a complete result,
  not a failure. Report it as the outcome, plainly, without apologizing for it.
- If your change alters behavior the header describes, update the header in the
  same commit. Code and contract ship together or not at all.
- Do not add a contract to a file that has none unless it now carries an
  invariant a reasonable edit would violate.
- A line that looks pointless in a file with a contract is presumed load-bearing.
  Check the header before deleting it.

## Guardrails (load the skill first; `$name` = `.agents/skills/<name>/SKILL.md`)

- Text always renders through a Text component (`as` for roots), never a bare element or font utility: `$dooph-ds-writing-components`.
- The DS owns no data, fetching, timers or control; state arrives as props. Asked for a component that fetches or polls, build the presentational part and hand the app the polling code: `$dooph-ds-writing-components`.
- `"use client"` only when the module itself needs it, never on `constants.ts` or a thin Radix wrapper: `$dooph-ds-writing-components`.
- No hard-coded colour, spacing, radius, shadow or motion value; every value comes from a token, and every flourish on a practical component must switch off under the practical preset: `$dooph-ds-styling`.
- Dark-only values are `.dark` token lines in `src/styles/tokens.css`, nowhere else: `$dooph-ds-editing-tokens`.
- Changing a token's value means listing its dependents, updating every comment that restates the old value, and flagging in the hand-back (never rewording away) any sum that no longer balances: `$dooph-ds-editing-tokens`.
- A new component is one change: files, constants, exports, stories, lint: `$dooph-ds-adding-a-component`.
- Find where a file lives, and whether it is generated, before editing it: `$dooph-ds-codebase-map`.
- Spinner and progress geometry stays plain numbers in TypeScript; every clock stays in CSS tokens: `$dooph-ds-loading-indicators`.
- Write a migration skill only when the maintainer asks, from a diff of built trees: `$dooph-ds-writing-version-migrations`.
- Surface every design decision in the hand-back (a value the spec left open, a comment whose sum no longer balances); never decide silently: `$dooph-ds-writing-components`.

## Before you hand back

Run `npm run lint` (`tsc --noEmit`, then the convention checks in `scripts/check-conventions.mjs`, which also fail on any stale generated file below) and paste its result. It must exit 0. Type-checking alone is not passing.

## Generated files — never hand-edit

| File | Generator |
|---|---|
| `src/styles/index.css` between the `__GENERATED_THEME_*__` markers; `src/styles/theme.css`; `src/utils/twMergeTheme.ts` | `npm run sync-tokens` (`scripts/sync-theme.mjs`) |
| `src/components/Icons/index.ts` | `npm run generate-icon-exports` |
| `src/styles/tokens.css` between the `__SHAPE_MORPH_EASE_*__` markers | `npm run generate-shape-morph-ease` |
| `skills/dooph-design-system-usage/references/components.md`; `skills/dooph-design-system-theming/references/token-contract.md`; `.agents/skills/dooph-ds-codebase-map/references/inventory.md`; the marked block in `skills/dooph-design-system-setup/references/client-references.md` | `node scripts/generate-docs.mjs` |
| `.claude/skills/`, `.agent/skills/` | `node scripts/sync-skills.mjs` |

## Skill mirrors

Edit skills in `.agents/skills/` only, then run `node scripts/sync-skills.mjs`; it overwrites any edit made in a mirror.

## Never

- Commit, push or tag unless the maintainer asks.
- Change the `package.json` version or run `npm version` / `prep-release:*`. The maintainer cuts releases.
- Run `npm run build`, `build:watch` or `prepublishOnly` in the main checkout: they rewrite tracked files and run no lint. Build in a scratch worktree.
