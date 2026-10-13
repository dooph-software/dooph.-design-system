# Build, scripts and package surface

Detail behind the codebase map. Every line is read from `package.json`, `tsup.config.ts`, `scripts/`, `bin/`, `.storybook/`, `.github/workflows/` and `.claude/launch.json`.

## npm scripts

| Script | Runs | Use |
|---|---|---|
| `lint` | `tsc --noEmit && node scripts/check-conventions.mjs` | Before every hand-back. tsc covers `src/` and `tsup.config.ts` (tsconfig `include`), not `.storybook/` or `scripts/` |
| `sync-tokens` | `node scripts/sync-theme.mjs` | After editing `tokens.css`, or the `.text-style-*` / `.h-*` / `.size-*` / `.min-w-*`… rules in `index.css` |
| `generate-icon-exports` | `node scripts/generate-icon-exports.mjs` | After adding or removing an `*Icon.tsx` |
| `generate-shape-morph-ease` | `node scripts/generate-shape-morph-ease.mjs` | After changing `scripts/shapeMorphSpring.mjs` |
| `storybook` | `storybook dev -p 6006` | Local Storybook |
| `build-storybook` | `storybook build` | Static Storybook in `storybook-static/` (gitignored) |
| `build` | the three generators above, then `build:js` | Scratch worktree only: rewrites tracked files |
| `build:js` | tsup through `node --max-old-space-size=8192` | Writes only gitignored `dist/` |
| `build:css` | `node scripts/emit-css.mjs` | CSS-only rebuild of `dist/` (gitignored) |
| `build:watch` | the three generators, then tsup `--watch` | Scratch worktree only |
| `prepublishOnly` | `npm run build` | npm runs it before `npm publish` |
| `prep-release:patch` / `:minor` / `:major` | `npm version …`, `npm run build`, `git push --follow-tags` | The maintainer's release. Never run by an agent |

There is no `test` script, and there are no test files in `src/` or `scripts/`.

Commands with no npm script:

| Command | Does |
|---|---|
| `node scripts/generate-docs.mjs` | Regenerates the four generated doc references (the setup skill's `client-references.md` only between its `GENERATED:client-references` markers) |
| `node scripts/sync-skills.mjs` | Copies `.agents/skills/` into the two mirrors |
| `node scripts/check-conventions.mjs --fixtures` | Runs each check over `scripts/check-conventions.fixtures/`, which must catch exactly its own fixtures |
| `--check` on `sync-theme.mjs`, `generate-icon-exports.mjs`, `generate-shape-morph-ease.mjs`, `generate-docs.mjs`, `sync-skills.mjs` | Writes nothing, prints one `stale <path>` line per out-of-date output (`stale <path> (<why>)` from `sync-skills.mjs`), exits 1. CRLF and LF count as equal. Lint runs all five this way |
| `node scripts/surface.mjs <tree> <out.json>` | Writes the public surface of a BUILT tree (a scratch worktree after `npm run build`) as JSON, through `scripts/lib/surface.mjs` |
| `node scripts/surface-diff.mjs <old.json> <new.json> <out.md> [out.json]` | Diffs two surface JSONs, one line per difference. Used for a migration inventory (dooph-ds-writing-version-migrations) |

## The build, step by step (`npm run build`)

1. **Icon barrel.** `generate-icon-exports.mjs` writes `src/components/Icons/index.ts`: the `BaseIcon` / `IconSize` / `IconProps` exports, then one line per `[A-Z]…Icon.tsx` file except `BaseIcon.tsx`, sorted. It fails if a file does not contain `export const <FileName>`. Lint check: "icon barrel out of date".
2. **Shape-morph ease.** `generate-shape-morph-ease.mjs` writes `--ui-shape-morph-duration` and `--ui-shape-morph-ease` between the `__SHAPE_MORPH_EASE_START__` / `__SHAPE_MORPH_EASE_END__` markers in `tokens.css`, from `buildEase()` in `shapeMorphSpring.mjs`, the only place the spring's constants live. It fails if a marker is missing. Lint check: "shape-morph ease out of date".
3. **Theme.** `sync-theme.mjs` reads the `--ui-*` names of the first `:root` / `:root, .light` block in `tokens.css` (later `:root` blocks and the expression preset are not read). It maps each one by prefix (`ui-color-`, `ui-shadow-`, `ui-radius-`, the `ui-font-<role>` families, `ui-text-`, `ui-spacing-`) or by its `ALIASES` entry, and skips `EXCLUDED` names and names no rule matches. It writes the `@theme inline` block between the `__GENERATED_THEME_*__` markers in `index.css`, the same block into `src/styles/theme.css`, and `src/utils/twMergeTheme.ts`: the theme scales plus the `.text-style-*` roles and custom size utilities it reads from `index.css`, for `cn`.
4. **JS.** tsup (`tsup.config.ts`):
   - entry: every `src/**/*.{ts,tsx}` except `*.stories.tsx` and `*.test.*`. Each module is its own entry, so a module's `"use client"` stays on its own chunk and server-safe modules stay free of it. `dist/index.js` is the single public entry;
   - ESM and CJS, `.d.ts`, `splitting`, `metafile`, `sourcemap`, `clean` (wipes `dist/` first). `react`, `react-dom` and `react/jsx-runtime` are external. tsup's `treeshake` is off on purpose: it strips the directives;
   - `onSuccess` runs three steps in order:
     - `scripts/add-use-client.mjs` finds every source module with `"use client"` in its directive prologue (only comments or other directives may precede it; a `"use client"` line anywhere else fails the build). Through tsup's metafiles it prepends `"use client";` to every output chunk built from such a module, shifts that chunk's `.map` by one line, then deletes the metafiles;
     - it deletes every `dist/**/*.cjs.map` and strips the `sourceMappingURL` comment that points at it;
     - `scripts/emit-css.mjs` runs `npx tailwindcss -i src/styles/build.css -o dist/styles.css`, and copies `src/styles/theme.css` to `dist/theme.css` uncompiled (the consumer's Tailwind compiles it). `build.css` is `@import "./index.css"` plus `@source not "../**/*.stories.tsx"`, nothing else.

The build never runs lint, `generate-docs.mjs` or `sync-skills.mjs`.

## Tailwind scan scope

`src/styles/index.css` lines 1–3:

```css
@import "tailwindcss" source(none);
@source "../**/*.{js,ts,jsx,tsx}";
```

`source(none)` turns off Tailwind's automatic source detection. Without it, class-like words in docs, skills and the README would reach the shipped CSS. `@source` then scans `src/` only, relative to `src/styles/`. Storybook compiles `index.css` itself, so stories are scanned there and every story renders. The shipped CSS is compiled from `src/styles/build.css`, which imports `index.css` and adds `@source not "../**/*.stories.tsx"`. As a result, a utility exists in `dist/styles.css` only if its class name appears in a non-story file under `src/`; a utility only a story writes works in Storybook and never ships. Put nothing else in `build.css`: `index.css` stays the one stylesheet.

## Package surface (`package.json`)

- `exports`: `.` (types `dist/index.d.ts`, import `dist/index.js`, require `dist/index.cjs`), `./styles.css`, `./theme.css`. Nothing else is importable.
- `main` / `module` / `types` point at the same three `dist/index.*` files.
- `files`: `dist`, minus the per-module `.js` / `.cjs` / `.map` stubs under `dist/components/` and `dist/utils/` and every `*.cjs.map`; plus `skills`, `bin`, `THIRD_PARTY_NOTICES.md`. The per-module `.d.ts` files stay, because `dist/index.d.ts` references them.
- `sideEffects`: `["./dist/styles.css"]`.
- `peerDependencies`: `react` and `react-dom` `>=19`.
- `bin`: `init-skills` → `bin/init.mjs`.

## init-skills (`bin/init.mjs`)

From a consuming project, `npx @dooph-software/design-system init-skills` copies the package's `skills/` into `.agents/skills`, `.claude/skills` and `.agent/skills`. It asks Y/n for each, merges into a directory that already exists, and after copying prints the stylesheet imports: a JS-entry `styles.css` import, or a CSS-entry block of `tailwindcss`, `styles.css` and `theme.css`. It then points to the setup skill. If every target is deselected it copies nothing and prints no imports. `--yes` / `-y` answers yes to every prompt. With no input (stdin closed), every prompt takes its default, which is yes. It changes nothing else in the project.

## Skill mirrors (`scripts/sync-skills.mjs`)

- Canonical: every directory in `.agents/skills/`, third-party skills included. Mirrors: `.claude/skills/` and `.agent/skills/`.
- A sync copies missing or differing files and removes mirror entries with no canonical source. Mirrors are real files, never symlinks: on a Windows clone with `core.symlinks=false`, a symlink checks out as a text file and the skill stops loading. A mirror root that is itself a symlink or junction is unlinked and rebuilt, never followed.
- `--check` compares byte for byte, reading CRLF as LF.
- The shipped consumer skills in `skills/` are a separate set. `init-skills` installs them; they are not mirrored.

## Scripts with header contracts

`scripts/check-conventions.mjs`, `scripts/generate-docs.mjs`, `scripts/sync-skills.mjs` and `scripts/lib/surface.mjs` open with `## behavior` / `## constraints`. Read the header before editing one. Points that matter most:

- check-conventions: check names and whys are quoted word for word by the skills, so renaming one means updating every skill that cites it. A new check is one object appended to `CHECKS`, plus a fixture. The `"use client"`, JS-timer and stylesheet-hex allowlists live in this file.
- generate-docs: reads source, never `dist/`. Its output must stay deterministic.
- surface.mjs: the TS-API and CSS extraction that `generate-docs.mjs` (source) and `scripts/surface.mjs` (a built tree) use.

## Storybook

- `.storybook/main.ts`: stories `../src/**/*.stories.@(ts|tsx)`, the `@storybook/react-vite` framework, `@storybook/addon-docs`, and the `@tailwindcss/vite` plugin. `STORYBOOK_BASE_PATH`, when set, becomes the Vite `base`.
- `.storybook/preview.ts` imports `../src/styles/index.css`, so Storybook renders source and needs no build. Its toolbar's Theme (Light/Dark) toggles `.dark` on `<html>`. There is no `color` control matcher.
- `.storybook/preview-head.html` loads Bricolage Grotesque, Host Grotesk, Google Sans Flex and Google Sans Code from Google Fonts. It is for Storybook only and never ships.
- Ports: `npm run storybook` serves 6006. The `.claude/launch.json` entry "storybook" runs `npx storybook dev -p 6007 --no-open` on 6007.

## CI (`.github/workflows/`)

- `deploy-storybook.yml`: on push to `main` (or by hand), `npm ci`, `npm run lint`, `npm run build-storybook` with `STORYBOOK_BASE_PATH=/<repo>/`, then deploy to GitHub Pages.
- `release-package.yml`: when a GitHub release is published, `npm ci`, `npm run lint`, then `npm publish --access public` through OIDC trusted publishing. npm runs `prepublishOnly`, which builds.
- In both, a lint failure fails the job before anything is built or published.
