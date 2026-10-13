# Claims: CONTRIBUTING.md

C = `CONTRIBUTING.md` at the repo root. Checked 2026-10-11.

- C:7 issues link https://github.com/dooph-software/dooph.-design-system/issues. Evidence: browser (built-in, signed out): loads, title "Issues · dooph-software/dooph.-design-system · GitHub", with a "New issue" button. The old link (`/dooph-software/dooph-Design-System/issues`) shows "Page not found · GitHub". The slug matches package.json `repository.url` and `homepage`.
- C:11-12 AGENTS.md holds the rules for coding agents and names the skill for each job. Evidence: AGENTS.md:25-36 (guardrails, each with a `$skill`).
- C:12-14 maintainer skills in `.agents/skills/`, consumer skills in `skills/`. Evidence: `ls .agents/skills/ skills/`; package.json `files` ships `skills`; bin/init.mjs copies `skills/`.
- C:14 run `npm run lint`. Evidence: package.json:61.
- C:3-4, C:6 unchanged from HEAD (read-only publication, no pull requests, SECURITY.md link).
