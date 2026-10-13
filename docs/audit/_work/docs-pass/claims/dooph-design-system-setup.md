# Claims: dooph-design-system-setup

Every factual claim in `skills/dooph-design-system-setup/SKILL.md` (S), `references/fonts-and-preset.md` (F) and `references/client-references.md` (C), with evidence. Line numbers are against the working tree on 2026-10-11.

**Test rig.** "scratch build": the working tree (`src/`, `scripts/`, `bin/`, `skills/`, package.json, tsup.config.ts, tsconfig) copied to the session scratchpad, `node_modules` junctioned, `npm run build` (log: `[add-use-client] stamped "use client" on 54 output chunk(s) from 27 client source module(s).`), then `npm pack --ignore-scripts`. "scratch app": `git archive HEAD` of `ds-consumer-template` (c48344d, Next.js 16.4.0, Turbopack, Tailwind v4) plus a copy of its `node_modules`, with the packed tarball extracted over `node_modules/@dooph-software/design-system`. The template repo was only read. "tw rig": `@tailwindcss/cli` 4.3.3 compiling `@import "tailwindcss"` with and without `@import "./theme.css"` (a copy of src/styles/theme.css, byte-identical to the built dist/theme.css by `cmp`) over a content file holding each utility, then a class-by-class diff of the output. "browser": the scratch app under `next start -p 3917`, read in the browser pane with `getComputedStyle`.

## SKILL.md

| # | Claim | Evidence |
|---|---|---|
| S1 | The package ships React components, `styles.css`, an optional Tailwind v4 preset `theme.css`, and skills | package.json:20-28 (exports `.`, `./styles.css`, `./theme.css`), :35-47 (`files`: dist, skills, bin); theme.css:13-14 ("Only needed by apps that run their own Tailwind v4 build") |
| S2 | `styles.css` holds the tokens plus the classes the DS's own components use | scripts/emit-css.mjs:5-8, :22 (compiles build.css); src/styles/build.css:1-7 (index.css minus stories); src/styles/index.css:1-4 (`source(none)`, scans only the DS's `src/`), :4 (`@import "./tokens.css"`) |
| S3 | It loads no font | `grep -n "@font-face" dist/styles.css` → 0 (scratch build); `grep -rn "font-face\|googleapis\|@import url" src/styles` → none; .storybook/preview-head.html:1-6 ("NEVER shipped … Consuming projects load fonts") |
| S4 | It paints no page | No `body` rule in src/styles/index.css (grep `^\s*body` → none); dist/styles.css:23-27 (scratch build) is Tailwind preflight only: font stack and line-height on `html`, no background |
| S5 | Install command; peers react and react-dom 19 or later | package.json:64-67 (`"react": ">=19"`, `"react-dom": ">=19"`); bin/init.mjs:108 ("npm install @dooph-software/design-system") |
| S6 | The three-line import order for a Tailwind v4 app | src/styles/theme.css:6-11; ds-consumer-template app/globals.css:1-3. Note (tw rig): swapping `theme.css` before `@import "tailwindcss"` produced identical utility output, so the skill states the order without claiming a reason |
| S7 | Without Tailwind: import styles.css in the JS entry and skip theme.css | bin/init.mjs:175-183 (prints `import '@dooph-software/design-system/styles.css'`, "app/globals.css, src/main.tsx, or equivalent"); theme.css:13, :17 ("Apps that do not use Tailwind can ignore this file"); package.json:32-34 (`sideEffects` keeps `./dist/styles.css`) |
| S8 | The page-paint body rule | ds-consumer-template app/globals.css:19-25 (same rule in `@layer base`); browser: body background `rgb(253, 254, 255)` = `--ui-color-surface-page` light `#fdfeff` (tokens.css:113) |
| S9 | `npx @dooph-software/design-system init-skills`, `--yes` skips prompts | bin/init.mjs:6, :9, :44, :60-63; scratch app: `npx --no-install init-skills --yes` installed into `.agents/skills`, `.claude/skills`, `.agent/skills` |
| S10 | Without theme.css, app-code DS utilities generate nothing in the app's build | tw rig: base build (no preset) emits no `p-md`/`gap-md`/`m-md`/`h-md`/… (diff shows `base: (none)`) |
| S11 | A DS name can seem to work without the preset only because a DS component uses the class | S2 (styles.css is compiled from the DS's own sources only) |
| S12 | DS spacing values xs 6px, sm 8px, md 12px, lg 16px, xl 20px | src/styles/tokens.css:583-588 |
| S13 | With theme.css, `w-`, `min-w-`, `max-w-`, `basis-`, `inline-`, `min-inline-`, `max-inline-` with xs…xl switch from `var(--container-*)` to `var(--ui-spacing-*)` | tw rig diff, e.g. `max-w-md | base: max-width: var(--container-md); | theme: max-width: var(--ui-spacing-md);`, same pattern for all 7 × 5; theme.css:112-121 (`--spacing-*` keys) |
| S14 | `max-w-md` becomes 12px, not 28rem | browser: `#col-md` (`max-w-md`) computed `maxWidth` = `12px`; node_modules/tailwindcss/theme.css:337 `--container-md: 28rem` |
| S15 | `font-mono` becomes the DS mono stack | tw rig: `font-mono | base: font-family: var(--font-mono); | theme: font-family: var(--ui-font-mono);`; theme.css:100; browser: `.font-mono` computed `"Google Sans Code", ui-monospace, …` |
| S16 | `2xl` and above unchanged | tw rig: `max-w-2xl` etc. absent from the diff; browser `max-w-2xl` = `672px` |
| S17 | The grep finds the taken-over names and not `2xl` or `p-md` | ran the exact command on a sample: matched `max-w-md w-xl basis-sm min-w-xs inline-lg`, not `max-w-2xl` or `p-md` |
| S18 | `max-w-(--container-md)` and `max-w-[28rem]` keep the container width | tw rig (c2.html): output holds `--container-md: 28rem` in the theme block and `.max-w-\(--container-md\) { max-width: var(--container-md) }`; browser: `#col-container` = `448px` |
| S19 | Failure: no typecheck or build reports the takeover | scratch app with `max-w-md` page: `npm run typecheck` exit 0, `next build` exit 0; SCORES.md:476-478 (typecheck/build cannot see must-lines) |
| S20 | The DS declares its font defaults on `:root` and `.light`, never on `.dark` | tokens.css:33-36 (`:root, .light` block opens), :407-420 (font tokens inside it); `sed -n 765,892p tokens.css \| grep -c font` → 0 |
| S21 | Text falls back to `system-ui` when the face is not loaded | tokens.css:409-414 (each stack ends `system-ui, sans-serif`) |
| S22 | An axis the loaded file lacks is ignored silently | src/components/Text/constants.ts:79-83 ("Setting an axis a font does not implement is a harmless no-op … no fallback or error") |
| S23 | Mapping on `:root` alone: a `.light` element reverts to the DS default family names; on `:root, .light` it holds | browser, unlayered probe `:root { --ui-font-body: "Probe Face", serif }`: `<html class="light">` → html "Probe Face", a `.light` div inside a `.dark` div → `"Google Sans Flex", system-ui, sans-serif`; with `<html class="dark">` the `.light` island also reverts. Probe `:root, .light { … }` → the island reads "Probe Face" |
| S24 | The root import is server-safe | `grep -c "use client" dist/index.js` → 0 (installed copy in scratch app) |
| S25 | A Server Component can render any DS component (client ones included) with serialisable props | scratch app: server pages `/setup-check` (Input, ToggleSwitch, CopyButton, ShapeMorphSpinner, DropdownCaret, Button, Text components) and `/server-safe` (Tabs, Checkbox, FadeChangeText, Tooltip, Modal) built with `next build` exit 0; `/setup-check` rendered with no error overlay and `Input` held its `defaultValue` (browser) |
| S26 | It cannot pass an `onClick` (even to server-safe `Button`) or `onValueChange` | scratch app `next build`: `/neg-a` (`<Button onClick>` in a server page) and `/neg-b` (`<ToggleSwitch onValueChange>`) both exit 1 with "Error: Event handlers cannot be passed to Client Component props." |
| S27 | Shape components in `shapes` fail; `Shapes` keys work | scratch app: `/neg-d` `shapes={[CloverShape, PuffShape]}` → exit 1, "Functions cannot be passed directly to Client Components …"; `/ok-d` `shapes={[Shapes.clover, Shapes.puff]}` → built (○ /ok-d); src/components/Shapes/shapePaths.ts:23 (`ShapeInput = DsShapeComponent \| Shapes`) |
| S28 | A server import of a const from a `"use client"` file gets a reference and fails at render | scratch app `/neg-c`: server page reads `PLAN_LABEL.toUpperCase()` from a `"use client"` file → `next build` exit 1, "TypeError: c.PLAN_LABEL.toUpperCase is not a function" |
| S29 | Every exported const, variant function and util of the DS is server-safe | classification script over the installed `dist/index.js` (each export → its chunk → first line): the only non-component client export is `useToast`; `buttonVariants`, `tabTriggerVariants`, `cn`, `resolveDsColor`, `DS_COLOR_TOKENS`, every `*Variant`/`*Size` const are in non-directive chunks. Source side: scripts/check-conventions.mjs:145-202 (the 27 directive modules; none exports a const read elsewhere); src/components/Text/constants.ts:1-3 ("server-safe (intentionally NO "use client")") |
| S30 | 65 client exports | same script: `exports: 328 client: 65 server-safe: 263`; identical on the scratch build's dist and the installed copy (`diff` → same) |
| S31 | init-skills overwrites same-named files and never deletes | bin/init.mjs:151-157 (`cp(PKG_SKILLS, dest, { recursive: true, force: true })`, no removal anywhere in the file) |
| S32 | Raw `tsc` without `next typegen` reports `Cannot find name 'LayoutProps'`; the typecheck script exits 0 | scratch app, pristine copy: `tsc --noEmit` → `app/layout.tsx(38,50): error TS2304: Cannot find name 'LayoutProps'.`, exit 2; `npm run typecheck` (`next typegen && tsc --noEmit`, template package.json:9) → exit 0; SCORES.md:641-644 |
| S33 | `next build` catches the server/client errors; typecheck passes them | neg-a/b/c/d build logs each show "Finished TypeScript" before the prerender error |
| S34 | Rationalization quotes | SCORES.md:394-395, :642 ("The layout error is pre-existing.", "No TypeScript errors in the pricing files.", `\| grep pricing`); SCORES.md:410-412, :541 ("A page at `app/settings/notifications/page.tsx` - client component with form state") |
| S35 | Scope split: theming owns overrides/dark/islands/preset; usage owns components and Text | task-6-brief.md target doc set table |

## references/fonts-and-preset.md

| # | Claim | Evidence |
|---|---|---|
| F1 | No font files, no `@font-face` | S3 |
| F2 | Role tokens and default families (Google Sans Flex ×3, Host Grotesk, Bricolage ×2, Google Sans Code then `ui-monospace`) | tokens.css:407-420 |
| F3 | Weights: body 400, button 500, CTA 600, heading 600, label 400, title 700, hero 700, mono 500 | tokens.css:445-461 (`--ui-weight-body` 400, `-button` 500, `-label` → regular 400, `-subheading` → heading, `-heading` 600, `-title` 700, `-hero` 700, `-mono` → button, `-cta` → semibold 600) |
| F4 | Axes: body `wdth 100, GRAD 19, ROND 100, slnt 0`; button and heading `GRAD 11`; mono `MONO 1` | tokens.css:463-471; browser: `BodyText` computed `font-variation-settings` = `"GRAD" 19, "ROND" 100, "slnt" 0, "wdth" 100`; `.text-style-mono` = `"MONO" 1`, weight 500 |
| F5 | Button axes also serve the CTA (heading axes also serve subheading) | src/components/Text/constants.ts:110-121 (ROLE_AXIS_TOKEN: cta → button; subheading → heading); index.css:352-353 |
| F6 | `BaseText` `fontWeight` and `axes` props can request others | src/components/Text/constants.ts:58-65, :76-100; src/components/Text/textStyle.ts:100-108 |
| F7 | A missing axis is ignored; Google Sans Flex defaults GRAD 0, ROND 0 | Text/constants.ts:79-83; next/font metadata `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json` "Google Sans Flex" axes GRAD default 0, ROND default 0 |
| F8 | Axis ranges per family | font-data.json (Google Sans Flex GRAD 0..100, ROND 0..100, opsz 6..144, slnt -10..0, wdth 25..151, wght 1..1000; Google Sans Code MONO 0..1, wght 300..800; Host Grotesk wght 300..800; Bricolage opsz 12..96, wght 200..800); the same ranges in .storybook/preview-head.html:10, :18, :28 |
| F9 | Request MONO as a range | .storybook/preview-head.html:21-26 (comment) and :28 (`MONO,ital,wght@0..1,0,300..800`) |
| F10 | The `next/font` block | ds-consumer-template app/layout.tsx:1-31 (Flex with `axes: ["GRAD","ROND","wdth"]`, Host Grotesk 400/500/600, Bricolage); Google_Sans_Code with `axes: ["MONO"]` added in the scratch app: `next build` exit 0, browser `document.fonts` lists "Google Sans Code 300 800" loaded, mono text computes `"Google Sans Code", …` |
| F11 | `next build` warns "Failed to find font override values" for Google Sans Flex / Code; fonts still load | scratch app build logs (pristine template layout already prints the Flex one); browser `document.fonts` loaded: "Google Sans Flex 1 1000", "Host Grotesk 400", "Bricolage Grotesque 200 800", "Google Sans Code 300 800" |
| F12 | The Google Fonts `<link>` URLs | .storybook/preview-head.html:10, :18, :28 (Storybook loads them and maps nothing; tokens.css defaults name the same families) |
| F13 | Mapping block on `:root, .light`, unlayered beats DS defaults | tokens.css:18-21 (consumer unlayered > layers); S23 (selector) |
| F14 | Font tokens have no dark value | S20 |
| F15 | Colours differ (light-only scoping) — defer to theming | SCORES.md:361-378 (`:root, .light` recoloured dark for a colour token) |
| F16 | Preflight sets the system font stack on `html`, no background | dist/styles.css:12, :23-27 (scratch build) |
| F17 | Text components set their own role font | src/styles/index.css:247-262 (`.text-style-*` set `font-family: var(--ui-font-<role>)`) |
| F18 | theme.css is `@theme inline`, names resolve to `var(--ui-…)` and follow overrides | theme.css:15-17, :20 |
| F19 | Takeover table, container values 20/24/28/32/36rem | tw rig diff (S13, S15); node_modules/tailwindcss/theme.css:335-339 |
| F20 | Unchanged: `2xl`+, `text-sm`, `rounded-md`, `shadow-md`, `md:`, `@md:` | tw rig: all compiled in both builds, none in the diff |
| F21 | New names `p-md`, `gap-md`, `m-md`, `h-md`, `size-md`, `inset-md`, `translate-x-md` | tw rig diff (`base: (none)`) |
| F22 | `rg` 10px, `xxs` 4px, `xxxs` 2px, `xxl` 26px, `xxxl` 42px | tokens.css:581-590 |
| F23 | Escape hatches | S18 |

## references/client-references.md

| # | Claim | Evidence |
|---|---|---|
| C1 | `dist/index.js` has no directive; each export comes from a chunk; a chunk's first line `"use client"` makes its exports client references | S24; installed `dist/index.js:111-112` (`Input` from `./chunk-6PCYS7VY.js`), whose first line is `"use client";`; scripts/add-use-client.mjs:1-19 (stamps the directive as the first line of every chunk containing a client module) |
| C2 | 65 of 328 runtime exports are client; 263 server-safe; consts, variant functions and utils server-safe | S29, S30 |
| C3 | Render with serialisable props; no functions | S25-S27 |
| C4 | The exact two error messages | S26, S27 |
| C5 | Server-safe `Button` with `onClick` fails the same way | S26 |
| C6 | `useToast` is a hook | scripts/check-conventions.mjs:195 (Toast allowlist reason: "exposes it through createContext/useContext (useToast)") |
| C7 | `shapes`: keys build, components fail | S27 |
| C8 | Pricing example builds | scratch app `/pricing` with the exact two files: `npm run typecheck` passed, `next build` exit 0 (○ /pricing); lib/plans.ts `Plan` has `id`, `name` |
| C9 | The 65 names, by area | client-exports script output (scratch build and installed copy identical); module of origin per scripts/check-conventions.mjs:145-202 (AIModelSelect, AIPromptInput, AIThinkingPart, RevealChangeText, RollingDigitsText, Calendar, CalendarCaption, CalendarGrid, CalendarPresetsPanel, CopyButton, DatePicker, DatePickerSplitTrigger, DropdownTrigger, Input, DropdownMenu, DropdownMenuSearch, MorphRotationShape, OutlineButton, SegmentedTabSelect, SidebarWithHoverIcon, Slider, Toast, FancyToggleSwitch, Toggle, VerificationCodeInput; ChangeSwapShell and useChangeSwap are allowlisted but not exported from the root) |
| C10 | Button, Checkbox, Tabs, Modal, Sheet, Popover, Tooltip, Table, Text, icons, shapes, FadeChangeText, RollChangeText, ShapeMorphSpinner, DropdownCaret, LoadingSpinner are server-safe | client-exports script (all in non-directive chunks); `/server-safe` and `/setup-check` built |
| C11 | Radix-wrapping server-safe components keep their client part behind its own boundary | `/server-safe` page (Tabs, Checkbox, Tooltip, Modal from a Server Component) built, exit 0 |
| C12 | How to check one name in the installed copy | C1 (manual steps reproduced on the installed copy) |

## Not claimed (checked and left out)

- Why the import order matters: swapping theme.css and tailwindcss changed no utility (tw rig), so no reason is given.
- That `next/font` renames families: in Next 16.4 the variables hold the real family names (`--font-google-sans-flex` = `"Google Sans Flex"`, `--font-host-grotesk` = `"Host Grotesk", "Host Grotesk Fallback"`), so the skill only says to map through the variables.
- Vite's per-file warning for the directive (doc-refresh.md:60-62): not reproduced, so not stated.

## Fix round 1 additions

| # | Claim | Evidence |
|---|---|---|
| X1 | `next build` renders only static (○) routes; a server/client error on a dynamic (ƒ) route shows only on request | scratch app `/dyn-neg` (`export const dynamic = "force-dynamic"`, `<Button onClick>` in a server page): `next build` exit 0 listing `ƒ /dyn-neg`; under `next start` a request returns 500 and the log prints "Error: Event handlers cannot be passed to Client Component props." |
| X2 | `next typegen` and the global `LayoutProps` exist from Next.js 15.5; on older Next use `next build` | review note (Next.js 15.5 release added `next typegen` and the route-type globals); the template's Next 16.4.0 has both (`npm run typecheck` ran `next typegen`) |
| X3 | Server Actions (`"use server"`) are the one function a Server Component can pass | React/Next error text in the scratch build: "Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with \"use server\"" (neg-d log) |
| X4 | `next/font` accepts Flex `axes: ["GRAD", "ROND", "opsz", "slnt", "wdth"]` and Bricolage `axes: ["opsz"]` | font-data.json in the template's next (Flex axes GRAD, ROND, opsz, slnt, wdth, wght; Bricolage opsz, wdth, wght); scratch app layout with exactly those calls: `next build` exit 0 |
| X5 | `opsz` matters because the Text components set `font-optical-sizing: auto` | src/styles/index.css:249, :258, :274 (and the other `.text-style-*` rules) |
| X6 | Bricolage `wdth` 75..100; Host Grotesk `wght` 300..800 in both the table and the `<link>` | font-data.json; `curl` of the exact `<link>` URL → HTTP 200, faces `font-stretch: 75% 100%`, Bricolage `font-weight: 200 800`, Host Grotesk `font-weight: 300 800` |
| X7 | The takeover grep with `--exclude-dir=node_modules --exclude-dir=.next … .` | same pattern as S17; the flags are GNU grep options |
| X8 | The client export list is generated | scripts/generate-docs.mjs `generateClientReferences` (between `GENERATED:client-references` markers; header behavior bullet); output 328 / 65 / 263, and its 65 names are identical (`diff`) to the dist-chunk classification of the scratch build; `--check` printed `stale skills/dooph-design-system-setup/references/client-references.md` and exit 1 after `CopyButton` was deleted from the table, and lint failed "generated doc references out of date"; after regeneration `--check` exit 0. surface.mjs untouched (only `extractExports`, `createSourceProgram` and `loadTs` are called), so its byte-identical surface output is unaffected |
| X9 | `bin/init.mjs` now prints the JS import, the CSS imports with theme.css after tailwindcss, and points to the setup skill | bin/init.mjs:171-188; ran `node bin/init.mjs --yes` in an empty scratch dir: output as described, five skills copied |

## Claim-check fix (batch 5)

- F-theme (fonts-and-preset.md:90, replaces any earlier "maps every DS token" claim): `theme.css` maps the colour, font-family, text-size, radius, shadow and spacing tokens only (137 of 291 `--ui-*` names). Evidence: `grep -o '^  --[a-z]*-' src/styles/theme.css | sort | uniq -c` gives color 83, font 7, radius 10, shadow 12, spacing 13, text 12; scripts/sync-theme.mjs `EXCLUDED` skips weights, font axes, tracking, icon sizes. The generated theme.css header (template in scripts/sync-theme.mjs) now says the same.
