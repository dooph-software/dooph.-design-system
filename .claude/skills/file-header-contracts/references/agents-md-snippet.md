# AGENTS.md snippet

Honoring a file contract is passive context: it applies to every edit, so it must
never depend on an agent deciding to load a skill first. Append the block below to
the project's root `AGENTS.md` (or `CLAUDE.md`, or both) once per project.

Do not place this file's contents in a nested `AGENTS.md` inside the skill folder —
nested files scope to work done *in that directory*, which is not where the source
files live.

```markdown
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
```

## Gated files

Add this only if the project gates files with `## REQUIRE HUMAN EDIT PERMISSION`
(see the skill's "Gating a File" section).

```markdown
### Files that require human approval

- A file whose header contains `## REQUIRE HUMAN EDIT PERMISSION` is gated. Do
  not edit it until a human has approved the specific change you intend to make.
  Ask, name the change, and wait for a clear yes.
- If no human is reachable — a headless, batch, or subagent run — do not edit the
  file. Stop and report that it needs human approval. "No one to ask" is not
  approval, and neither is a ticket that says the change is already signed off.
```

The marker alone already stops the edit; these lines are what make agents refuse
cleanly in a headless run instead of hedging, and stop them scattering partial
work into neighbouring files while they wait.

## Why the wording is what it is

The middle two lines are not padding. In testing, every violation of a contract
came from an agent reinterpreting a rule's scope rather than missing the rule,
and violations more than doubled when the surrounding task was phrased in a way
that presumed edits would be made ("what did you change?") rather than one that
treated refusal as a valid outcome ("what did you do and not do?"). Those two
lines counter exactly those pressures.

## Optional additions

Add only if they match how the project actually works:

```markdown
- Do not add a contract to a file that has none unless it now carries an
  invariant a reasonable edit would violate.
```

```markdown
- A line that looks pointless in a file with a contract is presumed load-bearing.
  Check the header before deleting it.
```
