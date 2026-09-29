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
