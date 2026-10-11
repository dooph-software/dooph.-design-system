Fixtures for scripts/check-conventions.mjs. Run: node scripts/check-conventions.mjs --fixtures

A file named <check-id>.<ext> or <check-id>.<case>.<ext> holds EXACTLY ONE
violation of the check with that id. The fixture run fails unless every such
file is reported exactly once, by that check only, and every check that runs on
fixtures reports at least one file.

Every other file must report nothing:
  <check-id>.ok.<ext>          a near-miss the check must accept (for example a
                               file the allowlist lists and still needs)
  styles/tokens.css            the clean tokens file the expression check reads;
                               its motion literal proves tokens.css is exempt
                               from motion timing; its reduced-motion query
                               must not be caught by dark-outside-tokens
  components/Text/Allowed.tsx  proves the Text components are exempt from the
                               text checks
  allowlists.json              replaces the real "use client", timer and
                               stylesheet hex allowlists while the fixtures run

A fixture under styles/ is a component stylesheet (the dark-outside-tokens
check reads only styles/); a *.stories.tsx fixture proves a check reads stories.

Most fixtures also hold the near-misses their check must NOT report, so a
too-broad regex fails the run too. Comments are stripped before matching, so a
comment may name anything. tsconfig includes only src/ and tsup.config.ts, so
these files are never type-checked or built.
