# WI-R — release work items (orchestrator)

### WI-RELEASE-OPEN: Open the 6.0.0 release — seed the v6 migration skill with the breaking changes already on HEAD
- status: blocked(D-01)
- addresses: [F-013, F-049]
- depends_on: []
- phase: P4
- risk: medium — an incomplete inventory teaches consumers' agents that a partial migration is done; mitigated by deriving every row mechanically from `git diff v5.3.0` and by WI-RELEASE-CLOSE re-deriving it at the end
- semver: major
- files:
  - create: `skills/dooph-design-system-v6-migration/SKILL.md`
  - modify: `CHANGELOG.md:10-23 @ b436647` ([Unreleased] — breaking subsections, coordinated with the CHANGELOG backfill WI)
- anchor:
  ```md
  ## [Unreleased]

  ### Added
  - `MorphRotationShape` — DS shapes that spring-morph into one another while turning (`autoplay`, `controlled`, `embedded` modes; `restingAngle`; per-instance `timing`).
  ```
- why: HEAD already carries about 76 consumer-breaking changes since v5.3.0 (F-013). Every P4 work item adds more, and each must land in one migration skill that consumers' agents use as their done-check (R13.6). Opening the skill first gives each P4 item a place to add its rows as it lands.
- steps:
  - [ ] 1. Confirm D-01 = 6.0.0 in the Decisions section. If D-01 chose 5.4.0, mark this item and WI-RELEASE-CLOSE `dropped(D-01 chose a minor)` and stop.
  - [ ] 2. Load `.agents/skills/dooph-ds-writing-version-migrations/SKILL.md` and `superpowers:writing-skills`. Read `skills/dooph-design-system-v3-migration/SKILL.md` and `skills/dooph-design-system-v5-migration/SKILL.md` (the format of record, R13.7).
  - [ ] 3. Build the inventory mechanically (R13.5) — save each output under the session scratchpad, never in the repo:
    ```bash
    git diff v5.3.0 HEAD -- src/index.ts
    git diff v5.3.0 HEAD -- src/styles/tokens.css
    git diff v5.3.0 HEAD -- "src/components/*/constants.ts"
    git diff v5.3.0 HEAD -- package.json
    git diff --stat v5.3.0 HEAD -- src/components
    git diff --name-status v5.3.0 HEAD -- src/components/Icons
    ```
    Cross-check against the audit's inventory in `docs/audit/_work/units/U13.md` §6 (26 removed tokens, 19 removed theme keys, 4 removed `ds-*` helpers, 7 removed export names, ≈20 changed const members). Every difference between the two is a row you must explain.
  - [ ] 4. Create `skills/dooph-design-system-v6-migration/SKILL.md` with the R13.7 structure: frontmatter `description` naming 5.x → 6.0, its observable symptoms (e.g. "a `ButtonVariant.brand` that no longer compiles", "a `--ui-color-brand` override that no longer applies") and the expiry condition; `metadata.short-description`; title + summary; the FULL inventory bucketed hard / silent / visual / additive (R13.6); token-override → utility-class → TSX steps, using the three-table token-rename format (R13.8) and the bare-name word-boundary patterns with the `-P` / no-PCRE2 fallback (R13.9); "Visual changes to expect"; "New in 6.0"; and "Verify". Leave a heading `## Changes added by later 6.0 work items` that each P4 item appends to.
  - [ ] 5. Decide with the maintainer whether the rename count needs a codemod (R13.10: "more than a couple of mechanical identifier renames" → yes). If yes, add `codemod.mjs` modelled on the v5 codemod AFTER WI-C2-03 has fixed its exit contract: AUTO/REPORT split, dry run by default, `(?<![\w$])Name(?![\w$])` boundaries, the skip list and extension allowlist, `node:fs` only, exit 1 while AUTO renames are pending.
  - [ ] 6. CHANGELOG.md `[Unreleased]`: add `### Removed` / `### Changed` subsections listing the same inventory in one line per item, each ending "(see `dooph-design-system-v6-migration`)".
  - [ ] 7. Verify: `rg -n "^## " skills/dooph-design-system-v6-migration/SKILL.md` shows the R13.7 sections in order; every token name the skill gives as a rename TARGET exists — `for t in $(rg -o -- "--ui-[a-z0-9-]+" skills/dooph-design-system-v6-migration/SKILL.md | sort -u); do rg -q -- "$t:" src/styles/tokens.css || echo "MISSING $t"; done` → prints only tokens listed under "removed"; `npm pack --dry-run | rg v6-migration` lists the new file (it ships via `"files": ["skills"]`; `bin/init.mjs` copies the whole directory, so there is no registration step).
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `skills/dooph-design-system-v6-migration/SKILL.md` exists with the R13.7 sections; its inventory covers every row of `git diff v5.3.0 HEAD` for index.ts, tokens.css, constants.ts and the Icons file list; CHANGELOG [Unreleased] lists the same breaking items.
- log:
  - 2026-10-01 — created by audit

### WI-RELEASE-CLOSE: Close the 6.0.0 release — re-derive the inventory, run the forward-compat pass, and hand the version bump to the maintainer
- status: blocked(D-01)
- addresses: [F-013, F-009]
- depends_on: [WI-RELEASE-OPEN]
- phase: P4
- risk: medium — a stale v3/v5 rename table sends consumers to dead names (R13.11); mitigated by the grep checks in step 4
- semver: major
- files:
  - modify: `skills/dooph-design-system-v6-migration/SKILL.md` (created by WI-RELEASE-OPEN)
  - modify: `skills/dooph-design-system-v3-migration/SKILL.md @ b436647` (every rename-table target column)
  - modify: `skills/dooph-design-system-v5-migration/SKILL.md @ b436647` (every rename-table target column)
  - modify: `CHANGELOG.md:10-23 @ b436647`
- anchor:
  ```md
  ## [Unreleased]
  ```
- why: The migration skill is the consumer's done-check, so it must list every breaking change in the release, including the ones the P4 items added after WI-RELEASE-OPEN (R13.6). Every older migration skill must end at the present (R13.11).
- steps:
  - [ ] 1. Confirm every other P4 item on the status board is `done` or `dropped`. If not, stop — this item runs last.
  - [ ] 2. Re-run WI-RELEASE-OPEN step 3's diffs against the current HEAD. Every difference from the skill's inventory is either added as a row or explained in this item's log.
  - [ ] 3. Forward-compat pass (R13.11): open `skills/dooph-design-system-v3-migration/SKILL.md` and `skills/dooph-design-system-v5-migration/SKILL.md`; update each rename table's target column to the 6.0 name; add a blockquote where a section's meaning changed; update any codemod report text that describes the old state.
  - [ ] 4. Verify: for each migration skill, every backticked `--ui-*` rename target exists in `src/styles/tokens.css` (same loop as WI-RELEASE-OPEN step 7); `rg -n "5\.4" skills .agents README.md CHANGELOG.md src` → no output, or only lines WI-C2-07 deliberately kept; `npm run lint` → exit 0; build in a scratch worktree (`git worktree add ../ds-release-check HEAD && cd ../ds-release-check && npm ci && npm run build && git status --porcelain`) → empty, then remove that worktree.
  - [ ] 5. CHANGELOG.md: rename `[Unreleased]` to `[6.0.0] — <date>` and add a fresh empty `[Unreleased]` above it.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits, then runs `npm run prep-release:major` themselves (it bumps the version, tags, builds and pushes — never run it from this plan).
- done_when: the v6 skill's inventory equals the re-derived diff; no migration skill names a token that tokens.css lacks; CHANGELOG has a dated 6.0.0 section.
- log:
  - 2026-10-01 — created by audit

## DONE
