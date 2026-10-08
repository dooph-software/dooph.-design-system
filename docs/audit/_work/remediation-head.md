# dooph Design System — Audit Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the defects, inconsistencies and doc drift recorded in [FINDINGS.md](FINDINGS.md), without creating work the findings don't justify, and ship the breaking subset as one major release.

**Architecture:** Work items (WI) are grouped by phase — P1 cleanups with no behaviour change, P2 internal restructuring, P3 consumer-visible non-breaking fixes, P4 breaking changes batched into one major. Each WI is anchored to quoted lines at the audited SHA, names the findings it addresses, and ends in a CHECKPOINT where the maintainer reviews and commits. Decision items (D) are questions only the maintainer can answer; WIs that depend on one stay `blocked` until it is answered.

**Tech Stack:** React 19 (peer), Radix UI primitives, Tailwind v4 (`@theme inline`), class-variance-authority + clsx + tailwind-merge, tsup (ESM/CJS/d.ts) with a Tailwind CLI `onSuccess`, Storybook 10. Verification tooling that exists in the repo: `npm run lint` (`tsc --noEmit`), `npm run build`, `npm run build-storybook`, `npm run sync-tokens`. There is no test runner (see D-18).

- **audited SHA:** `b436647c5b5713bdadceef3b5def90b0ad5357f1` (short `b436647`) — every `path:line` below is valid at this SHA only
- **audit date:** 2026-09-29 → 2026-10-01
- **overall grade:** C− (see [SUMMARY.md](SUMMARY.md) and FINDINGS §1)
- **findings:** [FINDINGS.md](FINDINGS.md) · **summary:** [SUMMARY.md](SUMMARY.md) · **evidence:** [\_work/](_work/)

## How to use this document

Written for the agent that executes it, with no memory of the audit.

- **Resume protocol.** Read the status board. Pick the lowest-numbered WI whose status is `todo` and whose `depends_on` are all `done`. Before editing, re-verify its anchor against the current HEAD (`rg -nF "<a distinctive line of the anchor>" <file>`). Set the WI to `in-progress` and add a dated line to its log. When its CHECKPOINT is reached, stop and hand the diff to the maintainer. Mark it `done` only after the maintainer has committed it.
- **Drift protocol.** Line numbers are valid only at `b436647`. Locate each change by its quoted anchor, not its line number. If the anchor moved, update the line refs in the WI and note it in the log. If the anchor is gone, mark the WI `stale`, explain why in its log, and re-derive the change from its findings (FINDINGS.md) before acting. Never guess.
- **Amendment rules.** A new issue found during execution goes into FINDINGS.md as the next F-ID (continue from the highest number, same schema), plus a new WI here and a status-board row. Don't fix it inline inside an unrelated WI. Nobody silently rewrites a WI marked `done`. Record any deviation from a WI's steps in its log.
- **Concurrent-work rule.** Any other work in this repo while this plan is open first checks the status board for WIs touching the same files. If one is `in-progress`, coordinate or wait. If one is `todo`, note in that WI's log that its anchor may have moved.
- **Reproduction scripts.** Many WIs run a script from `docs/audit/_work/scratch/…`. Those scripts default to a build of the audited SHA at `../dooph-ds-audit-build`, which was removed when the audit finished. To see a "fails today" result, recreate it: `git worktree add ../dooph-ds-audit-build b436647c5b5713bdadceef3b5def90b0ad5357f1 && cd ../dooph-ds-audit-build && npm ci && npm run build`. To verify a fix, pass your own scratch-worktree build directory as the script's first argument, where the script accepts one, or point its build constant at it. Remove both worktrees afterwards.
- **Decisions.** A `blocked(D-xx)` WI becomes `todo` only after the maintainer fills in the matching `decision:` line. If the decision picks an option other than the one the WI was drafted for, rewrite the WI's steps first and log it.

## Global constraints

- Never commit, stage, push, tag or publish. Every WI ends in a CHECKPOINT; the maintainer commits. Never run `npm run prep-release:*` — it versions, tags and pushes.
- Honour header contracts per `AGENTS.md`: read a file's `## behavior` / `## constraints` before editing it. If a change contradicts a constraint, stop and raise it — never edit around it.
- Code and contract ship together. In the same WI whose change makes them false, update the file's header contract, `.agents/skills/dooph-ds-codebase/SKILL.md`, the consumer skills under `skills/`, and `CHANGELOG.md` `[Unreleased]`.
- Never hand-edit generated files: `src/components/Icons/index.ts`, the `__GENERATED_THEME_START__…END__` block in `src/styles/index.css`, `src/styles/theme.css`, the generated `--ui-shape-morph-ease` value. Change the generator or the source and rerun it.
- After any change to `src/styles/tokens.css`, run `npm run sync-tokens`.
- Run builds only in a scratch git worktree (`git worktree add ../ds-wi-check HEAD`); in this checkout `npm run build` rewrites tracked files and hides drift. Remove the worktree when done.
- Install nothing and add no dependency unless the WI says so explicitly and the maintainer agrees at its CHECKPOINT.
- Semver policy: P1–P3 ship in a patch or minor release. Everything in P4 ships together in ONE major release (D-01), opened by WI-RELEASE-OPEN and closed by WI-RELEASE-CLOSE. Renames and removals follow the repo's established practice: no deprecation shims; each one is documented in the `skills/dooph-design-system-vN-migration/` skill per `.agents/skills/dooph-ds-writing-version-migrations/SKILL.md`.
- Load `.agents/skills/dooph-ds-architecture`, `dooph-ds-codebase` and `dooph-ds-contribution` before changing component code (the copies under `.claude/skills/` may be stale on a `core.symlinks=false` clone — see F-058).
