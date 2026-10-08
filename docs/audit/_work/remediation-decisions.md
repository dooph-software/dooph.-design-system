## Decisions needed

Each item blocks the work items listed under it. Fill in the `decision:` line; the executing agent then flips the blocked WIs from `blocked(D-xx)` to `todo` (or `dropped(<reason>)`) and logs it in the change log.

### D-01: Release the unreleased batch as a major (6.0.0)?
- question: HEAD carries about 76 consumer-breaking changes since `v5.3.0` (26 removed tokens, 19 removed theme keys, renamed/removed exports and const members — F-013). The skills narrate them as an already-shipped "5.4" minor. Publish them as 5.4.0 or as 6.0.0?
- options: (a) 6.0.0 + a `skills/dooph-design-system-v6-migration/` skill (+ codemod) per `.agents/skills/dooph-ds-writing-version-migrations/SKILL.md`, and rewrite every "5.4" mention to "6.0"; (b) 5.4.0 as the docs say, accepting that `^5.3.0` consumers receive silent breaks, and carry the §7 forward-compat obligation the vm skill describes as "a mistake".
- recommendation: (a). R13.3 (vm:44-48) says "If a rename is worth doing, it is worth a major", the source already labels five of these changes "BREAKING (major)", and nothing has shipped yet, so the mistake the vm skill describes can still be avoided. It also gives every P4 work item below a release to ride in.
- blocks: WI-RELEASE-MIGRATION and every P4 work item.
- decision: _pending_

### D-02: How to stop `theme.css` remapping Tailwind's container widths
- question: Importing `dist/theme.css` makes `max-w-md`, `w-lg`, `min-w-sm`, `basis-xl` etc. resolve to the DS spacing scale (8–28px) instead of Tailwind's container widths (F-015). Which fix?
- options: (a) emit explicit `--container-xs … --container-xl` (Tailwind defaults) in the preset after the spacing keys so container lookups win — additive, but must be proven by compiling; (b) rename the DS spacing keys out of the t-shirt namespace (`p-ui-md` …) — breaking for every consumer class; (c) document the collision and tell consumers to use arbitrary widths.
- recommendation: (a) if a compile proves Tailwind then resolves `max-w-md` to `--container-md`; otherwise (b) in the 6.0 batch. (c) leaves a silent layout break in place.
- blocks: the theme-preset WI for F-015.
- decision: _pending_

### D-03: Do hover/state colour transitions need `--ui-*` motion tokens?
- question: 17 hover/state colour transitions use Tailwind `duration-100/150` utilities (F-016). R6.1 says "every animated component gets a `--ui-<component>-*` family"; Rule 6's examples are all components whose motion is the feature. Are short hover transitions in scope?
- options: (a) yes — one shared `--ui-interaction-duration`/`--ui-interaction-ease` pair used by every hover/state transition; (b) no — amend arch Rule 6 with an explicit carve-out sentence for colour transitions on interactive state, naming the allowed utilities.
- recommendation: (a). One shared pair is a single token, gives consumers one retuning lever, and removes the ambiguity without a carve-out an agent can stretch.
- blocks: the hover-transition WI for F-016.
- decision: _pending_

### D-04: LoadingSpinner timing — move to CSS, or sanction the JS loop?
- question: The flat `LoadingSpinner` runs an infinite `requestAnimationFrame` loop with a JS 1800 ms duration and cosine easing and no reduced-motion path (F-034). `.agents/skills/dooph-ds-loading-indicators/SKILL.md` prescribes exactly that; arch Rule 6 (R6.4/R6.5/R6.2) forbids it. Which rule wins?
- options: (a) rebuild the flat spinner on the Rule 6 escape hatch (CSS-transitioned `@property` inputs + `--ui-spinner-*` tokens + a self-terminating sampler, as `MorphRotationShape` already does) and rewrite the li skill's animation section; (b) amend Rule 6 with a named exception for indeterminate spinners and add a reduced-motion branch in CSS.
- recommendation: (a). The compliant pattern already exists in the repo, and an exception for one component is the qualifier the file-header-contracts skill warns about.
- blocks: the spinner-timing WI for F-034.
- decision: _pending_

### D-05: `"use client"` policy
- question: 13 hook-free modules carry the directive while `AIModelSelect.tsx` lacks it but passes a closure to a client component (F-027). R8.21 lists only hooks, browser APIs and timers as triggers, which misses "creates an event-handler closure on a host element" and "passes a function prop to a client component". What is the rule?
- options: (a) amend R8.21 to list the two missing triggers, remove the directive from the hook-free Radix wrappers V3 showed render server-side (Modal, Tooltip, Tabs, SearchBox, SplitButton, DatePickerTrigger, Popover, Sheet, LinearProgressIndicator), and add it to AIModelSelect; (b) amend R8.21 the same way but keep the directive on every Radix wrapper as a deliberate, documented belt-and-braces choice.
- recommendation: (a) — the codebase skill already states the "neutral unless forced" policy, and the directive on a helper-exporting module turns `tabTriggerVariants`/`formatTriggerLabel` into client references.
- timing: decide this BEFORE the stamping fix for F-011 ships. Once the 5-line window is fixed, the hook-free `Button.tsx` and `Checkbox.tsx` really become client modules, so their exported `buttonVariants`/`checkboxVariants` turn into client references and stop working when called from a Server Component (they work today only because the stamp is missing). If D-05 picks (a), the use-client WI removes the directive from those modules in the same release as the stamping fix.
- blocks: the use-client policy WI for F-027 (F-011's stamping fix is NOT blocked by this).
- decision: _pending_

### D-06: One colour-prop mechanism
- question: `utils/color.ts` (`DS_COLOR_TOKENS` / `resolveDsColor`) and three private name→var copies keyed by `LoadingSpinnerColor` compete, so `color="text-secondary"` works on LinearProgressIndicator and draws nothing on ProgressIndicator/LoadingSpinner/AIContextGauge (F-032). Two units read R1.4 opposite ways on whether a name→var lookup is allowed.
- options: (a) route every `color` prop through `resolveDsColor` and state in R1.4 that a token-NAME lookup is permitted for `color`; (b) make `color` take only `var(--ui-*)` strings (the `FontWeights` shape) and delete the name lookup — breaking.
- recommendation: (a). It removes three duplicates, fixes the dead colours, and needs no consumer change.
- blocks: the colour-prop WI for F-032.
- decision: _pending_

### D-07: Intended dark-mode danger Sticker
- question: In `.dark`, `--ui-color-sticker-danger` and `--ui-color-sticker-bg-danger` are both `#ffffff` (tokens.css:717-718), so the danger Sticker is invisible (F-001). The adjacent comment says "content and the wash are a literal white", which describes the values, not an intent. What should dark danger look like?
- options: (a) mirror the light treatment: danger content on a translucent danger wash (`color-mix(... var(--ui-sticker-bg-opacity), transparent)`); (b) white content on a solid danger-primary wash; (c) something from Figma.
- recommendation: (c) if Figma has a dark danger Sticker; otherwise (a), which also makes the Sticker header's "every wash is a color-mix at the sticker opacity" claim true.
- blocks: the dark danger Sticker WI for F-001.
- decision: _pending_

### D-08: Discrete-option prop names outside arch:122's closed list
- question: arch:122 says the only non-`variant`/`size` discrete prop names are `shape`, `side` and `selectType`. The code also uses DS-chosen `mode`, `direction`, `sortDirection` and `state` (11 props in total). `checked` is Radix's own name and `color` is covered by the open-value section, so those two are not in question (F-110).
- options: (a) extend arch:122's list with the four names and one sentence each on why they are orthogonal to `variant`; (b) rename the props to `variant` (breaking, P4).
- recommendation: (a). Each is a mode or direction, not a visual variant — the same reasoning arch:122 already gives for `selectType`.
- blocks: none (rule-text WI only).
- decision: _pending_

### D-09: Rule-text conflicts RC-2, RC-3, RC-5 and the R9.19 scope question
- question: (RC-2, F-111) contrib:65 says a necessary layout wrapper "is `aria-hidden` and absolutely positioned", while arch:232-235 sanctions child wrappers that are neither; (RC-3, F-112) contrib:100 says to record breaking changes "in a comment at the top of the component file", which the file-header-contracts skill bans as changelog content; (RC-5, F-120) contrib:56's radius checklist names three utilities while nine radius tokens exist; (R9.19, F-117 item 27) contrib:136 says any `var()` in an SVG attribute is silently ignored, but Chromium resolves `var()` in presentation attributes such as `stroke`/`fill` (only length attributes like `width` fail).
- options: for each, pick the rule that wins and edit the other to match.
- recommendation: RC-2 — contrib:65 should apply to decorative overlays only and say so in its own sentence; RC-3 — drop contrib:100 in favour of the migration skill + CHANGELOG; RC-5 — list every `rounded-*` radius utility or point at tokens.css; R9.19 — narrow the anti-pattern to length/geometry attributes and keep the "use a CSS property" advice.
- blocks: none (rule-text WI only).
- decision: _pending_

### D-10: One skill-mirroring mechanism
- question: `.claude/skills` and `.agent/skills` mirror `.agents/skills` through three mechanisms — git symlinks (mode 120000), machine-local absolute junctions whose contents git tracks as copies, and plain copies (F-058). With `core.symlinks=false` (Windows default) the symlinks check out as 38–56-byte text files, so Claude agents lose every rulebook skill but still load a stale copy teaching `LoadingSpinnerColor.brand`.
- options: (a) tracked real copies everywhere, refreshed by a small checked-in sync step whose drift is checked by `diff -r`; (b) git symlinks everywhere plus a documented `core.symlinks=true` requirement; (c) drop the `.agent` root and keep only `.claude` copies.
- recommendation: (a) — it is the only option that works on a default Windows clone, which is how this repo is developed.
- blocks: the mirroring WI for F-058 (the stale-copy refresh WI is NOT blocked).
- decision: _pending_

### D-11: The vendored `radix-ui-design-system` skill
- question: The third-party skill in `.agents/skills/radix-ui-design-system/` teaches seven rulebook-banned patterns (no forwardRef/displayName, a `destructive` key, string-literal variants, `bg-[hsl(var(--…))]`, `disabled:opacity-50`, …), and the codebase skill lists it as a canonical authoring skill (F-025). Claude Code doesn't load it, but `.agents/` is the Cursor root per `bin/init.mjs:55`.
- options: (a) remove it and its `skills-lock.json` entry; (b) keep it with a banner that says the dooph rulebook overrides it, and drop it from the codebase skill's "canonical" list.
- recommendation: (a). The architecture skill already covers Radix wrapping for this repo; the vendored one only adds contradictions.
- blocks: the vendored-skill WI for F-025.
- decision: _pending_

### D-12: Discriminated-union guard policy
- question: The unions R1.6 relies on do not match runtime: `icon={null|undefined}` and `color=""` compile then throw; `icon={false|""|0}` compile and render an empty slot; Calendar warns in dev then TypeErrors; DatePicker crashes; `progress={NaN}` draws a full ring (F-038). Tighten the types and make every guard throw, or relax?
- options: (a) tighten the unions to exclude `null`/`false`/`""` (Input `icon: ReactElement`; `color` stays a string because a non-empty string is not expressible in TypeScript, so its runtime throw stays), add `Number.isNaN` to the progress guard, and give Calendar/DatePicker ONE invalid-value policy — either (a1) render nothing after a dev warning, matching `.claude/research/2026-08-27-date-picker-foundation-research.md` §10.2, or (a2) throw like ProgressIndicator; type tightening is a compile-time break, so P4; (b) keep the types and make every guard lenient.
- recommendation: (a) with (a1). R1.6 (arch:101-107) pairs the union with a throw for a bundle enum's `custom` member, and arch cites `CalendarProps` for its union only (verify/V4.md), so a Calendar value outside its bounds is not that case; the research decision (render nothing) fits it and stops the TypeError and the DatePicker crash. NaN progress still throws: it is ProgressIndicator's own out-of-range guard.
- blocks: the union-guard WI for F-038.
- decision: _pending_

### D-13: One callback / force-active naming convention
- question: Value-holding controls name their change callback three ways (`onValueChange` — 7 controls; `onChange(value)`; `selected`/`onSelect`) and the "force the hover/active look" boolean four ways (`active`, `hovered`, `glowing`, `pressed`) (F-031).
- options: (a) `value`/`defaultValue`/`onValueChange` everywhere and one boolean name, renamed in the 6.0 batch with migration-skill rows; (b) record the existing names as deliberate per component in the contribution skill.
- recommendation: (a) for the callbacks (the dominant pattern, and Radix's) and for the inverse-surface flag (`inverseTheme` → `themeInverse`, matching Tooltip/AIModelSelect); (b) for the force-look booleans (`hovered`, `glowing`, `pressed` mean different things). The blocked WI drafts the full rename — if this recommendation is taken, drop its boolean-rename step before running it.
- blocks: the callback-rename WI (P4).
- decision: _pending_

### D-14: Const/type identifier alignment (R1.9)
- question: (F-045) `FontAxes`/`FontAxis` and `ProgressIndicatorVariants`/`ProgressIndicatorVariant` break R1.9 outright; `Fonts`/`FontSizes`/`FontWeights`/`Tracking` break it too, but arch:65-77 shows exactly those names as its open-value example.
- options: (a) rename the two plain violators in 6.0 and amend arch:120 to say open-value consts are plural with a `*Value` type; (b) rename all six in 6.0 and fix arch's example.
- recommendation: (a) — it keeps the example truthful and touches two public names, not six.
- blocks: the R1.9 rename WI (P4).
- decision: _pending_

### D-15: Undocumented internals on the public surface
- question: (also covers the three `ds-*` helpers no component or doc uses — `ds-focus-ring`, `ds-my-ui-xs`, `ds-disabled-control` — which ship in `styles.css`) Folder barrels publish `isSameDay`, `startOfDay`, `formatRangeLabel`, `formatSingleLabel`, `formatTriggerLabel` (a client reference), `serializeAxes`, and the cva recipes `buttonVariants`, `stickerVariants`, `checkboxVariants`, `tabTriggerVariants`; no consumer doc mentions them (F-087). `DateMatcher` and `TextStyleProps` are legitimately public; `tabTriggerVariants` was deliberate (codebase skill:202).
- options: (a) remove the helpers from the public surface in 6.0 (barrels export only components, consts and props types) and document the recipes that stay; (b) document all of them as public API.
- recommendation: (a) for the date/axes helpers; (b) for `buttonVariants` (Toast and others legitimately reuse it).
- blocks: the public-surface WI (P4).
- decision: _pending_

### D-16: Naming vocabulary
- question: base size is `standard` in four size consts and `default` in four; `AvatarSize.small` vs `sm` elsewhere; `ToggleSize.iconSm` and `TabSize.iconSm` share key and value but render 28 vs 34px; `TooltipTypes`/`ToastTypes` break the `*Variant` pattern (F-098).
- options: (a) normalise in 6.0 (`default`, `sm`, distinct key for the 28px option, `*Variant`); (b) record the existing names as deliberate.
- recommendation: (a) for `*Types` → `*Variant` and the `iconSm` collision (both mislead); (b) for `standard`/`default`, which only costs a little autocomplete friction.
- blocks: the naming WI (P4).
- decision: _pending_

### D-17: Conventions the rulebook is silent on
- question: (F-066, F-103) The newcomer test (FINDINGS §5) fails on five conventions no rule covers: how a variant selects classes (cva in 7 components, four hand-built idioms in 9), whose inline style wins (consumer in 22, component in 7, discarded in 2), which element `className` styles, and where an invariant is recorded (header constraint vs `//` note vs JSDoc vs block comment — only headers are protected by AGENTS.md).
- options: (a) add one contribution-skill subsection naming the convention for each (cva default; consumer `style` merged last; `className` on the element that owns the role, documented in the props JSDoc when it isn't the root; invariants live in `## constraints`); (b) leave them unwritten.
- recommendation: (a). Each is a one-line rule, and each unwritten one has already produced a defect (F-029 grid wiped by consumer style; F-062 OutlineButton handler clobbering).
- blocks: the conventions WI and the follow-up WIs that bring outliers into line.
- decision: _pending_

### D-18: The orphan test
- question: `src/components/ProgressIndicator/waveGeometry.test.ts` is the repo's only test; nothing runs it, though `node --test` passes it 3/3 (F-078).
- options: (a) add `"test": "node --test src/**/*.test.ts"` (needs a TS loader — use Node's `--experimental-strip-types` on the Node version CI pins) and run it in CI; (b) delete the file.
- recommendation: (a), using Node's built-in runner and no new dependency. The test file's own comment already promises a "zero-dependency Node test command" that does not exist, and the test passes 3/3 under `node --test` (U9), so naming the command makes an existing promise true. Choose (b) if you do not want any test command at all.
- blocks: the orphan-test WI.
- decision: _pending_

### D-19: `figma-variable-jsons/`
- question: The five committed Figma variable exports are the initial-commit snapshot and contradict the current token model (F-106). Refresh, delete, or keep labelled as historical?
- options: (a) re-export from Figma and commit; (b) delete the folder; (c) keep with a README stating the snapshot date.
- recommendation: (a) if the files feed a Figma sync; (b) otherwise — no script reads them.
- blocks: the figma-json WI.
- decision: _pending_
