# Executor prompt: dooph Design System open-source publication

## Your role and constraints

You are an executor agent. Your job is to produce concrete file content and configuration changes that prepare the `@dooph-software/design-system` npm package for public open-source publication. You are NOT a planner — you produce actual deliverables.

**Hard constraints (read before anything else):**

1. **Never rely on training-knowledge for best practices.** Before writing any workflow YAML, policy file, or metadata recommendation, web-search current guidance. Cite the URL or search query you used.
2. **Never write legal text from scratch.** For `LICENSE`, `THIRD_PARTY_NOTICES` dependency license blocks, or any copyright notice boilerplate: tell the human exactly where to retrieve official text and provide fill-in-the-blank placeholders. Do not draft or paraphrase license language.
3. **Read the actual repo files before writing anything.** The brief below describes the current state, but you must confirm by reading each file. Don't assume file contents.
4. **Err on the simple side.** Minimal ceremony. A solo/small-team read-only OSS library, not a corporate open-source governance project.
5. **End every task block with a "Human must do" callout** for anything that requires legal text retrieval, registry account actions, or GitHub settings clicks you cannot perform.

---

## Project context

**Package:** `@dooph-software/design-system`  
**Stack:** React + Radix UI + Tailwind v4 design system  
**Repo:** `github.com/dooph-software/dooph-Design-System` (currently private — human will make it public as part of launch)  
**Goal:** Single public GitHub repo + single public npm package. Same install path for internal dooph apps and external OSS consumers. Read-only: no contributions accepted.

**Current repo state (verify by reading each file before editing):**
- `package.json`: `"license": "UNLICENSED"`, `publishConfig.registry` points to GitHub Packages, has `repository` field, missing `homepage` and `bugs`
- Release workflow: `.github/workflows/release-package.yml` — publishes to GitHub Packages on GitHub Release event
- No `LICENSE`, `CHANGELOG.md`, `SECURITY.md`, or `THIRD_PARTY_NOTICES.md` yet
- `README.md` describes package as internal-only
- npm `files` array: `dist`, `skills`, `bin`
- `skills/` directory contains consumer skills (orientation, composition, theming) + `init-skills` CLI
- `src/components/Icons/` contains inlined SVG paths derived from Lucide, Tabler, Phosphor, and Heroicons — **no per-icon provenance mapping exists or is desired**

**Decisions already made — do not re-litigate:**
- License: MIT (text comes from SPDX/GitHub, never drafted by you)
- Registry: public npm (`registry.npmjs.org`) only — no GitHub Packages, no dual publish
- Read-only: no PRs, contributions not accepted
- Icon attribution: broad four-library notice only, no per-icon tables
- No: two-repo strategy, wrapper packages, separate branded/generic builds, Blue Oak or other exotic licenses, per-icon attribution maps, standalone trademark policy, Storybook deploy, Dependabot, badges

---

## Step-by-step tasks

### Task 0 — Read the repo before writing anything

Read these files in full before proceeding:
- `package.json`
- `.github/workflows/release-package.yml`
- `README.md`
- Any existing `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md`

Note any discrepancies between what you read and what this brief describes. Adjust your output accordingly.

---

### Task 1 — Update `package.json`

**Search first:** Verify the canonical `repository`, `homepage`, and `bugs` field formats at `https://docs.npmjs.com/cli/v7/configuring-npm/package-json/` before editing.

Make these changes (all other fields untouched):

```json
{
  "license": "MIT",
  "homepage": "https://github.com/dooph-software/dooph-Design-System#readme",
  "bugs": {
    "url": "https://github.com/dooph-software/dooph-Design-System/issues"
  },
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "access": "public"
  }
}
```

Notes:
- `"access": "public"` in `publishConfig` removes the need to pass `--access public` on every CLI publish, and is especially important for scoped packages (`@org/name`) which default to private on npm.
- Confirm `repository` field is already in correct format: `{ "type": "git", "url": "https://github.com/dooph-software/dooph-Design-System.git" }`. If not, fix it.
- Do not touch `files`, `scripts`, `dependencies`, `peerDependencies`, or `devDependencies`.

---

### Task 2 — Update the GitHub Actions release workflow

**Search first:** Before writing the YAML, fetch and read:
- `https://docs.npmjs.com/trusted-publishers/` (npm trusted publishing / OIDC — now GA as of July 2025)
- `https://docs.github.com/actions/publishing-packages/publishing-nodejs-packages`

**Target approach — npm Trusted Publishing (OIDC, no long-lived NPM_TOKEN):**

npm trusted publishing uses GitHub OIDC tokens to authenticate. It requires:
1. npm CLI ≥ 11.5.1
2. `permissions: id-token: write` in the workflow job
3. The human must configure a "Trusted Publisher" in their npm package settings (npmjs.com → package → Settings → Trusted publishers) before the first automated publish — include this in the human checklist.

Produce a replacement `.github/workflows/release-package.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write   # required for npm OIDC trusted publishing

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Publish to npm
        run: npm publish --access public
        # No NODE_AUTH_TOKEN needed when using npm Trusted Publishing (OIDC).
        # Provenance attestation is generated automatically.
        # --access public is required on first publish of a scoped package;
        # safe to keep for all subsequent publishes.
```

**If the human cannot yet configure npm Trusted Publishing** (e.g., package doesn't exist on npm yet), provide a fallback variant that uses `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` and note clearly that the human should:
1. Create an npm Automation token (granular token, publish-only, scoped to this package).
2. Store it as `NPM_TOKEN` in GitHub repo secrets.
3. Migrate to trusted publishing after the package exists on npm (trusted publishing setup requires the package to already exist or be created on npm first).

Include both variants as commented sections so the human can switch without searching.

**HUMAN MUST DO (callout):**
> Before the first publish, either:
> **(Preferred)** Publish manually once with `npm publish --access public` from your local machine (authenticated via `npm login`), then configure Trusted Publishing at npmjs.com → your package → Settings → Trusted publishers → Add publisher → GitHub Actions, specifying your org/repo, workflow filename, and environment. After that, the automated workflow handles all future releases.
> **(Fallback)** Create an npm Automation token at npmjs.com and store it as `NPM_TOKEN` in GitHub repo → Settings → Secrets → Actions.

---

### Task 3 — Create `LICENSE`

**HUMAN MUST DO (callout) — do not draft this file yourself:**
> 1. Go to `https://spdx.org/licenses/MIT.html` and click "Text" to get the official MIT license text.  
>    Alternatively, when creating a new GitHub repo (or via repo Settings → License), GitHub's license picker provides the identical canonical text.
> 2. Paste the full text into a new file called `LICENSE` at the repo root.
> 3. Replace `[year]` with the current year and `[fullname]` with `dooph software` (or your legal entity name).
> 4. The file should have no extension and no markdown formatting — plain text only.

Your job: confirm `"license": "MIT"` is set in `package.json` (done in Task 1). Do not write the license text.

---

### Task 4 — Create `THIRD_PARTY_NOTICES.md`

**Search first:**
- Fetch `https://lucide.dev/license` and note the exact license type and copyright line (the license text reads like ISC but npmjs.com may list it differently — read the page and record what it actually says, do not assume).
- Search `"tabler icons license"` and verify at `https://github.com/tabler/tabler-icons/blob/master/LICENSE` — expected MIT.
- Search `"phosphor icons license"` and verify at `https://github.com/phosphor-icons/core/blob/main/LICENSE` — expected MIT.
- Search `"heroicons license"` and verify at `https://github.com/tailwindlabs/heroicons/blob/master/LICENSE` — expected MIT.
- For each npm runtime dependency in `package.json` (not devDependencies), look up its license. Common ones: `@radix-ui/*` (MIT), `tailwindcss` (MIT), `class-variance-authority` (Apache-2.0), `clsx` (MIT), `tailwind-merge` (MIT). **Read the actual `package.json` to get the real dependency list** — do not assume.

**Produce `THIRD_PARTY_NOTICES.md` with this structure:**

```markdown
# Third-Party Notices

`@dooph-software/design-system` includes or is derived from third-party software.
This file lists those components and their licenses.

---

## Icon Libraries

Icons under `src/components/Icons/` may be derived from or inspired by the following
open-source icon libraries. Individual icons are not tracked to a specific source;
this notice covers the libraries collectively.

### Lucide
- **License:** [ISC or MIT — fill in after verifying at https://lucide.dev/license]
- **Copyright:** [copy the copyright line verbatim from https://lucide.dev/license]
- **Source:** https://lucide.dev
- **License text:** https://lucide.dev/license

### Tabler Icons
- **License:** MIT
- **Copyright:** [copy the copyright line verbatim from https://github.com/tabler/tabler-icons/blob/master/LICENSE]
- **Source:** https://tabler.io/icons
- **License text:** https://github.com/tabler/tabler-icons/blob/master/LICENSE

### Phosphor Icons
- **License:** MIT
- **Copyright:** [copy the copyright line verbatim from https://github.com/phosphor-icons/core/blob/main/LICENSE]
- **Source:** https://phosphoricons.com
- **License text:** https://github.com/phosphor-icons/core/blob/main/LICENSE

### Heroicons
- **License:** MIT
- **Copyright:** [copy the copyright line verbatim from https://github.com/tailwindlabs/heroicons/blob/master/LICENSE]
- **Source:** https://heroicons.com
- **License text:** https://github.com/tailwindlabs/heroicons/blob/master/LICENSE

---

## npm Dependencies

The following runtime npm packages are bundled or linked in distributed builds.
Each is used under its stated open-source license.

<!-- Executor: populate this table from the actual dependencies in package.json.
     For each runtime dependency, find its license at npmjs.com/<package-name>
     and link to the LICENSE file in its GitHub repository. -->

| Package | License | Source |
|---------|---------|--------|
| (fill from package.json) | | |
```

**HUMAN MUST DO (callout):**
> For each entry under "Icon Libraries," visit the linked URL and paste the exact copyright line verbatim into the placeholder. Do not paraphrase. For the dependency table, verify licenses using `npx license-checker --production --summary` in the repo root as a quick audit. If any dependency shows a non-permissive license (GPL, AGPL, LGPL), flag it before publishing.

---

### Task 5 — Create `SECURITY.md`

**Search first:** Fetch `https://github.com/ossf/project-template/blob/main/SECURITY.md` and use it as a structural reference for a minimal solo-maintainer policy. Also note that GitHub supports private vulnerability disclosure natively (Security tab → "Report a vulnerability").

Produce `SECURITY.md`:

```markdown
# Security Policy

## Supported Versions

Only the latest release of `@dooph-software/design-system` receives security fixes.

## Reporting a Vulnerability

**Please do not open public GitHub issues for security vulnerabilities.**

Use GitHub's private vulnerability disclosure:  
**[Report a vulnerability](https://github.com/dooph-software/dooph-Design-System/security/advisories/new)**
```

**HUMAN MUST DO (callout):**
> Enable GitHub private vulnerability disclosure: repo Settings → Security → Private vulnerability reporting → Enable.

---

### Task 6 — Create `CHANGELOG.md`

**Reference:** keepachangelog.com format (`https://keepachangelog.com/en/1.1.0/`) — latest version first, change-type sections.

Produce an initial stub `CHANGELOG.md`. Read `package.json` first to get the current version number.

```markdown
# Changelog

All notable changes to `@dooph-software/design-system` will be documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [X.Y.Z] — YYYY-MM-DD  ← replace with current version from package.json and today's date

### Added
- Initial public release as `@dooph-software/design-system`.

---

<!-- Add new releases above this line in the format:

## [version] — YYYY-MM-DD
### Added / Changed / Deprecated / Removed / Fixed / Security
- Description of change.

-->
```

---

### Task 7 — Create `CONTRIBUTING.md`

One-liner policy. Read-only project, no contributions accepted.

```markdown
# Contributing

This repository is published as read-only open source for reference and use.
**Pull requests and code contributions are not accepted.**

To report a security issue, see [SECURITY.md](./SECURITY.md).  
To file a bug or question, open an [issue](https://github.com/dooph-software/dooph-Design-System/issues)
(if issues are enabled) — fixes are not guaranteed.
```

---

### Task 8 — Update `README.md`

Read the current `README.md` first. Make the following targeted edits — do not rewrite the whole file:

1. **Remove or replace** any language that describes the package as "internal to dooph products only."
2. **Add** (or update if already present) an Installation section:

```markdown
## Installation

```bash
npm install @dooph-software/design-system
```

```

3. **Add** a License line near the bottom (before any existing footer content):

```markdown
## License

MIT — see [LICENSE](./LICENSE) for the full text.  
The "dooph" name and logo are not covered by the MIT license and remain trademarks of dooph software.
```

4. **Do not** add badges, Storybook links, or contributing sections beyond what's already there. Minimal changes only.

---

### Task 9 — GitHub settings checklist

Produce this as a `## GitHub Settings` section in your output (not a file). These are manual steps the human must perform after making the repo public:

**Repository visibility:**
- [ ] Repo Settings → Danger Zone → Change repository visibility → **Public**

**Disable pull requests (read-only enforcement):**
- [ ] Repo Settings → General → Pull Requests → uncheck "Allow merge commits", "Allow squash merging", "Allow rebase merging" (all three off disables the merge button, making PRs effectively dead-end)
- [ ] Alternatively: add a branch protection rule on `main` → require PR reviews, set required reviewers to 1, but add no reviewers — this blocks merging without a human bypass

**Issues:**
- [ ] Decide: Repo Settings → General → Features → Issues — leave **on** (with a note in README that fixes aren't guaranteed) or turn **off** entirely. Recommended: off for a truly read-only package. Choose based on whether you want a public bug channel.

**Private vulnerability reporting:**
- [ ] Repo Settings → Security → Private vulnerability reporting → **Enable**

**Topics/description:**
- [ ] Add repo description and topics (react, design-system, tailwind, radix-ui) for discoverability

---

## Do NOT do any of the following

- Write MIT license text yourself
- Draft, paraphrase, or reconstruct any dependency's license text
- Create an `ICONS.md` or per-icon attribution map
- Create a per-icon comment in source files
- Suggest two-repo, private-dev/public-mirror, or wrapper-package strategies
- Add Storybook deployment, Dependabot config, or code coverage badges
- Add Blue Oak, Apache, or any license other than MIT
- Suggest dual-publishing to GitHub Packages — npm-only is the decision
- Create a corporate-style trademark policy document — the README note in Task 8 is sufficient
- Write a `CODEOWNERS` file or governance documents
- Recommend archiving the repo — archiving signals abandonment; read-only intent is communicated via `CONTRIBUTING.md` and GitHub PR settings instead

---

## Launch sequence (ordered)

Give the human this ordered checklist as your final output section:

```
Launch sequence for @dooph-software/design-system

Pre-flight (local):
  1. Run `npm run build` — confirm dist/ is clean
  2. Run `npm pack --dry-run` — confirm tarball contents match files: ["dist","skills","bin"]
  3. Run `npx license-checker --production --summary` — confirm no GPL/AGPL/LGPL deps
  4. Paste official MIT license text into LICENSE (from https://spdx.org/licenses/MIT.html)
  5. Fill in THIRD_PARTY_NOTICES.md copyright lines from each icon library's license page
  6. Replace version and date placeholder in CHANGELOG.md

npm account:
  8. Log in or create account at npmjs.com
  9. Create or verify the @dooph-software org scope exists on npm
     (npmjs.com → + → Create organization, or confirm it already exists)
  10. First publish (manual, from your machine):
      npm login
      npm publish --access public
      (This creates the package on npm, which is required before configuring Trusted Publishing)

GitHub:
  11. Commit and push all new/changed files to main
  12. Make repo public (Settings → Danger Zone → Change visibility)
  13. Enable private vulnerability reporting (Settings → Security)
  14. Configure PR settings to block merges (Settings → General → Pull Requests)
  15. Add repo topics and description

npm Trusted Publishing (recommended, after step 10):
  16. npmjs.com → @dooph-software/design-system → Settings → Trusted publishers
      → Add publisher → GitHub Actions
      → Org: dooph-software, Repo: dooph-Design-System, Workflow: release-package.yml
  17. Remove NPM_TOKEN secret from GitHub if you added one — it's no longer needed

Smoke test:
  18. Create a fresh directory: mkdir test-install && cd test-install && npm init -y
  19. npm install @dooph-software/design-system
  20. Confirm package installs, dist/ is present, no peer-dep errors
  21. Create a GitHub Release (vX.Y.Z tag) → confirm the Actions workflow runs and publishes

Done.
```

---

## Research citations used to inform this prompt

The following sources were consulted. The executor agent should re-verify any that may have changed:

- npm trusted publishing (OIDC, GA July 2025): https://docs.npmjs.com/trusted-publishers/ and https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/
- npm provenance statements: https://docs.npmjs.com/generating-provenance-statements/
- Scoped public package publishing: https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/
- GitHub Actions Node.js publishing: https://docs.github.com/actions/publishing-packages/publishing-nodejs-packages
- package.json field reference: https://docs.npmjs.com/cli/v7/configuring-npm/package-json/
- Lucide license: https://lucide.dev/license (verify: ISC or MIT — search result was ambiguous; read the page directly)
- Tabler license: https://github.com/tabler/tabler-icons/blob/master/LICENSE
- Phosphor license: https://github.com/phosphor-icons/core/blob/main/LICENSE
- Heroicons license: https://github.com/tailwindlabs/heroicons/blob/master/LICENSE
- Keep a Changelog: https://keepachangelog.com/en/1.1.0/
- OpenSSF SECURITY.md template: https://github.com/ossf/project-template/blob/main/SECURITY.md
- GitHub archiving (why not to use it for active-but-read-only repos): https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories
- npm vs GitHub Packages: npmjs.com is the standard for external OSS consumption; GPR requires extra consumer-side config and is not recommended for public packages (source: multiple DEV Community articles and GitHub Packages docs)
- npm Trusted Publishing practical guide (2026): https://philna.sh/blog/2026/01/28/trusted-publishing-npm/ and https://vcfvct.wordpress.com/2026/01/17/publishing-to-npm-with-github-actions-oidc-trusted-publishing-what-i-learned/
