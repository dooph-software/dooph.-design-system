---
name: dooph-ds-writing-version-migrations
description: Use when a MAJOR version of @dooph-software/design-system is being cut, or when an already-shipped migration skill needs amending — authoring or updating a skills/dooph-design-system-vN-migration/ skill (and its optional codemod) that consuming projects' agents read to upgrade. Covers the change inventory, the token-rename and prop-change playbooks, and the forward-compat obligation on older migration skills. Not for minor or patch releases, which never get one.
---

# Writing a dooph DS version-migration skill

The package ships two kinds of skills. `.agents/skills/` (this file) governs the
repo; `skills/` is copied into consuming projects by `init-skills` and read by
*their* agents. A migration skill is the second kind: a one-time, self-expiring
instruction set for an agent that must move somebody else's app from vN-1 to vN.

You are writing **instructions for an agent that has never seen this repo**. It
cannot read `tokens.css`, cannot diff two tags, and cannot ask you what
`--ui-color-brand` became. Everything it needs has to be on the page.

> **Use `superpowers:writing-skills` in parallel with this one.** That skill owns
> the authoring mechanics — frontmatter fields, description phrasing, file
> layout, token economy, verifying the skill triggers. This one owns what goes
> *in* a migration skill and how to derive it. Do not look here for how to write
> a skill in general; do not look there for what a dooph migration must contain.

---

## Rule 0: Major versions only

A migration skill exists for `vN-1 → vN` and nothing else. Never write one for a
minor or a patch.

That is not a stylistic preference — it is what makes the skill's description
honest. A migration skill claims "a one-time breaking upgrade; no longer applies
once X holds." A minor release cannot make that claim, because by semver it broke
nothing, so the skill would sit in the consumer's skill directory forever,
triggering on a condition that never becomes false.

What to do with the non-major cases instead:

| Release | Where the change is documented |
|---|---|
| **Major** | A new `skills/dooph-design-system-vN-migration/` skill. This file. |
| **Minor** — new component, new prop, new token | Edit `dooph-design-system-usage` (and `-theming` if tokens moved). Additive; nobody has to do anything. |
| **Patch** | Nothing ships. A bug fix that needed consumer action was not a patch. |

**The awkward case: a minor that renamed things.** 5.4 renamed most of the token
vocabulary in a minor. That was a mistake, and it is why the v3 and v5 migration
skills now carry inline "on 5.4 or later, read this differently" notes instead of
clean rename tables. If a rename is worth doing, it is worth a major. If it ships
in a minor anyway, you inherit the §7 forward-compat work below.

---

## Step 1: Decide whether this major needs a skill at all

Audit before you write. A major bump does not by itself produce a migration.

**Precedent: v4.0.0.** It moved four components' variant consts into sibling
`constants.ts` files and dropped `"use client"` from three modules. Every one of
those consts stayed exported from `src/index.ts`, so nothing an ordinary consumer
imported moved. The only breakage was for deep importers
(`.../LoadingSpinner/LoadingSpinner`), which the package never supported. No
migration skill shipped, correctly.

If the audit comes back empty, say so in the release notes and stop. Do not
manufacture a skill to fill the slot.

But **record the verdict**, because the gap is load-bearing for the next reader:
there is no v4 migration skill, so an app on v3 landing on v5 must run the v3
skill and then the v5 skill. Any migration skill written after such a gap should
say which chain a distant upgrader follows.

---

## Step 2: Build the change inventory mechanically

Do not write the inventory from memory or from the commit log. Diff the tags.

```bash
git diff v4.8.2 v5.0.0 -- src/index.ts
git diff v4.8.2 v5.0.0 -- src/styles/tokens.css
git diff v4.8.2 v5.0.0 -- "src/components/*/constants.ts"
git diff v4.8.2 v5.0.0 -- package.json
git diff --stat v4.8.2 v5.0.0 -- src/components
```

Those five cover, in order: the public surface, the token contract, every
variant/size const, the `exports` / `peerDependencies` / `dependencies` fields,
and everything else.

Two things the diffs will not tell you, and you must check by hand:

- **Icons.** `src/components/Icons/index.ts` is generated, so a rename shows up
  as a file add plus a file delete with no relationship between them. Compare
  the two tags' icon file lists and look at the actual `<path d>` when a name
  survives — v5 kept the name `BarChartIcon` and pointed it at a *different
  glyph*, which no diff of the barrel would have surfaced.
- **Token defaults.** A `--ui-*` line whose name is unchanged but whose value
  moved is invisible to a grep for renames and produces a purely visual break.

### Every shipped migration skill opens with the full inventory

Before the first instruction, list **every** change in the bump — one line each,
including the ones requiring no action. Brief: a name, what happened, and which
bucket it falls in. The consumer's agent needs to know the list is complete
before it can trust the skill as its done-check; a skill that documents three
changes out of five teaches the agent to go hunting anyway.

Then classify each line into one of four buckets, because the buckets decide the
shape of the rest of the skill:

| Bucket | Test | Treatment |
|---|---|---|
| **Hard break** | Build or typecheck fails | A rename table, or a codemod. Cheapest bucket — the compiler finds these. |
| **Silent break** | Compiles clean, renders wrong | **The reason this skill exists.** Say so explicitly, in bold, near the top. |
| **Visual shift** | Nothing renamed, defaults moved | A "changes to expect, not bugs" section. |
| **Additive** | New exports, new tokens | A closing "new in vN — no migration action" section. |

The v5 skill's own framing — *"Two of the three fail silently — no build error,
no console warning, just the wrong colour or the wrong glyph on screen. Run the
codemod even if the app compiles."* — is the model. An agent whose app builds
clean will otherwise conclude it is done.

---

## Step 3: Structure

Follow `skills/dooph-design-system-v3-migration/` and
`skills/dooph-design-system-v5-migration/`. Read both before writing; they are
the format of record.

1. **Frontmatter `description`** — name the version pair, state it applies only
   after the new version is installed, list *observable symptoms* ("a red danger
   button that no longer looks red", "SiloIcon failing to resolve"), and end with
   the expiry condition ("no longer applies once the codemod exits 0"). Symptoms
   are what makes the skill trigger for an agent that was handed a bug report
   rather than an upgrade ticket.
2. **`metadata.short-description`** — one line, as both existing skills carry.
3. **Title + one-paragraph summary** — how many breaking changes, how many fail
   silently.
4. **The full inventory** (Step 2).
5. **Prerequisites**, if any. The v3 skill's mandatory `theme.css` preset import
   is the example: without it, the renamed utilities the skill tells you to write
   never generate, so it has to come before step 1.
6. **Numbered steps, ordered by surface**: token overrides → utility classes in
   JSX → component API in TSX. That order is deliberate — CSS first means the
   app is at least styled while the TSX sweep is in progress.
7. **Visual changes to expect (not bugs).**
8. **New in vN (opt-in, no action).**
9. **Verify — the done-check.** Exact commands, and an explicit statement of
   what a clean build does *not* prove.

Work top-to-bottom, and say so. Keep the whole thing in the second person,
addressed to the agent doing the upgrade.

---

## Step 4: Playbook — token renames

This will happen again. Every dooph major so far has moved token names.

**Derive the table, don't recall it.** `git diff` the two tags' `tokens.css`,
then confirm each new name against
`skills/dooph-design-system-theming/references/token-contract.md` at the new tag.
A migration table pointing at a token that does not exist is worse than no table:
the consumer's overrides land in a dead slot and fail silently, which is exactly
the failure mode you are writing the skill to prevent.

A token rename is never one table. It is **three**, because one `--ui-*` rename
propagates into Tailwind utility names via `sync-theme.mjs` and sometimes into a
`ds-*` helper class name:

1. **Token overrides** in the consumer's theme CSS — `--ui-color-destructive` → `--ui-color-danger`.
2. **Utility classes** in the consumer's own JSX — `bg-destructive` → `bg-danger`, `text-destructive-fg` → `text-danger-fg`. Read the emitted names out of the `@theme inline` block and `ALIASES` in `scripts/sync-theme.mjs`; do not assume the utility is the token minus its prefix. (`--ui-color-danger-foreground` emits `color-danger-fg`, so the class is `text-danger-fg`.)
3. **`ds-*` helpers**, if any were renamed alongside — `ds-focus-ring-destructive` → `-error-` → `-danger-` across three releases.

Then handle the three cases a flat table cannot express:

- **Removed with no replacement.** Give it its own subsection with the word
  "delete", and say what the component derives its look from now.
  `--ui-color-avatar-bg` is the worked example in the v3 skill: gone, and
  `Avatar` now composes `surface-secondary` + `border-secondary` +
  `prominent-color`, so the consumer either retargets a shared token or accepts
  the new derivation. Both options, stated.
- **Merged.** When two old tokens map onto one new one (`--ui-color-logo-alt`
  and `--ui-accent-color` both landing on `--ui-prominent-color-alt`), say
  plainly that only one value survives and the consumer must pick.
- **Explicitly unchanged.** A "do NOT rename — these already had their current
  names" list. Without it, an agent doing a blanket sweep renames tokens that
  were always correct. Call out any token whose *name* held but whose *default
  value* moved — `--ui-color-focus-ring-primary` did exactly that in v3.

**Bare-name traps.** `--ui-color-border` → `--ui-color-border-primary` must not
touch `--ui-color-border-secondary` or `-popovers`. Give the agent the
word-boundary pattern (`border-border(?![-\w])`) and warn that ripgrep needs
`-P` for the lookahead and `-e` for any pattern starting with `--`. Both existing
skills do this; copy the mechanism, including the no-PCRE2 fallback.

---

## Step 5: Playbook — prop and API changes

Order these from cheapest to most dangerous, and be blunt about which is which.

**A pure rename** — `ButtonVariant.destructive` → `.danger`. A find/replace line
in a table. Note whether the compiler catches it (it does, for a const member).

**A renamed const with reshaped values** — v3's `TextFontFamily` → `Fonts`,
where the values also stopped being class names and became `var(--ui-*)` strings
applied as inline style. Rename the symbol in the table, then explain the
behaviour change underneath, because the rename alone leaves the consumer
believing nothing else moved. In that case the props had silently done nothing
in v2 and started working in v3, which means call sites need *auditing*, not
just renaming.

**A semantic change wearing a rename's clothes** — the dangerous bucket, and the
one a codemod must refuse. v3 replaced four sidebar icons encoding *panel state*
(open/closed) with a pair encoding *interaction state* (rest/hover). There is no
correct mapping. The v3 skill flags it with ⚠, says outright that mapping the old
names onto the new ones silently removes the affordance, and offers two honest
options (convey the state another way, or accept the loss deliberately). Do the
same: **name the loss, refuse to guess, give the alternatives.**

**A redesign** — `ButtonVariant.danger` between v4 and v5: same name, same
tokens, entirely different look. Nothing to rename at all. Explain what the
component is now, table what each token *defaults to* today and what role it
plays, and tell the consumer to re-decide each override rather than port it. Add
the one-line lever if there is one ("override the two raw paints and the state
family follows").

**A removed component or export.** Say what replaced it, or that nothing did.
"Nothing did" is an acceptable answer and a far better one than pointing at a
near-miss.

---

## Step 6: Playbook — the codemod

Ship one when the bump has **more than a couple of mechanical identifier
renames**, or when a rename is a silent break. Skip it when the changes are
CSS-token-only (the consumer's editor does that sweep fine) or when the count is
two or three.

`skills/dooph-design-system-v5-migration/codemod.mjs` is the template. Its shape
is the part that matters:

- **Two jobs, deliberately separated.** `AUTO` = pure renames, identical
  rendering, applied under `--write`. `REPORT` = anything judgement-dependent,
  printed as `file:line` for a human. A codemod that guesses at a redesign is
  worse than no codemod.
- **Dry run by default.** `--write` applies. Print "re-run with --write" when
  there is something to apply.
- **Identifier boundaries on every rename**: `(?<![\w$])Name(?![\w$])`, so
  `BarChartIconWrapper` and the string `"silo-icon"` survive.
- **Skip list and extension allowlist** — `node_modules`, `dist`, `.next`,
  `build`, `out`, `coverage`, `.turbo`, `.cache`, `storybook-static`; `.ts .tsx
  .js .jsx .mjs .cjs .css`.
- **Exit code is a contract.** The skill tells the consumer "must exit 0", so
  `process.exit(0)` unless something genuinely actionable remains. Do not fail
  the run on an advisory list; that gates CI on correct code.
- **Zero dependencies, `node:fs` only.** It runs straight out of
  `node_modules/@dooph-software/design-system/skills/...` with nothing installed.
- **Comment the *why* at the top of the file**, in the repo's voice. The v5
  codemod's header explains why `BarChartIcon` is worth renaming even though
  nothing breaks without it. That comment is what stops a future maintainer
  "simplifying" the AUTO/REPORT split away.

Put the invocation in the skill as a copy-pasteable block with the full
`node node_modules/@dooph-software/design-system/skills/.../codemod.mjs ./src`
path — the consumer's agent has no local copy.

---

## Step 7: The forward-compat obligation on older migration skills

**A shipped migration skill is not finished.** It is a live document describing
a *destination*, and the destination keeps moving.

The v3 skill's rename table does not contain v3's literal spellings. It contains
today's, because `--ui-color-brand*`, `--ui-color-error*`,
`--ui-color-page-background`, `--ui-radius-standard` and the input-border family
were all renamed again in 5.4. An app upgrading v2 → current runs that table
once and lands on names the package actually reads. Had the table preserved v3's
spellings, it would have produced a second, undocumented migration.

So, whenever a release renames or removes anything:

1. Open **every** skill under `skills/dooph-design-system-v*-migration/`.
2. Update each rename table's target column to the new current name.
3. Add a blockquote note where a whole section's *meaning* changed — the v5
   skill's "Landing on 5.4 or later? Read this as a design note, not a rename
   task" over the danger palette, after 5.4 reinstated tokens v5 had deleted.
4. Update any codemod whose report text describes the old state, and re-check
   its exit-code behaviour against the new reality.

The rule in one line: **an old migration skill always ends at the present, never
at its own version.**

---

## Step 8: Ship it

- Author at `skills/dooph-design-system-vN-migration/SKILL.md`. That path is
  already covered by `"files": ["dist", "skills", "bin"]` in `package.json`, and
  `bin/init.mjs` copies the whole `skills/` directory — **no registration step,
  no build step.** Adding the folder is the whole of the plumbing.
- Migration skills are consumer-facing, so they live in `skills/`, **not** in
  `.agents/skills/`. Do not mirror them into `.claude/skills/`; that directory
  mirrors the authoring-side skills only.
- Cross-link: point at `dooph-design-system-usage` for how to use anything new,
  and `dooph-design-system-theming` (and its `references/token-contract.md`) for
  the token vocabulary. Do not restate either one here.
- Verify the skill triggers — `superpowers:writing-skills` covers how.

---

## Never

- **Never write a migration skill for a minor or a patch.** Rule 0.
- **Never let a codemod decide a semantic change or a redesign.** Report it.
- **Never write a rename table from memory.** Diff the tags, then confirm every
  target against `tokens.css` / `src/index.ts` at the new tag.
- **Never document only the breaking changes.** The inventory is complete or the
  consumer's agent cannot use it as a done-check.
- **Never let "the build passes" stand as the done-check** for a bump containing
  a silent break. Name the thing to look at in a browser.
- **Never leave an older migration skill pointing at a name a later release
  moved.** Step 7.
- **Never assume a Tailwind utility name is the token name minus its prefix.**
  Read `sync-theme.mjs`'s `ALIASES` and the emitted `@theme inline` block.
- **Never copy authoring guidance out of `superpowers:writing-skills` into a
  migration skill or into this one.** Reference it and move on.
