# Rulebook (normative rules) — audit @ b436647

Source abbreviations:
- `arch` = `.agents/skills/dooph-ds-architecture/SKILL.md`
- `contrib` = `.agents/skills/dooph-ds-contribution/SKILL.md`
- `AGENTS` = `AGENTS.md`
- `fhc` = `.agents/skills/file-header-contracts/SKILL.md`
- `li` = `.agents/skills/dooph-ds-loading-indicators/SKILL.md`
- `vm` = `.agents/skills/dooph-ds-writing-version-migrations/SKILL.md`
- plus each file's own `## constraints` block (cite as `<path>:<line>`; not duplicated here)

`check:` gives a machine check where one exists (run from repo root, ripgrep syntax). `manual` = needs reading.

## R1 — Dot-accessible variant/size enums (arch Rule 1)

- **R1.1** arch:14 — "Every component with discrete options MUST export a `const` object that callers can dot-access for IntelliSense. No string literals in consuming code, ever." check: manual (compare cva variant keys / string-union props against exported consts).
- **R1.2** arch:30 — "The type is always derived from the const — never a hand-written union type that duplicates the keys." Form: `export type X = (typeof X)[keyof typeof X]`. check: `rg -n "export type \w+ =\s*['\"]" src` and `rg -n "^\s*\w+\??:\s*['\"][a-z-]+['\"]\s*\|" src --glob '!*.stories.tsx'`.
- **R1.3** arch:32 — "`destructive` and `brand` no longer exist as keys anywhere ... Do not reintroduce either old spelling." check: `rg -n "\bbrand\b|destructive" src skills .agents .claude`.
- **R1.4** arch:59-75 — Open-value exception: a prop whose value is a design value (colour, size, weight) MUST also accept a raw value; such props take a const of `var(--ui-*)` strings; the prop type is `X | (string & {})` (plus `number` where numeric). check: manual.
- **R1.5** arch:79-80 — "When a variant enum would only ever wrap ONE design value, prefer this [open value]". check: manual.
- **R1.6** arch:87-107 — A closed enum alongside an open value is right only when it selects a BUNDLE of non-derivable values. A bundle member with no defaults (`custom`) makes the props a discriminated union AND pairs it with an unconditional runtime `throw`; "Silently falling back would make an explicit choice look like it had been honoured." check: `rg -n "custom" src/components/*/constants.ts` then verify union + throw.
- **R1.7** arch:111-115 — "A prop like `fontSize` or `color` MUST be emitted as inline style ... Role/variant DEFAULTS stay classes (so consumers can override them); explicit props go inline." check: manual.
- **R1.8** arch:119 — "Const keys are **camelCase** (e.g. `iconSm`, not `IconSm` or `icon-sm`). The string VALUE may differ." check: `rg -n "^\s+['\"]?[A-Z][A-Za-z]*['\"]?\s*:" src/components/*/constants.ts` and `rg -n "^\s+['\"][a-z]+-[a-z-]+['\"]\s*:" src/components/*/constants.ts`.
- **R1.9** arch:120 — "The const object and the derived type share the **same identifier**." check: for every `export const X = {…} as const` in constants.ts, `rg -n "export type X\b"`.
- **R1.10** arch:121 — "All these exports must be re-exported from `src/index.ts`." check: compare constants.ts exports vs `dist/index.d.ts`.
- **R1.11** arch:122 — "Prop name is always `variant` (not `styleVariant`, not `type`, not `kind`). Size prop is always `size`. The only exceptions are ... `shape` (ShapeButton), `side` (SheetContent ...), and `selectType` (`DropdownMenu` ...)." check: `rg -n "\b(type|kind|styleVariant|appearance|tone|mode)\??:" src --glob '*.tsx' --glob '!*.stories.tsx'`.
  - NOTE (potential rulebook conflict): the naming table at arch:52 sanctions `CheckboxChecked` → prop `checked`, which is not in the "only exceptions" list at arch:122.

## R2 — Radix UI idiomatic usage (arch Rule 2)

- **R2.1** arch:133-145 — Required wrapper shape: `forwardRef<ComponentRef<typeof P.X>, ComponentPropsWithoutRef<typeof P.X>>`, destructure `className`, spread `...props` onto the primitive, `className={cn(baseStyles, className)}`, and `X.displayName = "X"`. check: `rg -n "ElementRef" src` (must be 0); `rg -c "forwardRef" src` vs `rg -c "displayName" src` per file.
- **R2.2** arch:149-154 — "Radix sets these automatically — style against them, never toggle classes in JS" (`data-[state=…]`, `data-[disabled]`, `data-[highlighted]`). check: `rg -n "\? ['\"][^'\"]*(bg-|text-|border-)" src --glob '*.tsx'` (ternary class toggles on state), manual.
- **R2.3** arch:158 — `DropdownMenu` root defaults `modal={false}`.
- **R2.4** arch:159 — Width is not a menu-level variant; items carry the 160px floor via `ds-min-w-menu` in `itemBase`; `matchTriggerWidth` defaults `true` and only widens via `ds-radix-dropdown-match-trigger-width`.
- **R2.5** arch:160 — `selectType` flows via `DropdownMenuPresentationContext` and trigger `data-select-type`; `DropdownMenuMultiSelectItem` calls consumer `onSelect` first then `event.preventDefault()` unless already prevented (sanctioned public keep-open API).
- **R2.6** arch:161 — `DropdownMenuMultiSelectItem`'s `Checkbox` is inert: `pointer-events-none`, `tabIndex={-1}`, `aria-hidden`.
- **R2.7** arch:162 — `DropdownMenuSection` has `ds-px-ui-xs`; `DropdownMenuContent` has no horizontal padding.
- **R2.8** arch:163 — `TypeableDropdownTrigger`: `<div>` root; nested `<input>`; state-aware `onPointerDown` pre-focuses input before Radix handler; suppress when already open for input clicks; pair with `focusOnOpen={false}`; open/focus styling via `data-[state=open]` + `focus-within:`, no `open` prop.
- **R2.9** arch:167-182 — "Overlay/floating content defaults to portalled (`portal={true}` ...). Always expose an escape hatch" (`portal`, `portalProps`). check: every `*Content` of an overlay primitive accepts `portal`/`portalProps`.
- **R2.10** arch:186 — Never `e.stopPropagation()` / `e.preventDefault()` on Radix internal event handlers. check: `rg -n "stopPropagation|preventDefault" src --glob '!*.stories.tsx'`.
- **R2.11** arch:187 — Never replace Radix focus management with custom JS focus traps.
- **R2.12** arch:188 — Never use `forceMount` unless integrating an external animation library. check: `rg -n forceMount src`.
- **R2.13** arch:189 — Never hard-code Radix internal class names.
- **R2.14** arch:193 / contrib:26 — Radix primitives are runtime `dependencies`, not devDependencies. check: every `@radix-ui/*` import in src is in package.json `dependencies`.

## R3 — TSX composability (arch Rule 3)

- **R3.1** arch:199 — "Components must not lock consumers into a fixed internal content structure. Children must flow freely into the underlying interactive element."
- **R3.2** arch:221 — "Leaf interactive components (Button, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton) support `asChild` via `@radix-ui/react-slot`." (contrib:42 generalizes: "For interactive/polymorphic leaf components: include `asChild?: boolean`".)
- **R3.3** arch:232-236 — "Wrapping children in a layout span is acceptable ONLY when visually required and the wrapper is not interactive." Sanctioned: OutlineButton `<span className="relative z-10 ...">`; DropdownMenuRadioSelectItem `<span className="flex flex-1">`; Avatar is children-only.
- **R3.4** arch:240 — Never "Render an intermediate `div` or `span` around `children` unless it's for a documented layout necessity."
- **R3.5** arch:241 — Never "Put interactive elements inside the wrapper that would create nested button/button or button/link issues."
- **R3.6** arch:236 — Avatar: "Do not add app-level logo providers or asset URL props to the package component."

## R4 — Framework-agnostic font system (arch Rule 4)

- **R4.1** arch:251 — Per-role font family tokens `--ui-font-{body,button,heading,label,title,hero,mono}`; mono stack falls back to `ui-monospace` etc., not bare `monospace`.
- **R4.2** arch:252 — `--ui-text-mono` and `--ui-weight-mono` ALIAS `--ui-text-body` and `--ui-weight-button`. (Note: codebase skill line 351 says both alias the BUTTON role; verify.)
- **R4.3** arch:253 — `--ui-font-var-{button,body,heading,mono}`; "Roles whose faces implement no axes (label/title/hero) ship no token." `axes` APPENDS to role token; role with no token emits axes standalone.
- **R4.4** arch:254 — `text-style-*` role classes live in `@layer components` (load-bearing: loses to utilities).
- **R4.5** arch:258-262 — "No leading token, no role sets `line-height` ... Do not reintroduce it."
- **R4.6** arch:266-268 — Never import `next/font/*`; no `@font-face` in any shipped `.css`; no font file URL in component code. check: `rg -n "next/font|@font-face|\.woff|fonts\.googleapis" src`.
- **R4.7** arch:272-279 + contrib:163-167 — `preview-head.html` Google Fonts URLs carry every axis a `--ui-font-var-*` token names, as a RANGE, ordered uppercase-first then lowercase alphabetically.

## R5 — Theme logic in tokens (arch Rule 5)

- **R5.1** arch:295 — Theme-dependent behaviour via `--ui-*` tokens on `:root`/`.light` and `.dark`.
- **R5.2** arch:296 — Use Tailwind utilities generated from tokens or `ds-*` helpers.
- **R5.3** arch:297 / contrib:107 — "Keep mode-invariant tokens only in `:root`/`.light`; add `.dark` overrides only when the value actually changes." check: script — for each token in `.dark`, compare value to `:root`.
- **R5.4** arch:298 — Inverse surfaces (TooltipContent) via semantic tokens + class switch, not theme state.
- **R5.5** arch:302 — Never read `document.documentElement`, `classList`, `matchMedia`, or `localStorage` inside package components to infer theme. check: `rg -n "documentElement|classList|matchMedia|localStorage" src --glob '!*.stories.tsx'`.
- **R5.6** arch:303 — Never `MutationObserver` to watch theme classes. check: `rg -n MutationObserver src`.
- **R5.7** arch:304 / contrib:127 — No React context providers for app-owned branding assets.
- **R5.8** arch:305 — No framework-specific asset systems (`next/image`, Vite public URLs, env vars) in components. check: `rg -n "next/|import\.meta\.env|process\.env" src --glob '!*.stories.tsx'`.

## R6 — Motion in tokens and CSS (arch Rule 6)

- **R6.1** arch:317-321 — "Every animated component gets a `--ui-<component>-*` family: at minimum a duration and an ease."
- **R6.2** arch:322-324 / contrib:133 — Reduced motion is `@media (prefers-reduced-motion: reduce)` in CSS, never `matchMedia` in a component.
- **R6.3** arch:325-332 — Prefer a transition for a value that changes repeatedly and an animation for once-per-life; a mount animation before a frame callback.
- **R6.4** arch:336-347 — Escape hatch for un-interpolatable properties: register inputs with `@property` (`<number>`), transition them in a `ds-*` class using the component's tokens, set TARGET values inline, sample in a SELF-TERMINATING rAF loop. "The component then holds no duration, no easing and no reduced-motion branch".
- **R6.5** arch:351-353 / contrib:131 — Never hardcode a duration or easing curve in a component (`const DURATION_MS = 220`, hand-rolled `easeOutCubic`). check: `rg -n "(DURATION|_MS|duration|ease|cubic-bezier|\d+ms)" src --glob '*.ts*' --glob '!*.stories.tsx'`.
- **R6.6** arch:354-357 / contrib:132 — Never mirror a CSS duration in a JS constant to stage motions.
- **R6.7** arch:358-359 — Never reach for a timer, frame callback or `transitionend` before checking a mount animation or plain transition.

## R7 — A component owns only its own subtree (arch Rule 7)

- **R7.1** arch:370-374 / contrib:134 — Never `el.closest(...)` (or any ancestor query) to find something to bind to. check: `rg -n "closest\(|parentElement|parentNode" src --glob '!*.stories.tsx'`.
- **R7.2** arch:375-376 — Never `addEventListener` on `document`/`window` except a genuine global concern. check: `rg -n "(document|window)\.addEventListener" src`.
- **R7.3** arch:380-391 — Ancestor state is a controlled prop; purely visual CSS-visible state prefers `.group` + `group-hover:`.

## R8 — Contribution checklist (contrib Step 1–6, token & sync sections)

- **R8.1** contrib:18 — A value that doesn't map to an existing token → add a `--ui-*` token; "never hardcode".
- **R8.2** contrib:21-24 — Interactive controls (checkbox, radio, switch, slider) and overlays/popovers/tooltips → always Radix; display-only → plain elements fine.
- **R8.3** contrib:29-34 — Folder shape: `MyComponent.tsx`, `index.ts` (re-exports everything public), `MyComponent.stories.tsx`.
- **R8.4** contrib:42 — Interactive/polymorphic leaf components include `asChild?: boolean` via `Slot`.
- **R8.5** contrib:45 — "`forwardRef` on every wrapped Radix part".
- **R8.6** contrib:46 — "`...props` spread onto the Radix element".
- **R8.7** contrib:47 — "`className={cn(internalStyles, className)}` — always accept className override" (order: internal first, consumer last).
- **R8.8** contrib:48 / contrib:129 — "`displayName` set on every forwardRef component".
- **R8.9** contrib:49 — Hover/focus/active/disabled states use `data-[state]` / `data-[disabled]` selectors only (Radix-wrapped components).
- **R8.10** contrib:52 / contrib:110 — "Only Tailwind utilities or `ds-*` helpers in className — no `var(--ui-*)` direct references". check: `rg -n "className=.*var\(--ui-|\[.*var\(--ui-" src --glob '*.tsx' --glob '!*.stories.tsx'`.
- **R8.11** contrib:53 / contrib:118-119 — No hardcoded hex colours; no hardcoded px for shadows/radii; no arbitrary Tailwind values like `bg-[#171717]`. check: `rg -n "#[0-9a-fA-F]{3,8}\b" src --glob '*.ts*'`; `rg -n "\w-\[[0-9.]+(px|rem)\]" src`.
- **R8.12** contrib:54 — "`style={{}}` only to carry a caller-supplied or token-referencing value that cannot be a class ... Never for a design value the component itself decided; that is a token. Merge a consumer's own `style` rather than replacing it". check: `rg -n "style=\{\{" src --glob '!*.stories.tsx'`; for each component spreading `...props` after/before `style=`, verify merge.
- **R8.13** contrib:56 — Corner radius uses `rounded-tight`, `rounded-normal`, or `rounded-soft`. (Note: `rounded-mini` exists per codebase skill; list is non-exhaustive vs tokens.)
- **R8.14** contrib:57 — Focus ring uses `ds-focus-*` outline helpers (`ds-focus-visible-ring`, `ds-focus-within-ring`, `ds-focus-ring-on-focus`) — not `shadow-focus-prominent`/`shadow-focus-primary` in component class strings. check: `rg -n "shadow-focus|focus-visible:ring|focus:ring|outline-" src --glob '*.tsx'`.
- **R8.15** contrib:58 — "Radix ref types use `ComponentRef`, not deprecated `ElementRef`". check: `rg -n ElementRef src` → 0.
- **R8.16** contrib:59 — "Disabled state uses `ds-disabled-state` (for native + aria-disabled) or `ds-radix-data-disabled` (for Radix data-disabled)". check: `rg -n "disabled:opacity|opacity-50|disabled:cursor" src`.
- **R8.17** contrib:60 — "Typography uses `text-style-*` composite utility classes".
- **R8.18** contrib:65 — "If a layout wrapper IS necessary, it is `aria-hidden` and absolutely positioned (like OutlineButton's blur orbs)". (Potential conflict with R3.3 — see conflicts.)
- **R8.19** contrib:68-69 — Component, consts, types exported from folder `index.ts`; all public exports in `src/index.ts`.
- **R8.20** contrib:70 — "Dot-accessible consts declared in a sibling `constants.ts` with **no** `"use client"`".
- **R8.21** contrib:71 — "`"use client"` added only if the module actually uses `useState`/`useEffect`/`useRef`, a browser API, or a timer. `forwardRef`, `memo`, `useId`, `useMemo` and `useCallback` all work in React's server build". (Implies: modules using useState/useEffect/useRef/useContext/createContext/useLayoutEffect/useImperativeHandle/event handlers need it.)
- **R8.22** contrib:74-81 — Every variant and meaningful state needs a Storybook story.
- **R8.23** contrib:96 / contrib:108 — After token changes run `npm run sync-tokens`; misnamed utility → `ALIASES` in `sync-theme.mjs`; raw-var-only token → `EXCLUDED`.
- **R8.24** contrib:98 — Remove deprecated variants/sizes from BOTH the `cva` map AND the exported const.
- **R8.25** contrib:100 — "Document breaking changes in a comment at the top of the component file if any API surface was removed." (Conflicts with R11.13 — see conflicts.)
- **R8.26** contrib:109 — A token's `ds-*` helper goes in `dooph-component-tokens.css` under `@layer utilities`.

## R9 — Contribution anti-pattern table (contrib:116-141)

- **R9.1** contrib:118 — No inline `style={{ color: '#…' }}`.
- **R9.2** contrib:119 — No arbitrary Tailwind value (`bg-[#171717]`).
- **R9.3** contrib:120 — No prop named `styleVariant` or `type` for discrete options.
- **R9.4** contrib:121 — No PascalCase const key.
- **R9.5** contrib:122 — No string union type for a variant instead of derived type.
- **R9.6** contrib:123 — No `e.stopPropagation()` inside a Radix handler.
- **R9.7** contrib:124 — No `next/font/google` in `src/`.
- **R9.8** contrib:125 — No `@font-face` in `src/styles/*.css`.
- **R9.9** contrib:126 — No `documentElement.classList`, `matchMedia`, `localStorage`, `MutationObserver` for theme.
- **R9.10** contrib:127 — No package context/provider for app-owned logos/asset URLs.
- **R9.11** contrib:128 — No `<div>` around `children` without layout necessity.
- **R9.12** contrib:129 — Don't forget `displayName` on forwardRef components.
- **R9.13** contrib:130 — Stories use variant consts (`variant={ButtonVariant.primary}`), not hard-coded className/string values.
- **R9.14** contrib:131 — No `const DURATION_MS` / hand-rolled easing in a component.
- **R9.15** contrib:132 — No JS constant mirroring a CSS duration.
- **R9.16** contrib:133 — No `matchMedia("(prefers-reduced-motion: reduce)")` in a component.
- **R9.17** contrib:134 — No `el.closest(...)` to bind listeners.
- **R9.18** contrib:135 — Never hand-edit `src/components/Icons/index.ts`.
- **R9.19** contrib:136 — No `var()` as an SVG ATTRIBUTE (`width="var(--ui-…)"`); set it as a CSS property. check: `rg -n "(width|height|stroke|fill|strokeWidth|r|cx|cy)=\{?['\"\`]var\(" src`.
- **R9.20** contrib:137 — No JS table of sizes that a token is documented as controlling ("Render from the token and keep the JS number for the viewBox / geometry only").
- **R9.21** contrib:138 — `*Icon.tsx` exported const must match filename.
- **R9.22** contrib:139 — No Tailwind variant on a package class (`data-[active]:ds-…`, `[&_h1]:text-style-…`) — emits no rule. check: `rg -n "[a-z\]\)]:(ds-|text-style-)" src --glob '*.tsx'`.
- **R9.23** contrib:140 — Stories must include at least one story where each override prop CONTRADICTS the role/variant default.
- **R9.24** contrib:141 — Stories use `Button`/`ButtonVariant` rather than raw `<button>`/`<div>` where a DS component exists. check: `rg -n "<button" src --glob '*.stories.tsx'`.

## R10 — AGENTS.md file contracts

- **R10.1** AGENTS:3-4 — Read a file's header contract before editing it.
- **R10.2** AGENTS:6-8 — A change that contradicts a constraint stops and is raised; removing a constraint is its own commit with reasoning.
- **R10.3** AGENTS:9-11 — No constructed/narrowed readings of a constraint.
- **R10.4** AGENTS:14-15 — "If your change alters behavior the header describes, update the header in the same commit." (→ a header whose `## behavior` does not match the code is contract drift.)
- **R10.5** AGENTS:16-17 — Do not add a contract to a file without an invariant a reasonable edit would violate.
- **R10.6** AGENTS:18-19 — A pointless-looking line in a contracted file is presumed load-bearing.

## R11 — Header contract format (fhc)

- **R11.1** fhc:37-45 — Coverage deliberately sparse (~1 file in 15). Skip barrels, icon and story files, components whose whole story is variant → token mapping.
- **R11.2** fhc:47 — "Absent contract > wrong contract. A stale header reads as authoritative and misleads."
- **R11.3** fhc:51-58 — Sectioned form: title line `Name — one-line job`; then lowercase `## behavior`, `## constraints`, optional `## updating`, in that order.
- **R11.4** fhc:62 — "If it must not change, it is a constraint — not behavior."
- **R11.5** fhc:66 — One invariant → prose form; two or more → sectioned.
- **R11.6** fhc:68 / fhc:182 — "Past ~40 the file is doing too much — that is the finding, not a longer header."
- **R11.7** fhc:99 / fhc:168 — Every constraint names the specific failure it prevents.
- **R11.8** fhc:111-125 / fhc:180 — Never qualify a prohibition ("unless", "other than", "except when"); a genuine exception gets its own sentence.
- **R11.9** fhc:158 — Contract is the first thing in the file — above `"use client"`, above imports.
- **R11.10** fhc:159 — Use `/*`, not `/**`, in component and module source (scripts/CLI entry points excepted).
- **R11.11** fhc:160 — Backtick identifiers, tokens, class names, CSS variables.
- **R11.12** fhc:161 — Generated files carry `AUTO-GENERATED by <script>. Do not edit by hand.` naming the generator.
- **R11.13** fhc:173-174 — No changelog entries ("Contracts describe the present; history lives in git"), no TODOs / "for now" notes.

## R12 — Loading indicators (li)

- **R12.1** li:30-31 — Every const lives in a sibling `constants.ts` with no `"use client"`.
- **R12.2** li:51-53 — "Values live in both `tokens.css` (`--ui-size-spinner-*`) and `spinnerGeometry.ts` ... **Keep them in sync.** CRITICAL: ... Changing tokens.css alone has no effect on rendered size." (Conflicts with R9.20 and with codebase skill:473-480 — see conflicts.)
- **R12.3** li:55 — "`getSpinnerGeometry(size)` computes everything a component needs. **Never hardcode pixel values or recompute geometry in components.**"
- **R12.4** li:130 / li:242 — `useId()` for `<pattern>`/`<defs>` ids; never a static id.
- **R12.5** li:176 / li:241 — Every rAF `useEffect` returns `() => cancelAnimationFrame(frameId)`.
- **R12.6** li:214 — Track always uses `var(--ui-color-border-primary)`, never the indicator colour.
- **R12.7** li:220 — `ds-spinner-rotate` is the only loading-indicator keyframe; do not re-add `ds-spinner-arc`.
- **R12.8** li:234-242 — Anti-patterns: no gray wave track; no sampled partial wave; no wave in LoadingSpinner; no `<circle>`+dashoffset for flat spinner; no CSS `animation` on flat spinner paths; `getSpinnerGeometry` once per render; no `setState` in rAF loop.
- **R12.9** li:252-254 — `MorphRotationShape/engine/` stays a faithful port; fixes go in `engine/svgPath.ts`.
- **R12.10** li:255-258 — Shape-morph timing is CSS; `--ui-shape-morph-ease` is GENERATED by `scripts/generate-shape-morph-ease.mjs` from `scripts/shapeMorphSpring.mjs`; "Retune there, never in `tokens.css` by hand or in a component."
- **R12.11** li:268-271 — MorphRotationShape anti-patterns: never clamp the step value; never normalize shapes by bounds in frame modes; never write `d` from React after first render; reduced motion uses 1ms, not 0.
- **R12.12** li:275-276 — Targets may be fractional; never round them. `onStepComplete` fires only on whole stops.

## R13 — Version migrations & release (vm)

- **R13.1** vm:27-28 / vm:317 — A migration skill exists for majors only.
- **R13.2** vm:38-42 — Minor (new component/prop/token) → edit `dooph-design-system-usage` (and `-theming` if tokens moved). Patch → nothing ships. "A bug fix that needed consumer action was not a patch."
- **R13.3** vm:44-48 — "If a rename is worth doing, it is worth a major. If it ships in a minor anyway, you inherit the §7 forward-compat work."
- **R13.4** vm:66-69 — Record the "no migration needed" verdict; a skill after a gap says which chain a distant upgrader follows.
- **R13.5** vm:75-97 / vm:319-320 — Build the change inventory mechanically by diffing tags; never from memory.
- **R13.6** vm:101-105 / vm:321-322 — Every migration skill opens with the FULL inventory (incl. no-action lines), bucketed hard/silent/visual/additive.
- **R13.7** vm:126-152 — Structure: frontmatter description w/ version pair + symptoms + expiry; `metadata.short-description`; title+summary; inventory; prerequisites; numbered steps ordered tokens → utilities → TSX; visual changes; new-in-vN; Verify.
- **R13.8** vm:167-173 / vm:327-328 — Token rename = three tables (overrides, utility classes, `ds-*` helpers); read emitted names from `@theme inline` + `ALIASES`.
- **R13.9** vm:175-195 — Removed / merged / explicitly-unchanged cases each handled; bare-name traps given word-boundary patterns with `-P` and a no-PCRE2 fallback.
- **R13.10** vm:237-264 — Codemod shape: AUTO vs REPORT split; dry-run default + `--write`; identifier boundaries `(?<![\w$])Name(?![\w$])`; skip list + extension allowlist; exit 0 unless actionable; zero deps (`node:fs` only); why-comment at top.
- **R13.11** vm:274-295 / vm:325-326 — Forward-compat: whenever a release renames or removes anything, update EVERY `skills/dooph-design-system-v*-migration/` rename table's target column to the current name, add meaning-change notes, update codemod report text. "An old migration skill always ends at the present, never at its own version."
- **R13.12** vm:301-310 — Migration skills live in `skills/`, not `.agents/skills/`; not mirrored into `.claude/skills/`; cross-link usage + theming skills.

## Rulebook conflicts / ambiguities noted during extraction

- **RC-1** R1.11 (arch:122 "The only exceptions are … shape … side … selectType") vs arch:52 table row `CheckboxChecked` → prop `checked`. Also check `TooltipTypes`/`ToastTypes`/`AvatarSize`/other consts whose prop name is not `variant`/`size`.
- **RC-2** R8.18 (contrib:65: a necessary layout wrapper "is `aria-hidden` and absolutely positioned") vs R3.3 (arch:232-235: OutlineButton's `relative z-10` span around children and DropdownMenuRadioSelectItem's `flex flex-1` span are "acceptable"). A wrapper around children cannot be `aria-hidden` without hiding the label from AT; contrib:65 conflates the decorative orbs with the child wrapper.
- **RC-3** R8.25 (contrib:100: "Document breaking changes in a comment at the top of the component file") vs R11.13 (fhc:173: "Changelog entries | Contracts describe the present; history lives in git").
- **RC-4** R12.2 (li:51-53: tokens.css alone has no effect on rendered size; keep JS table in sync) vs R9.20 (contrib:137: a JS size table a token claims to control is an anti-pattern — "Render from the token") and codebase skill:473-480 (sizing is a live token via `cssSize`).
- **RC-5** R8.13 (contrib:56 lists `rounded-tight|normal|soft` only) vs the existence of `--ui-radius-mini` / `rounded-mini` (codebase skill:504) and any `rounded-full` usage. Ambiguous: is the list exhaustive?
- **RC-6** fhc example (fhc:137-154) teaches "Do NOT reintroduce `--ui-color-danger*` tokens" and "Keep `ButtonVariant.brand` in the API" — contradicts R1.3 (arch:32) and the current danger token family (codebase skill:499). An example inside a normative skill that teaches a banned pattern.
- **RC-7** R13.3 (vm:44-48 "If a rename is worth doing, it is worth a major") vs repo state: package.json 5.3.0, the "5.4" renames are unreleased (HEAD is 11 commits past v5.3.0). The rulebook itself narrates 5.4 as a shipped minor — the rule can still be honoured by releasing as 6.0.0.
