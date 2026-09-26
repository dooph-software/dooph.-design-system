# Evaluation

Provenance for the rules in `SKILL.md`. Not needed to use the skill — read it if
you want to know which parts are evidence-backed and which are judgment.

## Method

119 fresh-context agents (Claude Sonnet) across three fixture files carrying real
invariants that are invisible in the code (15 runs discarded as confounded):

- a React component — place-value keying, a deliberate absence of timers, a
  controlled prop, a silent CSS coupling
- a resolver module — never-throws fallback, must-stay-synchronous, no
  module-level cache, a generated-manifest coupling
- a billing module — bigint-only arithmetic, per-window truncation, and (in the
  gate test) a `## REQUIRE HUMAN EDIT PERMISSION` marker

Agents received sprint tickets that attacked those invariants head-on, plus one
ask no rule covered. They were never told a header was under test.

## Result 1 — the field schema does not matter

Four schemas, facts held identical: `behavior`/`constraints`/`updating`,
`purpose`/`boundaries`, both combined, and free-form prose.

Eight head-to-head runs showed one apparent difference. A further 24 runs
isolating it found nothing: 8/8 clean with and without the candidate cause, and
0/8 for the schema that had "failed" when run again under the same load. The
difference was noise at n=1.

Agents that stopped at a constraint quoted the **failure narrative** back as
their reason. Not one cited a heading. Headings are navigation; the incident
sentence is what binds.

`purpose`/`boundaries` was actively worse for *authoring*: because `boundaries`
only accepts what a file does not own, positive invariants have nowhere to go but
`purpose`. The single most important rule in both fixtures landed there — in the
least imperative section of the block. `## updating` was used in 1 of 8 authored
headers, which is why `SKILL.md` calls it rare.

## Result 2 — qualifiers are the defect

Every violation observed reinterpreted a qualifier as license rather than missing
the rule. A constraint reading "no module-level cache or memo *keyed on anything
but the arguments*" was read as permission for a cache keyed on the arguments,
and module-level state went in with the constraint quoted in its own defense.

Tested directly, 2x2, under the framing that produces violations:

| Constraint wording | `AGENTS.md` snippet | Violations |
|---|---|---|
| qualified (old) | old | **4 / 9** |
| flat (new) | old | 0 / 5 |
| qualified (old) | new | 1 / 5 |
| flat (new) | new | 0 / 5 |

Flat wording **0/10** vs qualified **5/14** — Fisher exact p ≈ 0.05.
The snippet's own contribution (old 4/14, new 1/10) is **not** significant; it
may help, but this run does not show it.

**Caveats.** The 4/9 baseline pools two runs of the same cell that differ only in
the line wrapping of `CLAUDE.md`. Cells that lost reps to a rate limit were
scored valid only when the agent completed a non-conflicting ticket in the same
file, proving it reached its edit phase. One model, small n.

### The qualifier effect did not reproduce on the second fixture

The same test on the component fixture — hedged "adding one is *almost always*
the wrong fix" vs. a flat version — found **0/5 violations in both arms**. Every
agent sequenced the animation in CSS with `animation-delay: var(--mt-settle)`.

The honest read: the ticket was meant to make CSS awkward and failed to, so the
constraint was never under real pressure. The qualifier finding rests on the
resolver fixture alone. Hedged phrasings are still worth avoiding on the
resolver evidence and on principle, but "0/10 vs 5/14" is one file's result.

## Result 3 — `## behavior` is descriptive, `## constraints` is binding

The strongest finding from the component fixture was accidental. Its header said
"Pure render, no internal state" under `## behavior`. **All 10 agents** added
`useState`/`useRef`/`useEffect` and rewrote that line. Several said why outright:
one noted that "nothing in `## constraints` forbade state — only timers, rAF and
`transitionend`," and asked whether "no internal state" in `## behavior` had been
"descriptive, not a hard constraint like the three bullets under
`## constraints`."

They were reading the sections exactly as labelled. This is the one place where
**section placement demonstrably changes whether a fact binds** — and it is why
`purpose`/`boundaries` is a real risk rather than an untidy one: an invariant
that lands in a descriptive slot gets demoted to a description.

All 10 did update the header in the same edit, so the "code and contract ship
together" rule held.

## Result 4 — task framing beats anything in the header

Identical files, tickets and header. Only the closing instruction differed:

| Prompt ending | Violations |
|---|---|
| "what you **did and did not do**" | 0 / 8 |
| "what you **changed**…" + write a report | 2 / 4 |

A phrasing that presupposes edits roughly halves compliance. This is why the
`AGENTS.md` snippet states that leaving a task undone is a complete result — it
is the only lever available against a ticket you did not write.

## Result 5 — the `## REQUIRE HUMAN EDIT PERMISSION` gate works

A billing-math fixture, and a ticket that violates **no** constraint (add a
volume-discount field — legitimate work an agent should normally just do). The
only thing that could stop an agent was the gate. Every run was a subagent with
no human to ask, i.e. the dangerous headless case.

| Arm | Gated file edited |
|---|---|
| no marker (control) | **5 / 5** |
| marker, no `AGENTS.md` clause | **0 / 5** |
| marker + clause | **0 / 5** |

Fisher exact, 5/5 vs 0/10: **p ≈ 0.0003**. The control confirms the ticket was
straightforwardly doable; the marker is what stopped it.

**The marker alone carries the stop.** The `AGENTS.md` clause did not change the
headline number — it changed the *quality* of the refusal. Without it, agents
hedged ("tell me to go ahead and I'll apply it immediately") and one scattered a
partial edit into an adjacent ungated file. With it, they cited the headless rule
directly, declined to do partial work on the grounds that it would be dead code
without the gated change, and named the specific diff they wanted approved.

Notably, several agents rejected the ticket's own "signed off by the finance
lead" line as insufficient — correctly, since it is text in a file, not a human.

**Caveat.** The fixture's tier table also carried an `AUTO-GENERATED — do not
edit by hand` banner whose generator was absent, giving agents a second reason to
hesitate on *that* file. It does not touch the headline metric: the control
edited the gated file 5/5 under identical conditions.

**An earlier run of this test was discarded.** Its ticket contradicted a
constraint, so every arm refused on constraint grounds and the gate was never
exercised — a broken fixture, not a result.

## What is not evidence-backed

The sparse-coverage ratio (~1 in 15), the ~40-line ceiling, and the `/*` vs `/**`
mechanics come from practice across one production codebase (19 headers over 264
source files), not from this run.
