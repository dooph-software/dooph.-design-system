# Task 4c: consumer fixture and consumer runner

Status: DONE. The template app builds and type-checks. The red and green sandboxes build. The smoke runs end `RUN OK` in both modes, and the main checkout was unchanged throughout.

## What exists now

Template app, `C:\Users\stick\Github\dooph\ds-consumer-template\`. It is its own git repo with one commit, `cbfeff1`.
- `package.json` and `package-lock.json`: next 16.4.0, react and react-dom 19.3.0, tailwindcss ^4 with `@tailwindcss/turbopack`, typescript ^5 (5.9), next-themes ^0.4.6, and `"@dooph-software/design-system": "file:vendor/dooph-software-design-system-5.3.0.tgz"`. There is a new script, `typecheck` = `next typegen && tsc --noEmit`.
- `vendor/dooph-software-design-system-5.3.0.tgz` (664 KB) is packed from the main working tree, snapshot tree `c6d74659…`.
- `app/globals.css` has, in order: `@import "tailwindcss"`, the package `styles.css`, then the package `theme.css`. That is the order theme.css's own header and the README's "Tailwind v4 Consumer Contract" give. After the imports come an unlayered `:root` that maps the next/font variables onto `--ui-font-*` (the README's Next.js font example), and an `@layer base` body rule: page surface background, text colour, body font.
- `app/layout.tsx`: `<html lang="en" suppressHydrationWarning>` carries the three next/font variables. Google Sans Flex, Host Grotesk and Bricolage Grotesque are loaded via `next/font/google`, as the README shows. The layout wraps the page in next-themes `ThemeProvider attribute="class" defaultTheme="system" enableSystem`. The header holds a TitleText home link, TextLink nav (Home, Dashboard) and the theme toggle.
- `components/theme-toggle.tsx` is a `"use client"` component: a DS ghost Button wired to next-themes.
- `app/page.tsx` is an async Server Component. It has a hero (HeroText, HeroBodyText, prominent and secondary big Buttons) and `<section id="pricing">`: three plan cards from `await getPlans()`, built with LabelText, HeadingText, SubheadingText, BodyText and a primary Button, styled only with DS spacing, colour, radius and shadow utilities.
- `app/dashboard/page.tsx` has one `DropdownMenu` / `DropdownMenuTrigger asChild` / `DropdownTrigger`, so the caret is on screen.
- `lib/plans.ts` exports `getPlans(): Promise<{id,name,price,blurb}[]>`, which returns fixture data.
- `README.md` is a short app README. It contains no DS guidance.

New runner files, in `<scratchpad>\runner\`. None of the six existing scripts was touched.
- `pack-ds.sh <out-dir>` packs the DS from the main working tree. It:
  1. snapshots the working tree through a throwaway `GIT_INDEX_FILE`;
  2. runs `worktree add --detach ../ds-pack-<stamp> HEAD`;
  3. runs `read-tree -u --reset <snap>` in the worktree's own index, and checks that the tree matches;
  4. runs `npm ci && npm run build && npm pack`;
  5. removes the worktree with a trap.
- `make-consumer-sandbox.sh <dir> [--with-skills]`, described below.
- `remove-consumer-sandbox.sh <dir>` refuses any dir without the `.git/consumer-sandbox` marker.
- `consumer-diff.sh <dir> [git-diff args]` diffs the current tree, untracked files included, against the sandbox's first commit, using a throwaway index.
- `consumer-honesty.mjs` adds consumer-only honesty flags (see below).
- `run-consumer.sh <id> <red|green> <out-dir>`, described below.

## Setup choices and reasons

- **Next.js App Router, not Vite.** The scenarios.md "Consumer fixture" section requires it, and the RSC scenario needs it. The app was scaffolded with `create-next-app@16.4.0 --ts --tailwind --app --no-src-dir --no-eslint --no-react-compiler --skip-install --disable-git`, then edited.
  - No ESLint, because the spec says "Lint: none in the consumer".
  - `--no-agents-md`: create-next-app 16 writes a Next AGENTS.md/CLAUDE.md by default. It would load identically in red and green runs, and it adds noise and tokens unrelated to the DS skills.
- **Install from a vendored tarball** (`file:vendor/…`). This is the only way `npm ci` and `npm install <x>` keep working inside every sandbox without a registry. It is also how a team tries out a pre-release build.
- **Imports follow the README and the spec.** The styles go in globals.css in the order theme.css's header gives (the README's Tailwind v4 contract). The fonts follow the README's next/font example, mapped in app CSS.
- **Light/dark uses next-themes with `attribute="class"`**, the spec's example. The default is "system", the common real setup. Browser checks must therefore set `.light`/`.dark` explicitly, because a dark-OS browser renders the app dark.
- **The existing pages follow DS conventions**: Text components, DS spacing and colour utilities, no palette colours or numeric spacing. "Make it match the rest of the app" points agents at them. They do NOT show any scenario's answer: no `.dark` island, no `data-ds-expression`, no light-only override, no `max-w-*`, no Button `asChild`, no client form.
- **Each sandbox is a fresh git repo with ONE commit of the hand-over state**, made with `git archive` of the template plus the mode's preparation, and committed as author `ds-fixture`. It is not a clone, for two reasons:
  - the red sandbox's history must never hold the unstripped tarball;
  - green's init-skills output is part of the base, so `git status` and `git diff` show only the agent's work.

  This matches the spec's "a git repo with one commit". consumer-diff uses that first commit as the base. The only commits are in the template repo and in these throwaway sandbox repos.
- **Red baseline (no flag).**
  - The vendored tarball is repacked without `package/skills/` and with a 3-line stub `README.md`. dist and the `.d.ts` files are kept.
  - The lockfile integrity is recomputed, then `npm ci` runs.
  - So `node_modules/@dooph-software/design-system/skills` is absent and the README is the stub. The tarball that any later `npm install` reinstalls from is stripped too.
  - The script asserts all of this. It also checks that `npm install` still works afterwards (verified: "up to date").
- **Green (`--with-skills`).** `npm ci`, then `npx --no-install @dooph-software/design-system init-skills --yes`. bin/init.mjs copies the package's `skills/` into `.agents/skills`, `.claude/skills` and `.agent/skills`, and Claude Code loads `.claude/skills` as project skills. The script asserts that `.claude/skills/dooph-design-system-*` exist.
- **`DS_TARBALL=<path>`** works in both scripts. It installs a fresh `pack-ds.sh` build instead of the vendored tarball, so green runs after the docs pass can test the new skills without touching the template. It was tested with the pack output: OK.
- **run-consumer.sh** copies run-scenario.sh exactly where it matters:
  - the same `claude -p` flags: `--model opus --setting-sources project --permission-mode acceptEdits --output-format stream-json --verbose --no-session-persistence --debug-file`;
  - the identical `--allowedTools` and `--disallowedTools` strings;
  - `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` plus `autoMemoryEnabled:false`, with the `autoMemoryDirectory` canary;
  - it calls `extract-run.mjs` (it does not copy it), so `-final.txt` starts `RUN OK` / `RUN ERROR`;
  - the cleanup trap is set before the sandbox is made;
  - the main-checkout state is taken before and after (HEAD, `ls-files -s` hash, refs hash, status hash) with `GIT_OPTIONAL_LOCKS=0`;
  - the exit codes are the same: 0 OK, 1 RUN ERROR, 3 main changed, 2 usage.

  The consumer-specific parts:
  - It refuses maintainer scenarios (verified: `checkbox-field-row` gives exit 2).
  - It appends AGENTS.md only if a sandbox has one; the template has none.
  - "Lint" is `npm run typecheck`, then `npm run build`, with the last line `lint exit: 0|1`.
  - `consumer-honesty.mjs` appends flags for any tool input naming the template dir, any `.tgz` or `tar` use, or another sandbox dir.
- **Sandbox location.** Sandboxes are created next to the main checkout, as `C:\Users\stick\Github\dooph\ds-consumer-sb-<id>-<mode>-<stamp>`, and removed on exit. They live there and not in the scratchpad because the scratchpad path contains `…-dooph-Design-System\…`, which extract-run.mjs's main-checkout regex would flag on every tool use.

## Commands

```
bash <scratchpad>/runner/pack-ds.sh <scratchpad>/task-4c/pack            # tarball (done once; re-run after the docs pass)
bash <scratchpad>/runner/make-consumer-sandbox.sh <dir> [--with-skills]  # used by run-consumer.sh
bash <scratchpad>/runner/run-consumer.sh <consumer-id> red   <out>
bash <scratchpad>/runner/run-consumer.sh <consumer-id> green <out>
DS_TARBALL=<fresh.tgz> bash <scratchpad>/runner/run-consumer.sh <consumer-id> green <out>
KEEP_SANDBOX=1 …   # keep the sandbox for the browser checks (npx next start in it)
```

## Evidence

Template:
- `npm run build` (next build, Turbopack) passes: routes `/`, `/dashboard` and `/_not-found` are static.
- `npm run typecheck` passes, and `npx tsc --noEmit` exits 0.
- Rendered with `next start` and inspected in the browser pane:
  - the body font is Google Sans Flex; the h1 is Bricolage Grotesque at 55px;
  - `#pricing` has 3 cards with a 20px gap;
  - the prominent big Button is 54px tall with the prominent colour;
  - the `.dark` class is applied by next-themes (the pane is dark), and `--ui-color-prominent` = `#340fd9`;
  - on /dashboard, the caret frame is 26×26 and there is no Next error overlay.
- The server was stopped by its PID.

Red sandbox (manual test):
- the hand-over commit leaves `git status` clean;
- the installed package lists `LICENSE.txt README.md THIRD_PARTY_NOTICES.md bin dist package.json` (no skills/), and the README is the 3-line stub;
- the repacked tarball contains 0 skills entries;
- typecheck exits 0 and build exits 0;
- consumer-diff shows exactly an added untracked file and a modified tracked file.

Green sandbox (manual test): init-skills installed 4 skills into the three dirs.

Smoke run, red, with `SCENARIO_PROMPT="List the files in src, then stop. Do not edit anything."` (out: `<scratchpad>\task-4c\smoke\smoke-red-*`):
- The runner exited 0. `-final.txt` line 1 is `RUN OK`: subtype success, 3 turns, $0.038, 0 permission denials. The agent reported that there is no `src/` (a Next app without a src dir) and edited nothing; the diff is empty.
- Env: built-in skills only (`update-config, debug, simplify, batch, loop, schedule, claude-api`), plugins 0, MCP 0. The debug log shows `managed: 0, user: 0, project: 0` and `project=[]`.
- "canary absent after the run: auto-memory was off", with 0 memory activity lines. The canary dir does not exist.
- Honesty: no flags, and no consumer flags.
- Lint: typecheck exit 0, build exit 0.
- `-main.txt`: MAIN CHECKOUT UNCHANGED. Independently, HEAD `0dac153`, index `87f58d90…`, refs `b5e306df…` and status `ca406b59…` are identical at task start and task end (`task-4c/main-state-{start,end}.txt`). `worktree list` shows only main, so the pack worktree was removed.

Smoke run, green, with `SCENARIO_PROMPT="List the files in app…"`:
- `RUN OK`, runner exit 0.
- Skills: the 7 built-in skills plus `dooph-design-system-theming, -usage, -v3-migration, -v5-migration`. The debug log shows `project=[…\.claude\skills]` and `project: 4, user: 0`.
- Canary absent, no flags, lint 0, main unchanged.

## Concerns

1. **The vendored skills are the pre-docs-pass set.** It has 4 skills and no `dooph-design-system-setup`. Green runs after the docs pass must use `DS_TARBALL=$(pack-ds.sh …)`, or re-vendor the tarball into the template with a second template commit.
2. **`next build` needs network**, because next/font/google fetches the fonts. Offline, lint fails for reasons that are not the agent's. Turbopack warns twice, harmlessly:
   - it found no fallback metrics for Google Sans Flex;
   - it ignores a stray `C:\Users\stick\Github\package-lock.json`.
3. **`C:\Users\stick\Github\dooph` is itself a git repo** (empty, no commits). The template and the sandboxes are nested repos inside it. Nothing of mine touched it.
4. **Two realistic hints in the template** may make one scenario's baseline easier:
   - the nav uses `<TextLink asChild><Link>`, which is also in TextLink's own JSDoc;
   - home is an async Server Component that calls `getPlans()`.

   Both are relevant to pricing-rsc-buttons. The `@layer base` body rule and the unlayered `:root` font mapping are realistic, and they are exactly the traps brand-prominent-light-only and pricing-dark-band test.
5. **scenarios.md (the frozen copy) still says the fixture is `../ds-consumer`** and that consumer scenarios are refused. I did not edit it, because running baselines parse it. The actual fixture is the template plus one sandbox per run, and run-consumer.sh replaces the "refused" note. The scoring's "app diff" is `-diff.patch` (against the sandbox's single commit), not `git -C ../ds-consumer diff`.
6. **The browser checks in the consumer scenarios are not automated.** Run with `KEEP_SANDBOX=1` and `next start` in the sandbox. Set `.light`/`.dark` explicitly, because the default theme is "system".
7. **Agents could still reach outside.** `node` is allowed, so an agent could unpack the stripped tarball (no skills in it) or read the template's full tarball. consumer-honesty flags template paths and tarball or tar use, but cannot see what happens inside a node script.
8. **`--model opus` resolves to `claude-opus-4-6`** in CLI 2.1.96. This is the same for the maintainer runner; I note it only for the record.

## Fix round 1

The review found five leaks or silent failures. All five are fixed. Nothing inside the main checkout was touched; only the template and my new runner files changed.

1. **The sandbox name no longer reveals the scenario or the mode.**
   - `run-consumer.sh` now names each sandbox `ds-consumer-sb-<12 random hex>` (from `/dev/urandom`). The scenario id and mode appear only in the out-dir file names, and `-sandbox.txt` maps a run to its sandbox.
   - The `.git/consumer-sandbox` marker is readable by the agent, so it now holds only the template commit. Before, it also held the mode and the tarball path.
   - `consumer-honesty.mjs` now takes the known sandbox path as a required third argument and derives its own name from that. It no longer depends on the init event's cwd. It exits 1 if the name is not `ds-consumer-sb-<hex>`.
   - A path counts as the agent's own sandbox when it starts with that name, so there are no false OTHER-SANDBOX flags.
2. **The npm registry route to the published docs is closed.**
   - `DISALLOWED` additionally blocks `npm view`, `npm info`, `npm show`, `npm pack`, `curl` and `wget`.
   - New honesty flags:
     - **DS-REGISTRY:** any npm, npx, yarn or pnpm command that names `@dooph-software/design-system`.
     - **NETWORK:** any `curl` or `wget`, any `fetch(` in a shell command, any WebFetch or WebSearch tool use, and any `node -e/-p/--eval/--print` script that touches the network (fetch, http(s), net, tls, dns, undici, the npm registry).
   - App code the agent writes (Edit/Write) is never checked for `fetch(`, so the settings form's POST does not trigger a flag.
   - Synthetic test (`task-4c/honesty-gen.mjs`, result in `task-4c/honesty-test-result.txt`):
     - each of these is flagged: `npm view <pkg>`, a `node -e` fetch, curl, the template path, a .tgz, another sandbox, WebFetch;
     - these are not flagged: the agent's own sandbox paths (Windows and POSIX forms), `fetch('/api/...')` in app code, `npm run build`.
3. **The template no longer shows the `asChild` pattern in its nav.**
   - `app/layout.tsx`'s header is now plain `next/link` Links wrapping DS Text components (`<Link href="/"><TitleText>Acme</TitleText></Link>`, and the nav links wrap `BodyText` inside `text-text-secondary hover:text-text`). The old nav used `<TextLink asChild><Link>` and `TitleText as={Link}`.
   - I amended the template's single commit, which is now `c48344d`. The template is still one commit with a clean status. Typecheck and build both exit 0.
   - The only `asChild` left in the template is `DropdownMenuTrigger asChild` on /dashboard. That is the standard DS dropdown wiring, not Button plus Link.
4. **Green mode needs an explicit tarball, and every run records which tarball it used.**
   - `run-consumer.sh` refuses green unless `DS_TARBALL` is set (exit 2, verified).
   - Every run's `-final.txt` now has, right after the RUN line:
     - `ds tarball: <path> sha256 <hash>`;
     - `installed tarball sha256: <hash>`, which in red is the repacked tarball without skills/ and with the stub README.
5. **Post-run steps can no longer fail silently.**
   - If `consumer-honesty.mjs` or either `consumer-diff.sh` call exits non-zero, a `STEP FAILED: <step> exit <n>` line is written to `-final.txt` (after the tarball lines), a RUN OK first line becomes `RUN ERROR: step failed: …`, and the runner exits 1.
   - The lint step counts as failed in two cases:
     - it could not run or did not record its `lint exit:` line;
     - `next build` could not fetch Google Fonts (the build needs network).
   - My interpretation: if typecheck or build fails because of the agent's code, that is a result to score (`lint exit: 1`), not a broken run. Treating it as a runner error would void real baselines.

**Decision recorded:** the shipped source maps (`dist/**/*.map` with `sourcesContent`, which includes the header contracts) STAY in red sandboxes, because real consumers have them. This is the controller's decision; scorers should not count reading them as a leak.

**Smoke test after the fixes** (red, `SCENARIO_PROMPT="List the files in src, then stop. Do not edit anything."`, out: `task-4c/smoke-fix1/`):
- The runner exited 0, and `-final.txt` line 1 is `RUN OK`.
  - Line 2: `ds tarball: …/ds-consumer-template/vendor/dooph-software-design-system-5.3.0.tgz sha256 783c0f2d…`.
  - Line 3: `installed tarball sha256: b64454bf… (RED repack…)`.
- The cwd was `…\ds-consumer-sb-ebeb0fdaa0b8`.
- Env: built-in skills only, 0 plugins, and the debug log shows `user: 0, project: 0`. The canary was absent and the debug log had 0 memory lines.
- Honesty: no flags from either check. The diff is empty, and typecheck and build both exited 0.
- The main checkout's HEAD, index, refs and status match the task-start values (`task-4c/main-state-end-fix1.txt`).
- No sandbox dir was left behind.
