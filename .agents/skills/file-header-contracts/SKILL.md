---
name: file-header-contracts
description: Use when a source file carries a decision its code cannot show - an invariant a reasonable edit would violate, a deliberate choice that looks like a mistake, a coupling the imports do not reveal - or when edits to a file keep undoing earlier fixes. For writing and updating these header contracts; honoring an existing one is an always-on AGENTS.md rule, not this skill.
license: MIT
---

# File Header Contracts

## Overview

A **file contract** is a block comment at the top of a source file stating what callers can rely on and what the file must never do. Markdown headings inside the comment do not render; they parse cleanly for the next reader, human or agent.

**Core principle:** code records the current implementation; the contract records the decisions the implementation must not drift away from, and the failure that follows if it does. Without it the next editor re-derives intent from the code, guesses wrong, and reintroduces the bug the code exists to avoid.

The failure this prevents is circular editing: fix A breaks B, fix B reintroduces A, forever.

## Install the Editing Rules First

This skill writes contracts; it does not enforce them. Enforcement is passive context — an agent about to edit a file does not first decide to load a skill about respecting headers — so it has to live in the project's root `AGENTS.md` (or `CLAUDE.md`), where every edit sees it regardless.

**Before writing your first contract in a project, check:**

```bash
grep -l "## File contracts" AGENTS.md CLAUDE.md .github/copilot-instructions.md 2>/dev/null
```

No match means nothing will read the header you are about to write.

**If you are an agent and the check comes back empty:** say so, show the block from `references/agents-md-snippet.md`, and ask before appending it. `AGENTS.md` is standing configuration — it changes how every future session in this repo behaves, so it is the user's call, not a side effect of a file you happened to be editing. On approval, append it and carry on. If they decline, write the contract anyway and tell them plainly that nothing will enforce it.

Never append it silently, and never write the contract first and mention the gap afterwards.

A contract without the snippet is decoration.

## When to Write One

Coverage is deliberately sparse — roughly one file in fifteen. Write one when the file has any of:

- **An invariant a reasonable edit would violate** — render-phase reconciliation that looks like a missing effect; a prop that must stay controlled.
- **A deliberate choice that looks like a mistake** — inline styles over classes, a missing `"use client"`, an imperative DOM write inside a component.
- **A prohibition with a live alternative** — the rule only sticks if the header says where the responsibility went instead.
- **Coupling the imports do not show** — a sibling that is the pose of record, a generated block, a token another package retunes.
- **A history of churn** — you have already fixed it twice.

**Skip:** barrel/index re-exports, icon and story files, components whose whole story is variant → token mapping. File size is not a trigger: a 360-line component of ordinary variants needs nothing; a 57-line resolver with two accepted input shapes does.

Absent contract > wrong contract. A stale header reads as authoritative and misleads.

## Two Forms

**Sectioned** — for files with enforceable rules. Headings in this order, lowercase:

| Slot | Content | Typical |
|---|---|---|
| Title line | `Name — one-line job` | 1–3 lines |
| `## behavior` | What callers rely on: inputs, outputs, state, side effects | 2–6 bullets |
| `## constraints` | Rules the file must satisfy, each naming what breaks | 2–5 bullets |
| `## updating` | Only if changing the file has a trap of its own | usually omit |

`## updating` is rare — closer to one header in eight than one in three. Use it only for a trap that belongs to the *act of changing* the file: a cross-file sync step, a command to run, a non-obvious degradation path. A coupling you would phrase as a rule is a constraint; put it there instead.

**`## behavior` is read as description; `## constraints` is read as law.** Editors rewrite behavior freely to match what they just changed — correctly, since it describes the present. So a fact you need *held* belongs in `## constraints`, even when it reads like a plain description. "Pure render, no internal state" sitting in `## behavior` was rewritten by 10 of 10 agents who added state to it, several noting explicitly that nothing in `## constraints` forbade them. **If it must not change, it is a constraint — not behavior.**

**Prose** — one or two paragraphs, no headings.

**Choose by counting invariants, not by the kind of file.** One → prose. Two or more → sectioned. A pure module, a resolver or a script with four hard-won constraints is sectioned like anything else; "it's a small resolver" is not a reason to flatten four rules into a paragraph where each is harder to find and quote.

Length tracks invariant density, not file size: ~11 lines for one design decision, ~40 for four hard-won constraints. Past ~40 the file is doing too much — that is the finding, not a longer header.

## Gating a File

A contract records what must stay true. A **gate** goes further: it says an agent must not touch this file at all until a human approves the specific change. Reserve it for files where a wrong edit costs money, breaks a regulation, or is not undone by a later fix — compliance calculations, billing math, anything with a legal or financial blast radius.

The marker is the first heading in the block, above everything else:

```
/*
 * priceWindow — usage metering and invoice math.
 *
 * ## REQUIRE HUMAN EDIT PERMISSION
 * Billing math. An error here bills real customers the wrong amount, and a
 * wrong invoice is not something a later fix undoes.
 *
 * ## behavior
 * ...
 */
```

The line beneath it names the stake. Do not omit it — a bare marker is a rule with no consequence attached, the same defect as a constraint that names no failure.

**Only a human adds a gate.** The marker encodes a judgement about money, law or safety that belongs to the person accountable for it. If you are an agent and a file looks like it warrants one, say so and let the user decide. Never add it on your own reading of the code.

**Rarer than contracts.** Coverage is about one file in fifteen; gates should be rarer still. A gate that interrupts every other edit gets switched off, and then it protects nothing.

**Back it with the hook.** The marker is an instruction, and instructions are not enforcement. `references/human-approval-hook.md` carries a `PreToolUse` hook that finds the marker and routes the edit through the permission prompt before the tool runs. For anything genuinely dangerous, install both — the header explains, the hook enforces.

## Writing Constraints That Hold

**Every constraint names the specific failure it prevents. This is a requirement, not a stylistic preference.** It is the part of the block that does the work: an agent that stops at a constraint quotes the incident back as its reason, and a rule with no incident attached gets refactored away by someone who cannot see its cost. A constraint you cannot attach a failure to is either not a constraint or one you have not understood yet.

```
- `hovered` is CONTROLLED. The component must not go looking for an
  interactive ancestor to attach listeners to — a previous version called
  `closest("button, a, [role=button]")` and bound six handlers to a node it
  did not own. Consumers wire onPointerEnter/onPointerLeave on their own
  button; the stories show it.
```

Rule, the specific past failure, and where the responsibility lives instead. All three.

**Never qualify a prohibition.** A qualifier defines a compliant subset, and the next editor will find it and build there. A constraint reading "no module-level cache or memo *keyed on anything but the arguments*" was read, every single time it was violated, as license for a cache keyed on the arguments — and the module-level state went in with the constraint quoted in its own defense. None of those editors missed the rule; they reinterpreted its scope.

```
BAD:  No module-level cache or memo keyed on anything but the arguments.
      Resolution is per-document — a shared `Map` leaked one SSR request's
      theme into the next.

GOOD: This module holds no state between calls. Caching belongs to the caller,
      not here — a shared `Map` leaked one SSR request's theme into the next
      and crossed popout windows on the client.
```

Both name the failure; only the second is unarguable.

If a genuine exception exists, give it its own sentence. Never as a clause inside the rule it weakens.

**Concrete beats general.** "Keyed by place value, never index — index-from-left is what made `$982.10 → $1,240.00` compare the tens digit against a comma and refuse to animate" survives a skimming editor. "Careful with key ordering" does not.

**Pre-empt the plausible wrong fix by name:** "This file contains no timer, no `requestAnimationFrame` and no `transitionend`. Timing belongs to `metric-ticker.css`."

Name the wrong fix, then say where the right one lives. Do not hedge it — "adding one is *almost always* the wrong fix" hands the next editor the exception to argue into, and it is the same defect as a qualified prohibition.

**Point at the co-owner.** If another file must change in step, say which, and what drifts if it does not.

## Example

```tsx
/*
 * Button — primary interactive leaf for labeled and icon-only actions.
 *
 * ## behavior
 * - `variant` + `size` map through `buttonVariants` (cva) onto token-backed
 *   utilities; `asChild` swaps the root for Radix `Slot`.
 * - Disabled paints explicit disabled bg/border tokens plus
 *   `ds-disabled-state` opacity — not opacity alone.
 *
 * ## constraints
 * - Do NOT reintroduce `--ui-color-danger*` tokens; the danger variant paints
 *   secondary + error-primary/secondary utilities directly so consumers can
 *   still override those families independently.
 * - Keep `ButtonVariant.brand` in the API even if icon stories omit it.
 */
"use client";
```

## Mechanics

- First thing in the file — above `"use client"`, above imports, below a license banner if one exists.
- Use `/*`, not `/**`, in component and module source: JSDoc tooling attaches `/**` to the following symbol, which is not what this block describes. Standalone scripts and CLI entry points are the conventional exception.
- Backtick identifiers, tokens, class names and CSS variables so they stay greppable.
- Non-code counts: token sheets carry their theming contract; generated files carry `AUTO-GENERATED by <script>. Do not edit by hand.` naming the generator.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Restating signatures ("exports a function that formats dates") | Write only what the code cannot say: the why and the must-not |
| Rules with no consequence attached | Every constraint names what breaks when violated |
| A qualifier inside a prohibition ("keyed on anything but…") | State the flat rule; a real exception is its own sentence |
| Writing contracts into a project with no `AGENTS.md` snippet | Install it first — otherwise nothing reads what you write |
| Sections forced onto a single-decision file | Use the prose form |
| `## updating` restating the constraints | Omit unless changing the file has its own trap |
| Changelog entries | Contracts describe the present; history lives in git |
| TODOs and "for now" notes | Those belong in the tracker, not an authoritative block |
| A header on every file | Sparse coverage is what keeps them read |

## Red Flags

- **You are writing a contract in a project with no `AGENTS.md` snippet installed — nothing will read it.** Stop and install it first
- A constraint contains "unless", "other than", "except when" or "keyed on anything but" — you are writing the loophole yourself
- A constraint has a rule but no failure attached
- The header is past ~40 lines — split the file
- You are writing "temporarily" or "for now" inside a constraint
- Every rule you are writing amounts to "uses design tokens"

---

**Testing note:** the rules above were tested against 119 fresh-context agent runs across three fixture files carrying real invariants. Four findings shape this document:

- **Field names do not affect compliance.** Four schemas — including `purpose`/`boundaries` — performed identically. Agents quote the *failure narrative* back as their reason for stopping; never a heading.
- **Qualifiers are the defect.** Flat prohibitions: 0/10 violations. Qualified ones: 5/14 (p ≈ 0.05, one fixture).
- **The section a fact sits in decides whether it binds.** An invariant left in `## behavior` was overwritten by 10 of 10 agents. This is why a descriptive slot like `purpose` is a poor home for a rule.
- **The gate marker holds.** A gated file went unedited 10/10 where the ungated control was edited 5/5 (p ≈ 0.0003) — in headless runs, against a ticket claiming prior sign-off.

Method, numbers, caveats and what is *not* evidence-backed: `references/evaluation.md`.
