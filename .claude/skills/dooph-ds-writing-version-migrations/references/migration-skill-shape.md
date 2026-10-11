# The migration skill: shape, playbooks, codemod, forward compatibility

Worked examples of the output: `skills/dooph-design-system-v3-migration/` (a SKILL.md only) and `skills/dooph-design-system-v5-migration/` (a SKILL.md plus `codemod.mjs`). Read them for their shape. Their content belongs to their own versions.

## 1. Does this major need a skill?

Decide after the reconcile, never before.

- **A skill:** at least one breaking item needs the consumer's agent to search their code or CSS, whether for a rename, a removal, a type change, a silent token or class change, or a changed default.
- **No skill:** every item is a single action with nothing to search for, such as raising a peer dependency. Propose a line in the CHANGELOG release notes that says there is no migration skill for this major, and why, so that someone upgrading across several majors knows the chain has no link here.

The maintainer makes the call. Give them the verdict and the evidence.

## 2. How it reaches consumers

- `package.json` `files` includes `skills`, so every migration skill and its codemod ship in the tarball.
- `init-skills` (`bin/init.mjs`) copies the whole `skills/` folder into the agent folders the consumer picks (`.agents/skills`, `.claude/skills`, `.agent/skills`). It merges and never deletes. An installed migration skill therefore stays forever, which is why its description must say when it stops applying.
- The consumer runs a codemod from the installed package: `node node_modules/@dooph-software/design-system/skills/dooph-design-system-vN-migration/codemod.mjs ./src`.
- Shipped skills live in `skills/`, not `.agents/skills/`, so the skill-mirror sync never touches them.
- The CHANGELOG breaking section should name the skill and tell consumers to re-run `npx @dooph-software/design-system init-skills` after upgrading. The skill cannot tell them that itself.

## 3. The SKILL.md

Folder: `skills/dooph-design-system-vN-migration/`. The slots below are REQUIRED unless marked optional.

1. **Frontmatter**:
   - `name`, matching the folder;
   - `description`: "Use when upgrading a consuming project from @dooph-software/design-system v(N-1).x to vN.x, after the new version is installed", then the symptoms a consumer would see (one per silent break), then when it no longer applies;
   - `metadata.short-description`, which both shipped skills carry.
2. **Title and opening:** how many breaking changes, which of them fail silently, and "run the codemod even if the app compiles" when there is one.
3. **Forward note** (optional at first): which skill to read next when the consumer is landing on a later major (§5).
4. **Prerequisites** (optional): anything that must hold before the steps work, such as the `theme.css` preset import.
5. **Codemod first** (optional): the command, the dry-run default, `--write`, and what its exit code means.
6. **Numbered steps, one per breaking change**, ordered token overrides → utility classes → component API. Each step gives a table of before → after (→ why), the consumer fix, and a caution for every trap.
7. **Visual changes to expect:** value and default changes that need no edit but will look different.
8. **New in vN:** additive exports, with no action. Link the usage and theming skills by name.
9. **Verify:**
   - the codemod exits 0;
   - `npx tsc --noEmit` passes;
   - grep passes for every removed name, given as a `-P` pattern plus a fallback without PCRE2;
   - a look in the browser at each silent break.
   Zero hits plus a clean build means the migration is done.

Write in the consumer's terms: paths under `node_modules/@dooph-software/design-system/`, never this repo's `src/` or scripts.

### Token-rename playbook

1. Pair each removed token with its replacement. Use the CHANGELOG item and equal values in the light and dark blocks, then confirm by reading `git log -S'--ui-old' vX.Y.Z..<commit>`. A token removed with no replacement is not a rename. Say what now produces the look, and tell the consumer to delete the line.
2. **Override table:** `--ui-old` → `--ui-new`, for each block where it appears.
3. **Utility table:** read the theme key from each tree's `dist/theme.css` line `--<key>: var(--ui-…)`. Never derive it by hand, because aliases rename keys (`--ui-color-primary-foreground` maps to `--color-primary-fg`, so the utility is `text-primary-fg`). The key's namespace gives the utility prefix: `--color-*` gives `bg-`/`text-`/`border-`, `--spacing-*` gives `p-`/`gap-`/…, and `--radius-*`, `--shadow-*`, `--text-*` and `--font-*` give `rounded-`, `shadow-`, `text-` and `font-`. A token with no theme line gets no generated utility; check the hand-written `@layer utilities` classes in `src/styles/index.css` for it (`h-button`, `size-avatar` …), which consumers use directly.
4. **Helper table:** the `ds-*` classes that appeared or vanished with the rename.
5. **Colour names:** if a `DS_COLOR_TOKENS` key changed, list `color="old"` → `color="new"`. The old string still compiles.
6. **Traps:** when an old name is a prefix of a surviving name (`--ui-color-border` beside `--ui-color-border-primary`), give the lookahead pattern (`--ui-color-border(?![-\w])`) and the `rg -P` pass. Never ask the consumer to grep for a name that is still current, or their done-check can never reach zero.
7. **Same name, new value:** this goes under "Visual changes", not in a rename table.

### Prop-change playbook

| Change | Consumer fix to write | Codemod |
|---|---|---|
| component or type renamed, same props | rename the identifier | AUTO (identifier boundaries) |
| const key renamed (`ButtonVariant.old`) | rename the key; also the string form `variant="old"` | AUTO for `Const.old`; REPORT the string form |
| prop renamed, same meaning | rename the prop | REPORT unless the old name is distinctive |
| prop or value removed | what to pass instead, or "delete it, the look is now X" | REPORT |
| props type became a union | `type X = Props & {…}` instead of `interface X extends Props` | REPORT |
| union now forbids some combinations | narrow one side (for example `Exclude<…>`) | REPORT |
| `ref` element type changed | retype callback refs | REPORT |
| default changed | pass the old value explicitly to keep the old look | REPORT the call sites with no prop, where feasible |
| meaning changed (same name, different behaviour) | explain it; there is no mapping | never AUTO |

Every row's fix goes in the fix probe (surface-diff.md §6).

## 4. Codemods

**When:** at least one rename is mechanical, frequent and identical in rendering. Do not write one for a single rare rename. Never write one for a redesign or a change of meaning.

**Shape:**
- one zero-dependency `codemod.mjs` (only `node:` imports), with a header comment that says why AUTO and REPORT are separate;
- a dry run by default, with `--write` to apply;
- an extension allowlist and a skip list (`node_modules`, `.git`, `dist`, build output);
- identifier-boundary matches (`(?<![\w$])Name(?![\w$])`), so that `NameWrapper` and `name-icon` are left alone;
- doc-comment lines are not reported.

**Exit code:**
- 1 when a dry run finds AUTO renames pending, or when a non-advisory REPORT item remains;
- 2 when the target path does not exist (do not swallow the read error);
- 0 otherwise.

Advisory REPORT lists do not fail the run. A codemod that always exits 0 makes "must exit 0" in Verify, and any CI gate built on it, pass before any work is done.

**Test it on a fixture**, a folder in the candidate worktree's `__probe__/`:
1. Put every before-name in every file type (`.ts`, `.tsx`, `.css`), plus near-miss names that must survive.
2. The dry run lists exactly the expected renames and reports, and exits 1.
3. `--write` applies them. A second run finds nothing and exits 0. The near-misses are untouched.
4. A missing path exits nonzero.
5. After `--write` and the manual fixes the skill describes, the fixture compiles against the candidate's `dist/`.

## 5. Forward compatibility of the older migration skills

Every `skills/dooph-design-system-v*-migration/` ships in the new tarball, and its codemod runs against the new install. A consumer two majors back reads the older skill first, then yours. For each older skill:

1. **Forward note:** at its top, say that a consumer landing on vN or later does this migration first, then reads `dooph-design-system-vN-migration`.
2. **Re-verify its statements about the present** against the candidate: what exists, "unchanged" lists, defaults, codemod targets, report text and the codemod's exit code. Fix only what is false.
3. **Rename targets the new major renames again:** either update the target to the current name and say the table lands on current names, or keep it and make sure your skill's table lists it as a before-name. Pick one per skill. The chain must end on names that exist.
4. **Version numbers:** every version an older skill names must exist in `git tag` or be the version being cut.
5. **Chain test:** a fixture valid at the oldest supported major. Run each codemod and manual step in order, oldest first, and check that it compiles against the candidate's `dist/`, with no removed name left in its CSS.
