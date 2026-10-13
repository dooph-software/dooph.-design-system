# Claim check, batch 9: CHANGELOG `[Unreleased]` (v5.3.0 → working tree)

Checker: fresh, read-only. Checked 2026-10-11 against `main` at 8493906 plus every uncommitted change.

## How I checked

- **Two builds, outside the repo.** `../ds-cc9-v530` is a worktree at tag `v5.3.0` (8f58ae8). `../ds-cc9-head` is a worktree at `git stash create` = 149768a, which is the working tree with every tracked change. The only untracked files are under `docs/audit/`, and none of them ship. Both builds ran `npm ci && npm run build` and exited 0. Both trees hold `dist/index.d.ts`, `dist/styles.css` and `dist/theme.css`.
- **Surface diff.** I ran `node scripts/surface.mjs` on each tree and diffed them with `node scripts/surface-diff.mjs`. The diff has **1468 lines**, which matches the writer's count in `changelog-omissions.md`. My v5.3.0 extract differs from the saved `surface-v5.3.0.json` from byte 50 on: the `tree` path field. I used my own extract.
- **TypeScript probes.** All probes import `../dist/index.js` and use the tsconfig from the surface-diff skill (strict, bundler, react-jsx, `types: []`).
  - `old.tsx` holds 61 pieces of 5.3.0 consumer code, one per Breaking claim. It compiles at v5.3.0 with 0 errors.
  - At head, every intended line fails, except the three that the doc says still compile: `color="brand"` on LinearProgressIndicator, a literal `size="sm"`, and `interface X extends IconProps`. One more line also compiled, a two-member size union; see FALSE 3.
  - `fix.tsx` holds every consumer fix and code block in the Breaking section, copied as written. It compiles at head with 0 errors.
  - `btn.tsx`, `shape.tsx`, `cta.tsx` and `twm.ts` are targeted probes.
- **Codemods.** I ran the three JS code blocks verbatim against a fixture: every removed v5.3.0 `--ui-*` token as an override and in a `var()`, spacing utilities, and the 5.3.0 Tailwind keys.
- **Tailwind.** I compiled `max-w-md max-w-sm w-md p-md` with the head `dist/theme.css` using the tree's own Tailwind 4.3.3.
- **Runtime.** I imported `cn`, `buttonVariants`, `tabTriggerVariants` and `resolveDsColor` from each dist. I also ran `renderToString` on the asChild and invalid-Calendar cases.
- **Package.** I ran `npm pack` in both trees and listed the tarballs. I copied `ds-consumer-template` to a scratch dir, installed the head tarball and added a Server Component page.
  - The page imports Button, the server-safe consts, `buttonVariants`/`tabTriggerVariants` called in server code, and the six modules 5.3.0 shipped unstamped. It also imports Tooltip, DropdownMenu, MorphRotationShape with `Shapes` keys, ShapeMorphSpinner and DropdownCaret.
  - `next build` (Next 16.4.0, Turbopack) **exited 0** and prerendered the page. CJS `require` and ESM `import` of the installed package both load 328 exports.
- **Defaults.** I diffed render-function defaults with `scripts/lib/surface.mjs` (`findRenderFunction` + `extractDefaults`) on both source trees. I also compared cva `defaultVariants` between the two `src` trees.
- **Not run:** `npm run lint`. This review changes no code, and the only file written is this verdict.
- **The tree changed while I worked.** Other work in the main checkout added an untracked `skills/dooph-design-system-v6-migration/` and deleted five planning docs. `git diff 149768a -- CHANGELOG.md src package.json tsup.config.ts scripts bin` is empty, so every result below still holds for the current code. The new v6 skill would ship in `skills/`, and the CHANGELOG does not mention it yet.

## Summary

| Doc | Claims | TRUE | FALSE | UNVERIFIABLE |
|---|---|---|---|---|
| `CHANGELOG.md` `[Unreleased]` (lines 10–923) | 140 | 116 | 16 | 8 |
| `CHANGELOG.md:926` (pointer to the 2.0–5.3 tags) | 1 | 0 | 1 | 0 |
| `CHANGELOG.md` 1.1.0 / 1.0.0 (unchanged check only) | 1 | 1 | 0 | 0 |
| **Total** | **142** | **117** | **17** | **8** |

These are claim groups: a table counts as one claim unless one of its rows is wrong.

Every Breaking item's before and after match both builds. Every Breaking fix compiles at head, except one: the shape-component fix (FALSE 4).

Seven FALSE items would steer a consumer or an agent wrong:
- the Tailwind codemod (FALSE 7)
- the shape "type it `ReactNode`" fix (FALSE 4)
- the Button-union wording (FALSE 3)
- three breaks filed outside Breaking: ShapeButton's default, CTAButton's ref and PopoverContent's offset (FALSE 9, 11, 12)
- the release-notes pointer (FALSE 17)

The rest are wrong counts, names or lists.

---

## FALSE

### 1. CHANGELOG.md:12-14: what "Breaking" means
> "Everything under **Breaking** stops working, or looks different, for code written against 5.3.0."

- **Evidence.** By that definition, much of **Changed** belongs under Breaking. Changed lists these "looks different" changes:
  - the prominent colour (:725)
  - dark `--ui-color-text-tertiary` (:727)
  - RollChangeText travel and blur (:729)
  - CTAButton's chip, icon size and padding (:733)
  - PopoverContent's surface and offset (:737)
  - SearchBox's icon (:744)
  - the dropdown triggers' caret and right padding 0 (:748)
  - the motion timings (:710)
- **Fix.** Pick one rule:
  - (a) Breaking = "stops compiling, stops styling, or changes behaviour or ARIA without a compile error"; purely visual retunes stay under Changed with a note to re-check custom looks; or
  - (b) move every "looks different" item into Breaking.
- **Linked.** FALSE 9, 11 and 12 are the cases that fail under either rule.

### 2. CHANGELOG.md:14-15: how to find silent items
> "Items marked **silent** raise no compile error: find them by searching for the old name."

- **Evidence.** Six silent items have no old name to search for. Each one changes a value or behaviour that keeps its name:
  - `--ui-height-button-micro` 26→28px (:361)
  - `--ui-color-ghost-foreground` (:364)
  - the dark primary focus ring (:370)
  - cascade layers (:374)
  - rem→px layout (:474)
  - SegmentedTabSelect's default (:51; the old state is the absence of a prop)
- **Fix.** "…find them by searching for the old name, or for the token, component or test query the item names."

### 3. CHANGELOG.md:176-179: when the Button union fails
> "(b) a `variant` typed as the whole `ButtonVariant` union passed together with a `size` whose type is a union (`ButtonSize`, or even a subset without the pill sizes; a literal such as `size="sm"` still compiles)"

- **Evidence.** `btn.tsx` at head:
  - `variant: ButtonVariant` with `size: "sm" | "icon"` **compiles**. So do `"sm" | "standard"`, `"standard" | "icon"` and `"icon" | "icon-sm" | "icon-micro"`.
  - Only the 5-member `Exclude<ButtonSize, "medium" | "big">` fails (TS2322), and the full `ButtonSize` fails (old.tsx:49).
  - TypeScript stops decomposing the object at 25 variant × size combinations. With 6 variants × 5 sizes = 30, the union check fails.
- **Fix.** "…with a `size` typed as `ButtonSize`, or as a union with five or more members, even without the pill sizes. Smaller unions and literals still compile."

### 4. CHANGELOG.md:213-216: the shape-component fix
> "Calling one as a plain function and typing the result `JSX.Element` no longer compiles (it returns `ReactNode`). Fix: render it as JSX, or type the result `ReactNode`."

- **Evidence.** `shape.tsx:3` at head, `const a: ReactNode = StarShape({ size: 24 })`, fails with TS2322: "Type 'ReactNode | Promise<ReactNode>' is not assignable to type 'ReactNode'". A `FunctionComponent` returns `ReactNode | Promise<ReactNode>` under React 19 types. The JSX form compiles (fix.tsx `f29`).
- **Fix.** "(it returns `ReactNode | Promise<ReactNode>`). Fix: render it as JSX (`<StarShape size={24} />`)." Drop "or type the result `ReactNode`", or replace it with `ReturnType<typeof StarShape>`.

### 5. CHANGELOG.md:259: the focus border's new value
> "`--ui-color-border-focus` | `--ui-color-input-border-focus` | now the prominent hover border"

- **Evidence.** That is true in light only. The head `.dark` block sets `--ui-color-input-border-focus: var(--ui-color-prominent-border-active)` (diff line 633). In 5.3.0 the token had no dark line.
- **Fix.** "now the prominent hover border (light) and the prominent active border (dark)".

### 6. CHANGELOG.md:365-368: what the ghost foreground paints
> "Everything painted with the ghost foreground is darker: ghost buttons, TextLink, Tooltip, the Toast close, HotkeyIndicator, SearchBox, Calendar, the dropdown triggers, SidebarWithHoverIcon, CopyButton."

- **Evidence.**
  - At head, `text-ghost-fg` (the class that reads `--ui-color-ghost-foreground`) is used only by AIModelSelect, Button (ghost), CalendarGrid, HotkeyIndicator and TextLink. The Toast close and CopyButton get it by rendering ghost Buttons (Toast.tsx:180/206, CopyButton.tsx:71).
  - Tooltip, SearchBox and SidebarWithHoverIcon read it in neither release: no `ghost` in their sources at v5.3.0 or head.
  - The dropdown triggers read only `ghost-fg-active` at head (DropdownTrigger.tsx). Their 5.3.0 `text-ghost-fg` (v5.3.0 DropdownTrigger.tsx:290-292) is gone.
- **Fix.** "…darker: ghost Buttons (and the Toast close and CopyButton, which render them), TextLink, HotkeyIndicator, the Calendar weekday names and outside days, and the AI model picker."

### 7. CHANGELOG.md:411-432: the Tailwind codemod skips three theme variables
> "…and the matching `--color-*` / `--radius-*` / `--shadow-*` theme variables. Fix, in one pass:" [codemod]

- **Evidence.** I ran the block verbatim. `var(--color-brand)` and `var(--color-page-background)` are renamed. Three are returned unchanged:
  - `var(--radius-standard)`: the guard `key === "standard" && !prefix.startsWith("rounded")` rejects the prefix `--radius-`.
  - `var(--shadow-focus-brand)`: the guard `prefix !== "shadow-"` rejects `--shadow-`.
  - `var(--shadow-focus-error)`: same guard.
  - None of the three exists in head `dist/theme.css`, so a consumer's custom CSS that reads them silently loses the value.
  - Every utility in the fixture is renamed correctly, including `rounded-l-standard`, `rounded-tl-standard`, `shadow-focus-*`, `h-tab-micro`, `ring-brand/50` and variant prefixes.
- **Fix.** In the replacer, use
  - `(key === "standard" && !/^(-?rounded|--radius)/.test(prefix))`
  - `((key === "focus-brand" || key === "focus-error") && prefix !== "shadow-" && prefix !== "--shadow-")`

### 8. CHANGELOG.md:494: Props types for new components
> "Every new component below also exports its `<Name>Props` type."

- **Evidence.** 14 of the 43 new components have no `<Name>Props` export (surface `exports` of the head build):
  - `AIPromptInputToolbarStart` and `AIPromptInputToolbarEnd` share `AIPromptInputToolbarProps`.
  - `DropdownMenuRadioSelectItem`, `DropdownMenuMultiSelectItem`, `DropdownMenuPlainItem`, `DropdownMenuSubTrigger` and `DropdownMenuSubContent`.
  - The seven new shapes (`CapsuleShape` … `TripleShape`), which use `ShapeProps`.
- **Fix.** "Every new component below exports its `<Name>Props` type, except the menu item parts, the two toolbar halves (`AIPromptInputToolbarProps`) and the shapes (`ShapeProps`)."

### 9. CHANGELOG.md:579: ShapeButton's default is filed as an addition (FALSE as placed)
> "`ShapeButton` `variant` (`ShapeButtonVariant` `primary` | `prominent`)."

- **Evidence.**
  - In v5.3.0, ShapeButton.tsx:91-94 painted the shape `text-secondary` (grey), with secondary hover and press.
  - At head the default is `variant = ShapeButtonVariant.prominent` (defaults diff). It paints `text-prominent` with a prominent-fg icon (ShapeButton.tsx:64-79).
  - Every `<ShapeButton>` without a variant turns from grey to violet, and the secondary look is no longer available.
  - This is a changed default and a removed look, so by the doc's own definition it is a silent break.
- **Fix.** Add to Breaking > Components: "**ShapeButton's default look changed (silent).** Before: a secondary (grey) shape. After: `variant` defaults to `prominent` (violet); `primary` is the other option, and there is no secondary look. Fix: pass `variant={ShapeButtonVariant.primary}` for a neutral button, or re-check the design."

### 10. CHANGELOG.md:609-611: theme keys for the new tokens
> "Each new colour, radius, shadow, spacing and text-size token here also gets its Tailwind theme key in `theme.css`"

- **Evidence.** 8 of the new tokens have no `theme.css` key (no `var(--ui-…)` reference in head `dist/theme.css`):
  - `--ui-color-focus-ring-prominent`, `--ui-color-focus-ring-danger`
  - `--ui-color-slider-step-inactive`, `-primary-active`, `-prominent-active`
  - `--ui-spacing-button-medium-x`, `--ui-spacing-button-big-x`, `--ui-spacing-cta-content-standard`
- **Fix.** Add "…except the focus-ring and slider-step colours and the button and CTA padding tokens, which are read only through `ds-*` helpers."

### 11. CHANGELOG.md:737-739: PopoverContent's offset default (FALSE as placed)
> "…and sit 6px from the trigger (was 4px)." (under **Changed**)

- **Evidence.** `PopoverContent` `sideOffset` defaults to `4` at v5.3.0 (Popover.tsx:33) and `6` at head (Popover.tsx:31). This is a changed default on a public prop, and the dispatch classification rule counts that as a break.
- **Fix.** Move the offset to Breaking: "**`PopoverContent` `sideOffset` defaults to 6 (was 4)** (silent). Fix: pass `sideOffset={4}` to keep the old gap."

### 12. CHANGELOG.md:740-743: CTAButton's ref type (FALSE as placed)
> "`CTAButton`'s ref is typed `HTMLElement` (was `HTMLAnchorElement`)… narrow before reading anchor-only fields such as `href`." (under **Changed**)

- **Evidence.**
  - `cta.tsx`: `useRef<ComponentRef<typeof CTAButton>>(null); r.current?.href` compiles at v5.3.0 and fails at head (TS2339: "Property 'href' does not exist on type 'HTMLElement'").
  - The bullet's own fix is a code change. A compile error belongs under Breaking.
  - The bullet is right that `RefObject<HTMLAnchorElement>` and an anchor-typed callback ref still compile (fix.tsx `F32`).
- **Fix.** Move it to Breaking > Props: "Code that derives the ref type from the component (`ComponentRef<typeof CTAButton>`) gets `HTMLElement`. Narrow (`el instanceof HTMLAnchorElement`) before reading `href`."

### 13. CHANGELOG.md:756-759: which colour props already took DS names
> "Colour props on `ProgressIndicator`, `LoadingSpinner`, `ShapeMorphSpinner`, `AIContextGauge` and `LinearProgressIndicator` take any `DS_COLOR_TOKENS` name … Before, names other than `primary` / `brand` drew nothing."

- **Evidence.**
  - v5.3.0 `LinearProgressIndicator.tsx:25,52` already called `resolveDsColor`, so it took every `DS_COLOR_TOKENS` name.
  - `ShapeMorphSpinner` and `AIContextGauge` are new and have no "before".
  - Only ProgressIndicator (v5.3.0 ProgressIndicator.tsx:33-39) and LoadingSpinner (LoadingSpinner.tsx:28-35) had the two-name table.
- **Fix.** "Colour props on `ProgressIndicator` and `LoadingSpinner` take any `DS_COLOR_TOKENS` name …; before, names other than `primary` / `brand` drew nothing. The new `ShapeMorphSpinner` and `AIContextGauge` take them too, as `LinearProgressIndicator` already did."

### 14. CHANGELOG.md:775-785: the stylesheet's dropped `--color-*` variables
> "its theme layer drops six `--color-*` variables only stories read (`--color-primary`, `--color-text`, `--color-text-secondary`, `--color-text-tertiary`, `--color-prominent-color`, `--color-prominent-color-alt`)"

- **Evidence.** The `@layer theme` block of v5.3.0 `dist/styles.css` is different from what the bullet lists:
  - It never had `--color-prominent-color` or `--color-prominent-color-alt`; those names did not exist in 5.3.0.
  - It had **ten** `--color-*` variables that head drops: `--color-black`, `--color-brand-color`, `--color-gray-700`, `--color-primary`, `--color-red-500`, `--color-text`, `--color-text-secondary`, `--color-text-tertiary`, `--color-white`, `--color-zinc-800`.
  - It also dropped about 20 other theme variables: `--font-body`, `--font-mono`, `--font-weight-bold/medium`, `--radius-md`, `--radius-tight`, `--shadow-button`, `--shadow-focus-error`, `--shadow-lg`, `--text-sm/2xl/3xl` (+ line heights), `--text-mono`, `--ease-in/out` and `--tracking-wide`.
  - Head keeps only six variables: `--font-sans`, `--spacing`, `--default-*`.
- **Classification.** The bullet also removes classes and variables under **Changed**: for example `w-64` and `p-4`, and all 466 generated-utility diff lines. The dispatch rule treats a removed class or token as a break.
- **Conflict.** The repo's own triage (`.agents/skills/dooph-ds-writing-version-migrations/references/surface-diff.md` §4, "generated utility added or removed → not breaking") says this is not a break. The maintainer must decide which rule wins. See "Cross-doc contradictions".
- **Fix.** Correct the list to the v5.3.0 names above ("drops the `--color-*`, `--font-*`, `--radius-*`, `--shadow-*` and `--text-*` theme variables that only stories and docs used"). Then either move the bullet to Breaking as a silent item, or keep it under Changed and state why: generated utilities are not a contract.

### 15. CHANGELOG.md:786-788: tarball size
> "**Smaller tarball:** about half the files (no unreachable per-module files or CommonJS source maps)"

- **Evidence.** `npm pack` of each tree:
  - The file count drops by about a third, not a half: v5.3.0 has 2079 files, head 1350 (−35%). Under `dist/`: 2068 → 1332.
  - The tarball is **larger** in bytes: 505,845 → 673,981 (+33%), because of the new components.
- **Fix.** "**Fewer tarball files:** about a third fewer (2079 → 1350), with no unreachable per-module files or CommonJS source maps; the ESM source maps…" Drop "Smaller".

### 16. CHANGELOG.md:817-818: the `cn` text-style fix
> "`cn` keeps every `text-style-*` role beside a colour class (`text-body` next to a text colour no longer erases the colour)."

- **Evidence.** Runtime `cn` from each dist:
  - `text-style-*` beside a colour was already kept in 5.3.0: `cn("text-style-body","text-text-secondary")` → both, in either order.
  - What changed is the theme font-size utilities `text-<role>`. In 5.3.0, `cn("text-text-secondary","text-body")` → `"text-body"` (the colour was dropped). At head it keeps both.
  - At head `cn("text-body","text-sm")` now drops `text-body`, a merge-output change that the bullet does not mention.
- **Fix.** "`cn` treats the role font-size utilities (`text-body`, `text-label` …, from `theme.css`) as font sizes. `text-body` next to a text colour no longer erases the colour, and a later font-size utility replaces it."

### 17. CHANGELOG.md:926: the pointer to the 2.0–5.3 release notes
> "Release notes for 2.0.0 through 5.3.0 live in git history: see the tags `v2.0.0` … `v5.3.0`."

- **Evidence.** The tags hold no release notes:
  - Every annotated tag's message is just the version: `git tag -l --format='%(contents)' v2.0.0` → "2.0.0", and the same for v3.0.0, v4.0.0, v5.0.0 and v5.3.0.
  - `CHANGELOG.md` at each of those tags contains only the 1.1.0 and 1.0.0 sections.
  - What exists is the commit log between tags and the v3 and v5 migration skills.
  - This is the gap recorded as FINDINGS F-049 and claims-register C-CHANGELOG-1 ("CHANGELOG has nothing for 34 tags").
- **Fix.** "No CHANGELOG entries exist for 2.0.0 through 5.3.0. Their changes are in the commit history between the tags `v2.0.0` … `v5.3.0`; the v3 and v5 majors are described by the `dooph-design-system-v3-migration` and `-v5-migration` skills."

---

## UNVERIFIABLE

These need a browser or a rendered comparison. None depends on `theming-proof.md`.

1. **:722-724 LoadingSpinner.** "The flat variant runs Material's circular indeterminate motion and paints on the first, server-rendered frame. It relies on CSS `@property`." Needs a browser frame capture. The `ds-spinner-flat*` classes exist in head `dist/styles.css`.
2. **:746-747 CopyButton.** The icon swap "zooms". Visual only.
3. **:800-802 Toasts.** Exit animations on timer, close, Escape and swipe; "`dismiss()` no longer waits on a 200ms timer". Needs a browser.
4. **:806-807 ToastClose.** Keeps its colour on hover and press. Visual.
5. **:819-821 ProgressIndicator.** No stray track dot, no flash, no jump. Visual or animation.
6. **:767-769 Text components.** "Rendered output is unchanged except" two cases. Needs a full render diff of every component, which I did not run.
7. **:849-851 Disabled states.** CalendarPresetItem, SearchBox and CodeDigitInput render the DS disabled state, and aria-disabled SplitButton/ShapeButton parts ignore hover. The SearchBox and CodeDigitInput sources have no `ds-disabled-state`/`aria-disabled` hit, so this needs a render.
8. **:857-861 Padding classes.** A consumer padding class replaces the padding of nine components. This needs the merge config checked against each recipe; I checked only the `cn` merges in TRUE 50.

---

## TRUE (claim → evidence)

The probe files are `ds-cc9-v530/__probe__/old.tsx` and `ds-cc9-head/__probe__/{old,fix,shape,cta}.tsx` (removed with the worktrees). `pN` is a line of `old.tsx`, which fails at head unless noted, and `fN` is a line of `fix.tsx`, which compiles at head.

**Intro**
1. :12 The next release is a major (v6). No v6 tag exists (`git tag`), which matches the maintainer decision.

**Components (Breaking)**
2. TwoWayToggle's four names are gone (p01/p02 TS2305), and the ToggleSwitch names work (f01/f02). The props and defaults are the same: `variant ?? primary`, `size ?? default/standard` (Toggle.tsx:87-88 → 157-158).
3. DropdownMenuCheckboxItem is removed (TS2724). MultiSelectItem takes `checked`, `onCheckedChange`, `onSelect` and `disabled` (f03b). The code block compiles (f03). RadioSelectItem inside a RadioGroup compiles (f03c).
4. Menu widths. v5.3.0 had `standard` 160, `action` 144 and `complex` 324 (v5.3.0 tokens.css:401-403). `variant` is removed on DropdownMenu and DropdownMenuContent (p04).
   - Items hold the 160px floor (DropdownMenu.tsx:11,229).
   - `DropdownMenuSection width="var(--ui-min-w-menu-complex)"` resolves to 324px (tokens.css:648), and a number works (f04, f04b).
   - `--ui-min-w-menu-action` is removed.
5. Shapes. GemShape and `Shapes.gem` are removed (p05/p06). The ShapeButtons lists before (`arrow clover cookie gem puff star`) and after (`clover cookie diamond puff squircle`) are exact (surface consts). ArrowShape, StarShape and DiamondShape exist (f05).
6. SegmentedTabSelect:
   - It had seven variants, defaulting to `secondary`: a shell with a ghost active tab (v5.3.0 SegmentedTabSelect.tsx:25-35,66).
   - The new default is `primary` + `container`, a 38px shell (`h-button` = 38px) of micro items (`h-button-micro` = 28px) with the primary active tab (head SegmentedTabSelect.tsx:35-73, toggleOption.ts:59).
   - All six table rows compile (f06a–e) and match the item-size maps.
7. The value-control table (5 rows). The old props fail (p12–p16), including `onSelect` on `<div>`/`<button>` parts: head types `Omit` the DOM `onSelect`. So "never silently attached DOM handlers" is true. The fixes compile (f07–f11).
8. OutlineButton: `inverseTheme` fails (p17) and `themeInverse` compiles. TooltipContent and AIModelTooltipContent use `themeInverse` (f12b; diff line 181).
9. CopyButton. `<CopyButton />` compiled at v5.3.0 (old.tsx exits 0). At head `value` is required (TS2741), and `size`, `asChild`, `children` and unknown attributes are errors (p19/p20; shape.tsx:4). The "undefined" copy is recorded as FINDINGS F-002.
10. CTAButton with `text`, `href` and string children: compiled in 5.3.0, fails at head (p21, TS2769). Both fixes compile (f14a/b).
11. LoadingSpinner: `role: "status"` (v5.3.0 LoadingSpinner.tsx:304) → `"progressbar"` with no `aria-valuenow`. The `aria-label` stays "Loading" (head :292-295).
12. RollHoverText: `aria-label={children}` (v5.3.0 Text/RollHoverText.tsx:38) is replaced by an `sr-only` copy (head AnimatedText/RollHoverText.tsx:64).
13. ProgressIndicator:
    - Before, NaN did not throw: the guard was `progress < 0 || progress > 1` (:292).
    - NaN gave `trackLength = Math.max(0, NaN)`, an invalid dasharray, so a full track circle was drawn.
    - At head, `!(progress >= 0 && progress <= 1)` throws (:314). The fix expression is valid.

**Props, consts, types (Breaking)**
14. The brand→prominent table (4 rows): p22–p25 fail, f15 passes.
15. The option-const table (5 rows): p26–p28 fail, f16 passes. ToastRoot and TooltipContent are typed by the new names (diff lines 319, 328, 587, 595).
16. The base-size table (6 rows): p29–p32 and p60 fail, f17 passes. `IconSize.lg` is new and 18px.
17. Colour names:
    - `DS_COLOR_TOKENS`, `DsColor` and `DsColorToken` lose six names (diff lines 430-443, 601-602), and indexing with one is TS7053 (p33/p34).
    - On a `color` prop an old name compiles (p35) and passes through as an invalid CSS colour: `resolveDsColor("brand")` → `"brand"` at head.
    - The rename table is right: `brand-color-alt`→`prominent-color-ter` keeps #44c0e5.
    - `danger` reads `--ui-color-danger-primary` (diff line 433). The new names are listed.
18. `null` is rejected on all eleven listed props (p36–p41). The fix compiles (f19).
19. Button union:
    - (a) `interface extends ButtonProps` fails (TS2312, P42).
    - (b) whole union × `ButtonSize` fails (p43), and a literal `size="sm"` compiles (p45).
    - Both fixes compile verbatim (F20, f21).
20. InputProps, SliderProps and SliderLabeledProps fail `extends` (P46–P48, TS2312). The intersection fix compiles (F22).
21. Input `min="0"` fails and `min={0}` passes (p49/f23). LinearProgressIndicator `value={null}` fails and `v ?? 0` passes (p50/f24).
22. CopyButton refs: `useRef<HTMLElement>` fails and `HTMLButtonElement` passes (P51/F25).
23. `IconSize = "2rem"` fails (p52). `IconProps["size"]` and `string` pass (f26).
24. Presets: assigning to `CalendarPreset[]` fails (TS4104) and `.push` fails (p53/p54). The spread fix compiles. Passing the defaults to `splitPresets` and `presets` compiles (f27/f27b).
25. `ShapeProps.size * 2` fails (TS2362, p55). `Number(p.size)` passes (f28).
26. Calling a shape and typing the result `JSX.Element` fails (p56). JSX passes (f29).
27. The seven helper exports are removed (TS2305/2724, p57). The replacement snippet compiles verbatim.
28. `buttonVariants` and `tabTriggerVariants` contained `text-style-button` in 5.3.0 (runtime output) and contain no typography at head. Both fixes compile (f30, f31, f31b), and Button applies the text role through `BaseText` even with `asChild` (Button.tsx:187-197).

**Tokens (Breaking)**
29. The token rename table: 24 of 25 rows match the diff values. The codemod maps all 27 renamed names to tokens that exist at head and leaves exactly the 17 motion tokens and 2 removed tokens untouched. The `brand-color-alt` ordering is right.
30. Spacing:
    - The values before and after match the diff (xs 8→6, sm 10→8, rg 12→10, md 16→12, lg 20→16, xl 28→20, xxl 40→26; new xxxs 2 and xxxl 42).
    - The codemod gives the stated output in one pass, leaves `text-*` and `ds-*-ui-*` alone, and remaps overrides.
    - `max-w-md` resolves to `var(--ui-spacing-md)` (Tailwind 4.3.3 compile).
31. 17 motion tokens are removed. Each mapping matches the old value: 420→slower, 320→slow, 500→slower, 240/260/200→base/slow/base, 260/180→slow/base, 600→slowest, and the curves enter/exit.
32. `--ui-min-w-menu-action` (144) and `--ui-min-w-cta-pill-big` (370) are removed with no replacement.
33. `--ui-height-button-micro` goes 26→28px. `size-button-micro` reads it, and micro tabs use `h-button-micro` (toggleOption.ts:59); the old `--ui-height-tab-micro` was 30px.
34. `--ui-color-ghost-foreground` was #4a4a4a / #afafaf and is now `var(--ui-color-text)`. The override fix works.
35. Dark `--ui-color-focus-ring-primary` goes rgba(23,23,23,.15) → rgba(249,249,249,.15).
36. Cascade layers: both blocks go unlayered → `ds.tokens` (diff lines 614, 673). The reduced-motion block is `!important` inside the layer (diff line 612). The side effects follow from standard cascade layers.

**CSS classes (Breaking)**
37. The Tailwind-key table covers all 19 removed theme variables. The codemod renames every utility form in the fixture (theme-variable gap: FALSE 7).
38. The spacing helpers:
    - v5.3.0 had exactly twelve.
    - The values and properties match the table (padding-left/right/inline/block/gap/margin-block).
    - `ds-px-ui-sm` survives at 8px, `ds-py-ui-xxs` is unchanged, and `ds-p-ui-sm` is new.
39. The other `ds-*` helpers table: the removed classes are absent, the replacements exist, and `ds-disabled-state` is `:is(:disabled,[aria-disabled="true"])`. Caveat: v5.3.0 `ds-focus-ring` was an always-on ring and `ds-focus-ring-on-focus` shows only on focus.
40. `cn` at runtime:
    - In 5.3.0, `cn("rounded-tight","rounded-full")`, `cn("p-md","p-lg")` and `cn("h-button","h-8")` kept both classes.
    - At head they keep only the later one.

**Layout and package (Breaking)**
41. In 5.3.0 the components used rem steps (Button `gap-2 px-3` and Tabs `px-4` in the runtime recipe output).
42. Package:
    - The `exports`, entries, peers and `bin` are unchanged (the diff has only `files` lines).
    - The tarball has 0 per-module `.js`/`.cjs` files under `dist/components`/`dist/utils` and 0 `.cjs.map` files (v5.3.0: 408 + 4, and 413).
    - Nothing in the dist imports `dist/components/*`.
    - CJS and ESM both load from the installed tarball, and the Next.js Server Component build passes.

**Added**
43. The AI chat parts are all exported:
    - A consumer `onClick` runs before stop, and `preventDefault` cancels the stop (AIPromptInput.tsx:153-154, 214, 296).
    - `data-phase={state}` is set on each row (AIThinkingPart.tsx:110,155,174).
    - "Context used" is the default name (AIContextGauge.tsx:49).
    - The effort selector throws when the value is not in `steps` (AIModelSelect.tsx:162-168).
    - The consts and type are exported.
44. Sticker's variants and sizes match. `custom` without `color` throws (Sticker.tsx:107).
45. ToggleSwitch and its Item have per-item `size`/`variant`, and selection can't be cleared (`useNeverClearedValue`, Toggle.tsx:14).
46. FancyToggleSwitch uses a 54px `h-button-big` pill (fancyToggleOption.ts:9,42).
47. MorphRotationShape's modes and props match, and it forwards a ref (`RefAttributes<HTMLSpanElement>`).
48. ShapeMorphSpinner defaults to 22px (`LoadingSpinnerSize.rg` = `--ui-size-spinner-rg` 22px), has `role="progressbar"`, forwards a ref, and `SHAPE_MORPH_SPINNER_SHAPES` is exported.
49. DropdownCaret's variants are `dropdown|typeable`.
50. Seven new shapes and `Shapes` keys. All 13 `*_SHAPE_PATH` names are exported. `DsShapeComponent` is exported, and a wrapped shape is a compile error (shape.tsx:5).
51. The menu parts, `selectType`, Section `width` and `ref`, and the four types are exported.
52. SplitButtonGroup is exported.
53. The text roles, `TextVariant`/`FontSizes`/`Tracking` keys, and the `fontSize`/`letterSpacing` value additions on every Text role and the four Toast/Tooltip parts (diff lines 310-330) are in place. The type changes and the three `text-style-*` classes exist.
54. FadeChangeText is exported.
55. Button `medium` 46px and `big` 54px, with a 16px hero label (Button.tsx:142-145). They exist only on the pill variants.
56. Input `variant` and `InputVariant` keys, `icon` required on the icon variants, `autoWidth`, `format`, `locale`, number `min`/`max`, and `onValueChange` (diff lines 238-245, 506-515; Input.tsx:42-45).
57. Slider `variant` (custom requires `color`), `stepColor`, `highlightedStep` and the three Props types (diff lines 289-299, 554-564).
58. HotkeyIndicator `variant` default|menu, `data-pressed` (HotkeyIndicator.tsx:27) and a ref.
59. `TabSize.iconMicro`, `TabVariant.unselected`, `ToggleSize.icon/iconMicro`, `ToggleVariant.unselected`, `LoadingSpinnerVariant.star` and `SegmentedSize`.
60. TypeableDropdownTrigger `displayValue` and `data-select-type`.
61. DatePicker `triggerProps`, `contentProps` and `defaultOpen`. Calendar forwards a ref and takes div attributes (ForwardRef `<HTMLDivElement>`).
62. `labels` on Calendar, DatePicker and CalendarCaption. `ToastOptions` is exported with `closeLabel`. `digitLabel`.
63. ModalContent and SheetContent `portal` default `true` (dialogShell.tsx:76) and `portalProps`, plus their Props types.
64. TableHeaderCell `buttonProps`. Note: it also omits `asChild`.
65. A ref on every icon (89), on every shape, SidebarWithHoverIcon, HotkeyIndicator, SplitButton and Calendar. Icons and shapes take all `<svg>` attributes, and SplitButton takes root attributes (diff lines 233-305).
66. SplitButtonTrigger's default name is "More options" (SplitButton.tsx:64).
67. The Added token list:
    - All 114 named tokens exist at head and none existed at v5.3.0.
    - All 146 new tokens are named, counting the wildcards.
    - Every stated value matches the diff.
    - The precedence "your tokens > preset > defaults" holds: `@layer ds.tokens, ds.expression` (tokens.css:1), and an unlayered override wins.
    - The danger-family history is right: v4.8.2 had 9 `--ui-color-danger*` tokens and v5.0.0 had none.
68. The added classes list:
    - Every named class is in head `styles.css`.
    - The new hand-written utilities merge through `cn` (runtime: `cn("h-button-medium","h-8")` → `h-8` and so on).
    - Omission: `min-h-button` and `min-w-button` are new hand-written utilities too (diff), but the list leaves them out.
69. `DS_TW_MERGE_CONFIG`: `extendTailwindMerge<"text-style">(DS_TW_MERGE_CONFIG)` compiles (twm.ts) and merges `p-md p-lg` → `p-lg`.
70. `init-skills --yes`/`-y` (bin/init.mjs:44).
71. The setup skill ships (`package/skills/dooph-design-system-setup/` in the head tarball; not in v5.3.0's).

**Changed**
72. Motion uses one scale. `ds-motion-state` transitions colour, opacity, shadow and transform properties at `--ui-motion-duration-fast` with the standard curve (dooph-component-tokens.css:48-54). The 100ms sources existed in 5.3.0 (HotkeyIndicator, Input, menu items, SearchBox, SplitButton, Table, TextLink, Toggle, CodeDigitInput, menu/tooltip open).
73. The reduced-motion block sets every scale duration to 1ms and both staggers to 0 (diff line 612).
74. The prominent colour is violet #340fd9 (diff line 724).
75. Dark `--ui-color-text-tertiary` goes #717171→#8b8b8b (diff line 651).
76. RollChangeText depth 0.9em→0.55em and blur 4px→0.1em (diff lines 807, 809). The soft mask is `ds-change-swap` (RollChangeText.tsx:11).
77. CTAButton: end-mark shape per size, 22/26px icon, CTAText, 16px pill padding and hugging (CTAButton.tsx:9-11; tokens).
78. PopoverContent's look: `border-popovers`, `bg-modal-surface` (dark #212124; 5.3.0 used `bg-surface-primary`, dark #000000) and `shadow-menu`. The offset part is FALSE 11.
79. SearchBox draws `SearchIcon` at `IconSize.md` (SearchBox.tsx:43).
80. The dropdown triggers render DropdownCaret (DropdownTrigger.tsx:81,269).
81. Icons:
    - `IconProps` is an alias, and `extends` still compiles (P58).
    - `color` sets CSS `color` (BaseIcon.tsx:110-112).
    - `aria-label` and `aria-labelledby` lift the default `aria-hidden` (BaseIcon.tsx:9-10,102). 5.3.0 always defaulted it to `true`.
82. "use client":
    - Button, Checkbox, ShapeButton, CodeDigitInput, Modal, Popover, Sheet, Tooltip, Tabs, SearchBox, SplitButton, LinearProgressIndicator, DatePickerTrigger, LoadingSpinner and RollChangeText chunks carry no directive at head.
    - Calling `buttonVariants` and `tabTriggerVariants` in a Server Component builds.
83. Styling hooks: CalendarGrid sets `data-range`, `data-today` and `data-outside` (CalendarGrid.tsx:66,167,229), and HotkeyIndicator sets `data-pressed`.
84. ShapeMorphSpinner, DropdownCaret and MorphRotationShape render from a Server Component (`next build` passed).
85. The generated-utility set follows the markup: `w-64`, `p-4` and `text-white` are in v5.3.0 `styles.css` and absent at head. The variable-list part is FALSE 14.
86. The ESM maps of stamped chunks are shifted. Head `add-use-client.mjs:139-145` prepends `;`, and 27/27 stamped chunks begin their mapping after the directive. 5.3.0's script had no shift.
87. The consumer skills are rewritten, and the v3 and v5 skills changed (`git diff --stat v5.3.0 -- skills/`).

**Fixed**
88. In 5.3.0, PentagonShape and PuffShape hard-coded `fill="currentColor"` (PentagonShape.tsx:18).
89. ToastProvider `duration` defaults to 4000 (defaults diff).
90. `ToastRoot` sets `data-variant` (Toast.tsx:102).
91. Calendar with an invalid value: it threw "Invalid time value" in 5.3.0. At head it warns and renders nothing (`renderToString`).
92. `asChild` on OutlineButton, ShapeButton, DropdownTrigger and TextDropdownTrigger: "Slot failed to slot" in 5.3.0. At head it renders with the `<a>` as the root, or inside the frame for OutlineButton.
93. OutlineButton calls the consumer's `onMouseMove` (OutlineButton.tsx:84-118).
94. The ProgressIndicator default name is "Progress", and `aria-labelledby` drops it (ProgressIndicator.tsx:330).
95. DatePickerSplitTrigger merges `className` after its seam classes (DatePickerSplitTrigger.tsx:39,102).
96. Input `hasError` → `aria-invalid` (Input.tsx:45).
97. VerificationCodeInput focuses the first empty cell (VerificationCodeInput.tsx:9).
98. Slider PageUp, PageDown and Shift+Arrow move 10 steps (Slider.tsx:251-258).
99. Table roles, `aria-sort` and no divider on the last row (Table.tsx:25,49,92-93,137).
100. Checkbox keeps its fill while pressed and uses a 2px ring (Checkbox.tsx:6,44).
101. TabsContent has `ds-focus-visible-ring` (Tabs.tsx).
102. TypeableDropdownTrigger has no `type` (DropdownTrigger.tsx:182).
103. A consumer `style` wins: LinearProgressIndicator spread `...style` first in 5.3.0 and puts it after at head, and the same holds for DropdownMenuSection (DropdownMenu.tsx:480).
104. The rem→px spacing follows the overrides (same evidence as TRUE 41).
105. HeartFillIcon's path extent goes from about 15 to about 22.5 of 24 units.
106. Arrow, Clover and Cookie used a fixed `ShapeClipPath id="clip0_504_97x"` in 5.3.0. Head has no clipPath.
107. Nested `.dark` aliases: the `.dark` block now re-declares the alias tokens: primary borders, selection, tooltip inverse and matching colours, the focus and press shadows, shimmers, slider steps and stickers (diff lines 615-672).
108. Input composes refs with `useComposedRefs` (Input.tsx:101).
109. Server components: all 27 client modules are stamped at head (scripted check). In 5.3.0 the six named modules were unstamped, along with Button, Checkbox and CodeDigitInput, which carry no hooks; 9 in all.
110. `init-skills </dev/null`: v5.3.0 exited 0 with nothing copied. Head installs `.agent`, `.agents` and `.claude`.
111. `THIRD_PARTY_NOTICES.md` is in the head tarball (MIT and Apache text present).

**Removed**
112. The 18 removed exports match the diff.
113. The removed props match the diff (SplitButton `children`/`className` and VerificationCodeInput `aria-label` are still accepted as inherited props).
114. The removed const keys match.
115. The removed tokens and theme keys match. Minor: `--ui-icon-stroke` is renamed but is not an "icon-size name".
116. The 18 removed `ds-*` classes plus `h-tab-micro` match. `h-tab-micro` is the only hand-written utility removed; I compared every non-`ds-` selector in both trees' `src/styles`.

**Historical**
117. 1.1.0 and 1.0.0, and the template comment, are byte-identical to `git show v5.3.0:CHANGELOG.md` (diff of the tail sections: no output).

---

## Coverage of the writer's mapping (30 random diff lines)

I took 30 lines of the 1468-line diff, seeded random sample with seed 20261011.

- **29** are covered by a named bullet or a stated rule. For example: AITextPartProps (the Props rule), `DropdownMenuSelectType`, `AIPromptInputSubmit`, LoadingSpinner `color`, SliderLabeled `variant`, SplitButton inherited props, ToastRoot variant, `ShapeButtons` `arrow`/`star`, `DS_COLOR_TOKENS` `prominent-color-ter`, the SegmentedVariant values, dark ghost-fg, `border-focus`, `brand-border-active`, `--ui-height-outline-button`, `--ui-radius-outline-frame`, `--color-brand-color` and `.h-button-medium`. The other 10 are generated utilities, covered by the "styles.css holds only what the components use" rule.
- **1**, `RollDirection` declared in a different folder, has no CHANGELOG home. The writer omits it as internal, which is correct: the root import is unchanged.

## Under-claims beyond the FALSE items

- **ShapeButton default (FALSE 9).** This is the only behaviour or default change missing from Breaking. The defaults diff found these others, all covered or harmless:
  - Covered: PopoverContent (FALSE 11), SegmentedTabSelect, ToastProvider and the renamed default constants.
  - Harmless: RollChangeText `direction` and DropdownMenuSearch `showShortcut`. The default moved, and the value is unchanged.
- **Base-size bullet (:141).** It names the size props of Button, TabsTrigger, ToggleSwitch, TextDropdownTrigger and Avatar. `SegmentedTabItem` also takes `TabSize` (diff line 268).

## §4 reappearances (FINDINGS.md claims register)

- **C-CHANGELOG-1 / F-049** ("CHANGELOG has nothing for 34 tags") comes back in a new form at :926. The new pointer says release notes live at the tags, and they don't (FALSE 17).
- **C-README-5/6** (an RSC `next build` fails because modules are unstamped) do **not** reappear. The Fixed claim is now true: 27/27 stamped, and `next build` passed with the head tarball.
- **F-006** (`rounded-standard` presented as current) does not reappear. The CHANGELOG lists it only as the 5.3.0 name.

## Cross-doc contradictions

- **Changed :775 (and FALSE 14) against the dispatch classification rule.** `.agents/skills/dooph-ds-writing-version-migrations/references/surface-diff.md` §4 grades "generated utility added or removed" as "not breaking". The CHANGELOG follows that skill. The dispatch rule here counts a removed class as a break. The maintainer must decide which rule governs, then align the skill and the CHANGELOG.
- **Intro :12 against the Changed section (FALSE 1).** The doc defines Breaking as "looks different", then files visual changes under Changed.
- **1.1.0 :933-947 against [Unreleased] :760-764.** 1.1.0 promises that "every interactive component ships a per-module `"use client"` directive". Unreleased removes it from Button, Tooltip and others, and those now render as Server Components with their Radix parts client. RSC support still holds (verified by `next build`). 1.1.0 is historical and must stay unedited, so the Unreleased bullet is the right place for this; there is nothing to fix.

---

## Fixes

Fixer, 2026-10-11. Re-probed in scratch worktrees `../ds-cf9-v530` (tag v5.3.0) and `../ds-cf9-head` (HEAD plus `git diff --binary HEAD` applied). Both were built with `npm ci && npm run build` and removed afterwards. TypeScript probes import `../dist/index.js` (strict, bundler, react-jsx, `types: []`). Codemods were run as written: the CHANGELOG's ```js blocks were extracted and run over a v5.3.0-era fixture in the session scratchpad. The fixture holds `--ui-*` overrides, `var(--spacing-*)`, `var(--radius-standard)`, `var(--shadow-focus-*)`, `var(--color-*)`, utilities with variants, and an app-declared `@theme { --color-brand }`. There is no CHANGELOG claims file under `claims/`, so this section is the claim record for the changes.

**Rule chosen for FALSE 1:**
- Breaking: code stops compiling, a documented token or class stops styling, or a default, size, position, role or accessible name that 5.3.0 set changes without a compile error.
- Changed: retunes of colour, motion and glyphs, and changes to output that was never a contract.
- The rule was applied to every Changed item the checker listed.

1. FALSE 1 (what Breaking means): FIXED. The new intro states the rule above. Moved to Breaking under it:
   - ShapeButton's default (FALSE 9).
   - PopoverContent's offset (FALSE 11).
   - CTAButton's measurements: icon 20 → 22/26px, standard label gap 40 → 60px, big pill padding 12 → 16px and no 370px minimum (v5.3.0 vs head CTAButton.tsx `SIZES`).
   - The dropdown triggers' width: a 14px chevron plus 10px right padding became a trigger-height `DropdownCaret` square with no right padding (v5.3.0 DropdownTrigger.tsx:56-72 vs head :62-81; DropdownCaret.tsx:63).
   
   The colour, dark tertiary, RollChangeText, SearchBox glyph (16px in both) and motion-timing items stay under Changed: they change only paint or motion.
2. FALSE 2 (searching for silent items): FIXED. "…find them by searching for the old name, or for the token, component or test query the item names."
3. FALSE 3 (Button union): FIXED, re-probed at head. `variant: ButtonVariant` with a 2-, 3- or 4-member size union compiles. The 5-member `Exclude<ButtonSize, "medium" | "big">` and `ButtonSize` fail (TS2322). New text: "a `size` typed as `ButtonSize`, or as a union of five or more sizes, even without the pill sizes (smaller unions and literals such as `size="sm"` still compile)".
4. FALSE 4 (shape fix): FIXED, re-probed. `const a: ReactNode = StarShape({size: 24})` fails (TS2322, `ReactNode | Promise<ReactNode>`). `ReturnType<typeof StarShape>` and JSX compile. New text: "(it returns `ReactNode | Promise<ReactNode>`). Fix: render it as JSX (`<StarShape size={24} />`), or type the result `ReturnType<typeof StarShape>`."
5. FALSE 5 (focus border): FIXED. tokens.css:146 sets the prominent hover border in light and :812 the prominent active border in dark. The row now says "(light) and … (dark)".
6. FALSE 6 (ghost foreground list): FIXED, with corrections to the checker:
   - TextDropdownTrigger does read `text-ghost-fg` at head (DropdownTrigger.tsx:323,325), and did in 5.3.0 (:290,292).
   - The Toast close is not affected: it paints `text-current` (Toast.tsx:186).
   - The `text` Button variant also reads it (Button.tsx:107).
   - The AI model picker is new, so "darker" does not apply to it.
   
   New text: "`ghost` and `text` Buttons (and CopyButton's ghost variant, which renders one), TextLink, the default HotkeyIndicator, TextDropdownTrigger, and the Calendar weekday names and outside days."
7. FALSE 7 (Tailwind codemod): FIXED. Reproduced: the old block left `var(--radius-standard)`, `var(--shadow-focus-brand)` and `var(--shadow-focus-error)` unchanged. The new guards are `!/^(?:-?rounded|--radius)/.test(prefix)` and `prefix !== "shadow-" && prefix !== "--shadow-"`. On the fixture, all three are renamed, and so is every utility form.
8. FALSE 8 (Props types): FIXED. The head `dist/index.d.ts` has no `Props` type for the two toolbar halves, the five menu items and submenu parts, or the shapes. The new text names these three exceptions.
9. FALSE 9 (ShapeButton default): FIXED. v5.3.0 ShapeButton.tsx:89-94 used secondary fills and set no icon colour. Head sets `variant = prominent` (:102) and paints it at :64-79. New Breaking > Components item with before → after → fix (`variant={ShapeButtonVariant.primary}`). The Added line points to it.
10. FALSE 10 (theme keys): FIXED. A script checked every new `--ui-(color|radius|shadow|spacing|text)-*` token: exactly the eight named lack a `theme.css` key. Added: "except the focus-ring and slider-step colours and the button and CTA spacing tokens, which components read through other tokens and `ds-*` classes."
11. FALSE 11 (PopoverContent offset): FIXED. Popover.tsx `sideOffset` defaults to `4` at v5.3.0 (:33) and `6` at head (:31). DatePicker renders `<PopoverContent {...contentProps}>` (DatePicker.tsx:152). New Breaking > Layout item, with the fix `sideOffset={4}` or `contentProps={{ sideOffset: 4 }}`. The Changed bullet keeps only the paint.
12. FALSE 12 (CTAButton ref), the disputed item: FIXED. Filed under Breaking > Props as a compile error, not silent. In probe `cta.tsx`, all seven lines compile at v5.3.0.
    - Still compiles at head (the writer was right that callback refs are bivariant):
      - a `useRef<HTMLAnchorElement>` object ref;
      - a callback declared `(el: HTMLAnchorElement | null) => …`;
      - a `RefCallback<HTMLAnchorElement>`;
      - a `forwardRef<HTMLAnchorElement>` wrapper that passes its ref on;
      - an anchor callback assigned to `ComponentProps<typeof CTAButton>["ref"]`.
    - Fails at head with TS2339 "Property 'href' does not exist on type 'HTMLElement'" (the checker was right that it breaks):
      - `useRef<ComponentRef<typeof CTAButton>>`, then reading `.current?.href`;
      - an inline `ref={(el) => el?.href}`, where `el` is contextually typed `HTMLElement`.
    - All three fixes in the new text compile at head: an annotated callback, `useRef<HTMLAnchorElement>`, and `instanceof` narrowing.
13. FALSE 13 (colour props): FIXED. v5.3.0 LinearProgressIndicator.tsx:25,52 already used `resolveDsColor`; ProgressIndicator and LoadingSpinner had the two-name table. The text now says so.
14. FALSE 14 (theme-layer variables): FIXED. Parsing `@layer theme` in both `dist/styles.css` files gives 35 variables at v5.3.0 and 6 at head (`--font-sans`, `--spacing` and four `--default-*`). The new text lists the dropped families, with v5.3.0 examples. Classification: kept under Changed, with the reason stated ("not a contract, which is why this item is not under Breaking"). That matches `.agents/skills/dooph-ds-writing-version-migrations/references/surface-diff.md` §4. The maintainer still has to confirm that rule (see Cross-doc contradictions).
15. FALSE 15 (tarball): FIXED. `npm pack --dry-run`: 2079 → 1350 files, 505,266 → 675,295 bytes. New text: "**Fewer tarball files:** about a third fewer …". "Smaller" is gone.
16. FALSE 16 (`cn` text-style): FIXED, reproduced. At v5.3.0, `cn("text-text-secondary","text-body")` gives `text-body`; head keeps both. At head, `cn("text-body","text-sm")` gives `text-sm`. New text: "`cn` treats the role font-size utilities (`text-body`, `text-label` …, from `theme.css`) as font sizes: `text-body` next to a text colour no longer erases the colour, and a later font-size utility (`text-sm`) replaces it."
17. FALSE 17 (2.0–5.3 pointer): FIXED.
    - The annotated tags carry only the version, and `git show v5.3.0:CHANGELOG.md` has only 1.1.0 and 1.0.0.
    - `gh` is not installed, so I read the GitHub REST API instead (read-only). https://github.com/dooph-software/dooph.-design-system/releases has 41 releases, with notes for most of 2.0.0 … 5.3.0. There are none for v3.0.1, v4.2.0, v4.5.0, v4.6.0 or v4.7.2.
    - New text: "This file has no entries for 2.0.0 through 5.3.0. Short notes for most of those versions are on the GitHub Releases page (…); the full changes are in the commit history between the tags `v2.0.0` … `v5.3.0`, and the v3 and v5 majors are described by the `dooph-design-system-v3-migration` and `dooph-design-system-v5-migration` skills."

UNVERIFIABLE:

1. LoadingSpinner: NARROWED to code facts. Sources:
   - the LoadingSpinner.tsx header: CSS-only animation, renders once, writes geometry only; flat = Material's circular indeterminate pattern;
   - no `"use client"`;
   - index.css:69-78 (`@property --ds-spinner-grow/-tail`).
   
   New text: "…renders once and writes only geometry, so its server-rendered markup needs no hydration to move. The flat variant follows Material's circular indeterminate pattern; its arc runs on two custom properties registered with CSS `@property`."
2. CopyButton zoom: NARROWED to the stylesheet. dooph-component-tokens.css:617-632 swaps `scale(0.6)` + opacity 0 with `scale(1)` + opacity 1. New text: "the outgoing icon shrinks to 60% and fades out as the incoming one grows from 60% and fades in."
3. Toast exits: NARROWED to the mechanism.
   - v5.3.0 Toast.tsx:225-251: `onOpenChange(false)` filtered the item out at once, and `dismiss` pruned it after `setTimeout(…, 200)`.
   - Head :252-292: closing flips `open`, and the toast is pruned on its own `animationend`.
   
   The new text states that mechanism.
4. ToastClose: NARROWED to the cause. In v5.3.0, Toast.tsx:169's `hover:text-current` lost to the ghost variant's guarded `[&:not(:disabled)…]:hover:text-ghost-fg-active` (#161616 in light, v5.3.0 tokens.css:63). Head Toast.tsx:183-186 uses the guarded selector. The new text names this cause.
5. ProgressIndicator: NARROWED to the header contract (ProgressIndicator.tsx:15-31: one animated value, both arcs mounted, zero-length arcs fade). New text: "…animates one value that every dash is computed from, and keeps both arcs mounted. So when `progress` changes mid-animation its track no longer overlaps the indicator, slides back or vanishes, and an empty arc fades out instead of leaving a round-cap dot or reappearing without a transition."
6. Text components, "rendered output is unchanged except …": REMOVED, since it needs a full render diff. The bullet keeps "so typography sits on one element".
7. Disabled states: NARROWED and verified.
   - v5.3.0 SearchBox has no disabled styling.
   - v5.3.0 CodeDigitInput put `ds-disabled-state` on a `<div>`, where it never matches.
   - v5.3.0 CalendarPresetsPanel sets no `data-disabled`.
   - Head sets `data-disabled` on all three, with `ds-radix-data-disabled` (dooph-component-tokens.css:118-121).
   - ShapeButton's and SplitButton's hover and press classes skip `[aria-disabled=true]` (0 hits at v5.3.0).
   
   The new text says so.
8. Padding classes: VERIFIED, text unchanged. I ran `renderToString` on all nine components with `className="p-xxxs"` (and `gap-xxxs` on both dropdown triggers).
   - At v5.3.0, every one keeps its `ds-p*-ui-*` / `ds-gap-ui-xs` helper next to the consumer class.
   - At head, every component padding and gap class is dropped. The defaults are now Tailwind utilities, e.g. SearchBox `pl-lg pr-md py-md`.

Under-claims fixed in passing:
- The base-size bullet now names `SegmentedTabItem`.
- The Added classes list now includes `min-h-button` and `min-w-button`. Both merge through `cn`: `cn("min-h-button","min-h-8")` gives `min-h-8`.
- In Fixed, "the new `DropdownMenuSection`" is corrected to "`DropdownMenuSection`'s new `width`". DropdownMenuSection already exists in v5.3.0 (Menu/DropdownMenu.tsx:263).

Issues from the v6-skill writer (`changelog-issues-from-v6.md`), each verified first:

- #1 (no pointer to the v6 skill): TRUE. FIXED. The intro now says to run `npx @dooph-software/design-system init-skills` after installing v6, which installs the `dooph-design-system-v6-migration` skill that ships in the package. The command is from bin/init.mjs:6; the script copies all of `skills/` (bin/init.mjs:29,113).
- #2 (spacing regex): TRUE, reproduced. The old block left `var(--spacing-md)` and `var( --spacing-xl)` unchanged. It also moved `max-w-md`/`w-xs` even in an app whose Tailwind build does not import the DS `theme.css`. FIXED:
  - a `DS_THEME` switch;
  - `(?<=var\(\s*)--spacing-` added for reads, leaving declarations untouched;
  - with `DS_THEME = false`, only `--ui-spacing-*` moves. On the fixture, `max-w-md w-xs` and `var(--spacing-*)` stay unchanged.
- #3 (a merge and a split shown as renames): TRUE. FIXED in prose; the code is unchanged.
  - The Tailwind-key row reads "`h-tab-micro` (30px) → `h-button-micro` (28px: a merge, not a rename …)".
  - A paragraph after the token codemod says `--ui-height-tab-micro` merges into the 28px micro-button token, which micro icon buttons also read.
  - The same paragraph says `--ui-size-cta-icon` sized both CTA icons, so an override must be copied to `--ui-size-cta-icon-big` too.
- #4 (app-declared theme keys renamed): TRUE, reproduced. The old block rewrote an app's `@theme { --color-brand: … }` to `--color-prominent`, overriding the DS key, and renamed every `bg-brand` with it. FIXED: the block first drops every key the app's own CSS declares (`appCss.matchAll(/--(?:color|radius|shadow)-([\w-]+)\s*:/g)`). On the fixture, the declaration, `var(--color-brand)`, `hover:bg-brand` and `ring-brand/50` stay, and `bg-brand-hover` is still renamed.

Cross-doc contradictions:
1. Changed "styles.css holds only what the components use" vs the dispatch rule: not resolved by me. The CHANGELOG now states the surface-diff skill's reason; the maintainer must confirm which rule governs.
2. Intro vs Changed: resolved by the new rule.
3. 1.1.0 vs Unreleased: no change, as the checker said.

Lint: `npm run lint` → `conventions: 30 checks passed`, exit 0.

Lint note: a second run failed only on skill mirrors. Another agent had edited `.agents/skills/` (editing-tokens, styling, writing-components) while I worked, and the mirrors were stale. I made no skill edits. I ran `node scripts/sync-skills.mjs` (10 mirror files updated), and `npm run lint` then exited 0 with 30 checks passed.

---

## Fix verification

Verifier, 2026-10-11. Read-only, except for this section. Truth is tag `v5.3.0` against the current working tree.

**Method**
- Scratch worktrees `../ds-vf9-v530` (tag v5.3.0, 8f58ae8) and `../ds-vf9-head` (`git stash create` = 319bad0, the working tree with every tracked change). Both ran `npm ci && npm run build` and exited 0. Both were removed afterwards.
- TypeScript probes import `../dist/index.js` and use the surface-diff skill's tsconfig (strict, bundler, react-jsx, `types: []`).
- The codemods are the three ```js blocks of the current `CHANGELOG.md`, extracted and run as written over my own v5.3.0-era fixture: `scratchpad/vf9/fx/`, runner `scratchpad/vf9/tool/run.mjs`.
  - It has two modes: `DS_THEME` true, and `DS_THEME` false (the no-`theme.css` mode).
  - It has an app stylesheet that declares `@theme { --color-brand; --radius-standard }`.
  - The same fixture run through the CHANGELOG the checker read (149768a) reproduces each original defect.
- Release notes come from the read-only GitHub REST API.

**FALSE items**

1. What Breaking means: **STILL FALSE (narrow).** The rule is now stated (:12-20), and most items follow it. These are filed against it:
   - Under Breaking, although the rule files colour retunes under Changed:
     - `--ui-color-ghost-foreground is the text colour` (:403). A grey becomes `var(--ui-color-text)`.
     - `The dark primary focus ring is visible` (:410). Only the rgba changes.
     - Both are colour-only, like the prominent violet (:793) and dark `--ui-color-text-tertiary` (:795), which sit under Changed. This is over-classification, so it is harmless for consumers, but it is inconsistent.
   - Under Fixed, although it is "an accessible name that 5.3.0 set" changing silently:
     - The Slider thumb's name (:905-907). v5.3.0 `Slider.tsx:320` set `aria-label={ariaLabel ?? 'Value'}` on the thumb, and a root `aria-labelledby` went to the root through `...props`. So a 5.3.0 thumb labelled by reference was named "Value", and at head it takes the referenced name.
     - A test such as `getByRole("slider", { name: "Value" })` breaks with no compile error. This is the same pattern as RollHoverText, which is filed as Breaking.
   - Under Fixed, although it is the same kind of break as the Breaking `cn()` item (:509):
     - `cn("text-body","text-sm")` gives `text-body text-sm` at v5.3.0 and `text-sm` at head (runtime, both dists). An earlier DS class is now dropped.
   - Borderline:
     - Changed :816-820, Icons. An icon given `aria-label` used to stay `aria-hidden` (v5.3.0 `BaseIcon.tsx:45` defaulted to `true`). At head it is exposed (BaseIcon.tsx:102). This changes accessibility exposure that 5.3.0 set, though it is a fix in direction.
     - Changed :801-804, CTAButton. The label weight goes medium → semibold (v5.3.0 `FontWeights.medium` → `CTAText`). Font weight is neither "colour, motion or glyph" nor in the Breaking list.
   - Fix options: move the Slider-name item to Breaking > Components as silent, and move the `cn` text-size half beside the Breaking `cn()` item. Then either move ghost-foreground and the dark focus ring to Changed, or widen the rule's Changed wording to say a token whose value is replaced by an alias stays Breaking. That last choice is for the maintainer.
2. Searching for silent items: **VERIFIED.** :17-18 holds the new sentence.
3. The Button union: **VERIFIED**, re-probed at head.
   - `variant: ButtonVariant` with a 4-member size union compiles, for both `sm|standard|icon|icon-sm` and `standard|icon|icon-sm|icon-micro`.
   - `Exclude<ButtonSize,"medium"|"big">` (5 members) and `ButtonSize` fail with TS2322.
   - `size="sm"` compiles.
4. The shape fix: **VERIFIED.** `const e: ReactNode = StarShape({size:24})` fails with TS2322 (`ReactNode | Promise<ReactNode>`). `ReturnType<typeof StarShape>` and `<StarShape size={24} />` compile.
5. The focus border: **VERIFIED.** tokens.css:146 holds the light value (`prominent-border-hover`) and :812 the `.dark` value (`prominent-border-active`). At v5.3.0, `--ui-color-border-focus` was only `var(--ui-color-brand-border)` (:99), with no dark line.
6. The ghost-foreground list: **VERIFIED.**
   - Head `text-ghost-fg` readers: Button `ghost` and `text` (Button.tsx:102,107), TextLink (:23), HotkeyIndicator default (:43), TextDropdownTrigger (DropdownTrigger.tsx:323,325), and CalendarGrid weekday names and outside days (:122,249). All of these read it at v5.3.0 too.
   - AIModelSelect is new.
   - CopyButton renders `<Button>` with the ghost variant (CopyButton.tsx:68).
   - ToastClose overrides with `text-current` (Toast.tsx:186).
7. The Tailwind codemod: **VERIFIED.**
   - The new block renames `var(--radius-standard)`, `var(--shadow-focus-brand)` and `var(--shadow-focus-error)`, and every utility form: variants, `ring-brand/50`, `rounded-l-`/`rounded-tl-standard` and `h-tab-micro`.
   - It leaves `text-standard`, `text-md`, `rounded-md` and `ds-*` alone.
   - The old block left the three variables unchanged.
8. Props types: **VERIFIED.** Head `dist/index.d.ts` has no `*Props` for the five menu items and submenu parts, the two toolbar halves or the shapes. The toolbar halves are typed `AIPromptInputToolbarProps` (AIPromptInput.d.ts:23,25). Every other new component checked (27) has its own `*Props`.
9. ShapeButton's default: **VERIFIED** at both trees.
   - v5.3.0 ShapeButton.tsx:89-94: the shape span has `text-secondary`, `group-hover:text-secondary-hover` and `group-active:text-secondary-active`. There is no content colour.
   - Head :107 sets `variant = ShapeButtonVariant.prominent`. :64-79 paints `text-prominent` with `text-prominent-fg`. Only `primary` and `prominent` exist.
10. Theme keys: **VERIFIED.**
    - Of the 63 new `--ui-(color|radius|shadow|spacing|text)-*` tokens (head tokens.css minus v5.3.0), exactly the eight named have no `var(--ui-…)` in head `dist/theme.css`.
    - The readers fit "through other tokens and `ds-*` classes": `ds-slider-*`, `ds-px-button-*` and `ds-gap-cta-content-standard`, and the focus shadows.
11. PopoverContent's offset: **VERIFIED.**
    - `sideOffset = 4` at v5.3.0 Popover.tsx:33, and `= 6` at head :31.
    - v5.3.0 DatePicker rendered a bare `<PopoverContent>` (:130). Head spreads `{...contentProps}` (:152), so `contentProps={{ sideOffset: 4 }}` works.
12. CTAButton's ref: **VERIFIED**, with my own probe (`__probe__/cta.tsx`, head and v5.3.0 dists).
    - Compile at both trees:
      - `useRef<HTMLAnchorElement>`;
      - `createRef<HTMLAnchorElement>`;
      - `(el: HTMLAnchorElement | null) => …`;
      - `RefCallback<HTMLAnchorElement>`;
      - an anchor callback typed as `ComponentProps<typeof CTAButton>["ref"]`;
      - an annotated `useCallback`;
      - `forwardRef<HTMLAnchorElement>` passing its ref on;
      - a `Ref<HTMLAnchorElement>` prop passed on.
    - Fail only at head (TS2339 `href` on `HTMLElement`):
      - `useRef<ComponentRef<typeof CTAButton>>` and `useRef<ElementRef<typeof CTAButton>>` reading `.current?.href`;
      - an inline `ref={(el) => el?.href}`.
    - An unannotated `useCallback((el) => …)` fails at **both** trees (TS7006), so it is not a new break.
    - The three fixes compile at head: `useRef<HTMLAnchorElement>`, the annotated callback, and `instanceof` narrowing.
    - This confirms the claim: the ref fails only for component-derived ref types or inline callbacks reading `href`.
13. Colour props: **VERIFIED.**
    - v5.3.0 LinearProgressIndicator.tsx:25,52 already called `resolveDsColor`.
    - ProgressIndicator (:33-39) and LoadingSpinner (:28-35) at v5.3.0 had a `primary`/`brand` table.
    - Head AIContextGauge passes `color` to ProgressIndicator, which resolves it.
14. The theme-layer variables: **VERIFIED.**
    - Parsing `@layer theme` gives 35 variables at v5.3.0 and 6 at head (`--font-sans`, `--spacing` and four `--default-*`).
    - The listed families and examples are exact.
    - `.w-64`, `.p-4` and `.text-white` are in the v5.3.0 sheet and absent at head.
    - None of those variables is named in v5.3.0 `skills/` or `README.md`, so "never a contract" fits the rule's "documented" qualifier. The maintainer decision noted earlier still stands.
15. The tarball: **VERIFIED.** `npm pack --dry-run` gives 2079 → 1350 entries (−35%), 506,145 → 674,357 bytes. "Smaller" is gone, and "about a third fewer" is true. The untracked v6 skill would add 2 files.
16. The `cn` text-style fix: **VERIFIED.** Runtime, v5.3.0 → head:
    - `cn("text-text-secondary","text-body")`: `text-body` → both;
    - `cn("text-body","text-sm")`: both → `text-sm`;
    - `cn("text-style-body","text-text-secondary")`: both in each tree.
    - For its classification, see 1.
17. The release-notes pointer: **VERIFIED.**
    - `GET /repos/dooph-software/dooph.-design-system/releases?per_page=100`, unauthenticated, returns 41 releases, so the repo is public and the URL is valid.
    - Of the 32 distinct versions from 2.0.0 to 5.3.0 among the git tags, 22 have a release with a non-empty body, so "short notes for most" is true.
    - The 10 without notes: v3.0.1, 4.2.0, 4.5.0, 4.6.0 and 4.7.2 have no release, and 2.0.1–2.0.3, 4.7.1 and 4.8.1 have an empty body.
    - The annotated tag messages are just the version (v2.0.0 … v5.3.0).
    - The v3 and v5 migration skills exist.

**UNVERIFIABLE items** (the narrowed text now states code facts)

1. LoadingSpinner (:788-792): **VERIFIED.** The LoadingSpinner.tsx header states CSS animation, render once, geometry only, and the Material flat pattern. It has no `"use client"` (header :42). `@property --ds-spinner-grow`/`-tail` are in index.css:69-78.
2. The CopyButton zoom (:810-811): **VERIFIED.** dooph-component-tokens.css:617-632 has `scale(0.6)` + opacity 0 ↔ `scale(1)` + opacity 1.
3. Toast exits (:866-869): **VERIFIED.**
   - v5.3.0 Toast.tsx:225-251: `onOpenChange(false)` filters the toast out at once, and `dismiss` prunes after `setTimeout(…, 200)`.
   - Head :252-292: `open` flips, and the toast is pruned on its own `animationend` while closed.
4. ToastClose (:873-875): **VERIFIED.** v5.3.0 :169 has a plain `hover:text-current`, against buttonVariants' guarded `[&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active`, which has higher specificity. That colour is #161616 (v5.3.0 tokens.css:63). Head :186 uses the guarded form.
5. ProgressIndicator (:888-892): **VERIFIED** against the header contract (ProgressIndicator.tsx:15-31).
6. Text components: **VERIFIED.** The "unchanged except" sentence is removed (:831-833).
7. Disabled states (:920-924): **VERIFIED.**
   - At head, `data-disabled` is set on SearchBox (:28), CodeDigitInput (:65) and CalendarPresetItem (CalendarPresetsPanel.tsx:66). Each carries `ds-radix-data-disabled` (directly, or through `menuItemClassName`).
   - v5.3.0 had none of them. Its CodeDigitInput put `ds-disabled-state` on a non-form element.
   - `aria-disabled=true` guards: 5 in ShapeButton and 2 in SplitButton at head, 0 at v5.3.0.
8. Padding classes: **VERIFIED**, spot-checked with `renderToString` and `className="p-xxxs"`.
   - v5.3.0 keeps the helpers beside it: SearchBox `ds-pl-ui-md ds-pr-ui-rg ds-py-ui-rg p-xxxs`, DropdownTrigger and Input `ds-pl-ui-rg ds-pr-ui-sm p-xxxs`, and OutlineSection `ds-p-ui-xs p-xxxs`.
   - Head leaves only `p-xxxs` on each.

**Issues from the v6-skill writer**

1. The v6 skill pointer (:22-24): **VERIFIED.**
   - `bin` maps `init-skills` → `bin/init.mjs`, which copies all of `skills/` (:29,113). `files` includes `skills`. `skills/dooph-design-system-v6-migration/SKILL.md` has that `name`.
   - Caveat: that folder is **untracked** in git (and not ignored). It ships only if it is committed before the release build. Otherwise the sentence becomes false.
2. The spacing regex (:356-371): **VERIFIED.**
   - In `DS_THEME = true` mode:
     - `var(--spacing-md)` and `var( --spacing-xl)` → `-lg`/`-xxl`;
     - a declaration `--spacing-md: 99px` is left alone;
     - utilities shift (`-mt-xs` → `-mt-sm`, `sm:py-sm` → `sm:py-rg`);
     - `text-xs`, `rounded-md`, `ds-p-ui-xs`, `ds-px-ui-sm` and `size-avatar-sm` are untouched.
   - In `DS_THEME = false` mode, only `--ui-spacing-*` moves, and `max-w-md`, `w-xs`, `p-md`, `px-xxl` and `var(--spacing-*)` stay as written.
   - The old block left `var(--spacing-*)` unchanged.
   - Observation (not a false claim): the spacing block has no app-declared-key guard, so an app that declares its own `--spacing-md` in `@theme` still has `p-md` and `var(--spacing-md)` shifted. The app-declared-key sentence is only in the Tailwind-key item, so nothing states otherwise.
3. Merge and split (:334-339, :449): **VERIFIED.**
   - v5.3.0: `--ui-height-tab-micro` is 30px (:347), read only by `h-tab-micro` (micro tabs). `--ui-height-button-micro` is 26px (:345).
   - Head: `--ui-height-button-micro` is 28px (:494).
   - v5.3.0 `--ui-size-cta-icon` (20px, :416) sized both CTA sizes through `ds-size-cta-icon` (CTAButton.tsx:97). Head has `-standard` 22px and `-big` 26px (:696-697).
4. App-declared theme keys (:453-475): **VERIFIED.**
   - With `@theme { --color-brand; --radius-standard }` in the app's own CSS, the new block keeps:
     - the declarations;
     - `var(--color-brand)` and `var(--radius-standard)`;
     - `bg-brand`, `hover:bg-brand` and `ring-brand/50`;
     - `rounded-standard` and `rounded-l-standard`.
   - It still renames `bg-brand-hover` / `var(--color-brand-hover)` and `text-error-primary`. This holds in both modes.
   - The old block rewrote the app's declaration to `--color-prominent`.

**Silent breaks added in this fix, before → after from source**
- ShapeButton: see 9.
- PopoverContent: see 11.
- CTAButton (:530-536), **VERIFIED** (v5.3.0 vs head CTAButton.tsx `SIZES`, tokens):
  - icon `ds-size-cta-icon` 20px → `-standard` 22 / `-big` 26;
  - standard label gap `gap-xxl` (40px in v5.3.0) → `ds-gap-cta-content-standard` 60px;
  - big pill padding `p-rg` (12px) + `ds-min-w-cta-pill-big` (370px) → `p-lg` (16px) for both sizes, with no pill minimum.
- The dropdown triggers (:537-541), **VERIFIED**:
  - v5.3.0 DropdownTrigger and TypeableDropdownTrigger: `ds-pr-ui-sm` (10px) + `<ChevronDownIcon />` at `IconSizes.standard` (14px).
  - Head: `pl-md` only, no right padding (DropdownTrigger.tsx:65,191), with `DropdownCaret` (`h-button` and `-my-px -mr-px`). `.ds-expr-caret-shape` width = `--ui-height-button` (38px) at the default scale (index.css:1013-1022).

**Under-claims fixed in passing:** **VERIFIED.**
- `SegmentedTabItem` is in the base-size bullet (:157).
- `min-h-button` and `min-w-button` are listed (:754-755). They are new in index.css:427,430 (0 at v5.3.0). `cn("min-h-button","min-h-8")` gives `min-h-8` at head.
- `DropdownMenuSection` exists at v5.3.0 (Menu/DropdownMenu.tsx:263), and the text says "`DropdownMenuSection`'s new `width`" (:928).

**Totals:** 32 VERIFIED, 1 STILL FALSE (FALSE 1: the classification items listed above).

**Lint:** `npm run lint` → `conventions: 30 checks passed`, exit 0. `node scripts/sync-skills.mjs --check` → "skill mirrors match .agents/skills (9 skills x 2 mirrors)", exit 0.

## Fixes (round 2)

Fixer, 2026-10-11. Each item re-checked against `git show v5.3.0:<path>` and the working tree before it moved. `cn` was run from both trees (esbuild bundles of `src/utils/cn.ts` in the scratchpad).

**FALSE 1, the classification: FIXED.** Counts are unchanged: 47 Breaking, 23 silent (two silent items in, two out; the `cn` half joins an existing item).
- Slider thumb name: moved Fixed → Breaking > Components, silent (CHANGELOG :118). v5.3.0 `Slider.tsx:320` `aria-label={ariaLabel ?? 'Value'}`, and `aria-labelledby` / `aria-describedby` reached the root through `...props` (:79, :277). Head :447-449 puts both on the thumb, and "Value" is only the fallback with no label at all. Before → after → fix stated. The Fixed bullet keeps only the keyboard and multi-value fixes (:940).
- `cn("text-body","text-sm")`: folded into the Breaking `cn()` item (:517), with the role-size sentence. Runtime: v5.3.0 `text-body text-sm`, head `text-sm`; also `text-label`+`text-sm`, `text-body`+`text-lg`. The Fixed bullet (:919) keeps the colour half, now "in either order" (v5.3.0 `cn("text-body","text-text-secondary")` = `text-text-secondary`; head keeps both).
- Ghost foreground and dark primary focus ring: moved Breaking > Tokens → Changed (:814, :817). Both are colour-only: v5.3.0 tokens.css:60/451 literal greys → head :107/:783 `var(--ui-color-text)`; :472 rgba(23,23,23,.15) → head :810 rgba(249,249,249,.15). No non-colour reader found. The keep-the-grey fix moved with it.
- Icons with `aria-label`: moved Changed → Breaking > Components, silent (:126). v5.3.0 `BaseIcon.tsx:45` defaulted `aria-hidden` to `true`; head :102-104 drops it when labelled. That changes an accessible name 5.3.0 set (the label joins an enclosing control's name), so the rule puts it under Breaking. No DS component passes a label to an icon itself. The Changed Icons bullet points to it (:853).
- CTAButton medium → semibold: kept under Changed. The rule's Changed sentence now reads "retunes of colour, motion, glyphs and font weight" (:19), so the item and the rule agree. **Decision for the maintainer:** widening the wording was chosen over moving a weight retune to Breaking.

**Spacing codemod snippet (rejected by the v6 skill fixer): FIXED.** The themed prefix `(?<=var\(\s*)--spacing-` is now `(?<![\w-])--spacing-` (:384), the same prefix as `codemod.mjs` `SPACING_PREFIX`, so an app's own `--spacing-*` declaration moves with its readers. One sentence added (:376-379).
- Run as written (all three ```js blocks, the previous fixer's runner with an own-declaration mode added) over `scratchpad/cm2/fixture/ownsp.*` (`@theme { --spacing-md: 20px }`, `var(--spacing-md)`, `p-md` …). Before: declaration stays `--spacing-md: 20px`, readers become `-lg`. After: `--spacing-lg: 20px` with `var(--spacing-lg)` and `p-lg`. Identical to `codemod.mjs --spacing --write` on the same files. `DS_THEME = false`: unchanged, as before.
- The default, `nodstheme` and `own` fixture modes give byte-identical output before and after.

**Mirrored into `skills/dooph-design-system-v6-migration/`.**
- SKILL.md: counts stay 47 / 23, "accessible names" added to the silent-change list; ghost foreground and the dark focus ring moved from "Same name, new value" to "Visual changes to expect"; Slider name and labelled icons added to the silent behaviour changes in step 5; `cn("text-body","text-sm")` added to the `cn()` paragraph. The description is untouched (single-quoted).
- codemod.mjs: two CHECK BY EYE entries, `*ByRole("slider")` queries and a one-line `<…Icon … aria-label…>` tag without `aria-hidden`; header list says "a changed role or accessible name". Fixture test (`scratchpad/v6/fx-pristine`, spacing write → dry exit 1 → write → manual fixes → exit 0 → spacing re-run exit 3 → missing path exit 2; fx2, fx3) gives output and trees identical to the old codemod. An extra file flags both labelled icons and both slider queries, and skips the `aria-hidden` and unlabelled icons.

## Fix verification (round 2)

Verifier, 2026-10-11. Truth = `git show v5.3.0:<path>` vs the working tree (`BaseIcon.tsx`, `Slider.tsx` and others are modified in the working tree; the lines cited are the working tree's).

- **Slider thumb name moved to Breaking > Components, silent: VERIFIED.** CHANGELOG :118. v5.3.0 `Slider.tsx:320` `aria-label={ariaLabel ?? 'Value'}`, with `aria-labelledby` / `aria-describedby` left in `...props` (:79, :277) so they reached the root. Working tree :155-158 destructures both, :447-449 puts them on the thumb, and "Value" only when neither label is given. The Fixed bullet keeps the keyboard and multi-value fixes with a pointer back.
- **`cn("text-body","text-sm")` folded into the Breaking `cn()` item: VERIFIED.** I bundled v5.3.0 `src/utils/cn.ts` and the working tree's: `["text-body","text-sm"]` gives v5 `text-body text-sm`, v6 `text-sm` (same for `text-label`+`text-sm`, `text-body`+`text-lg`). Fixed bullet "in either order": v5 `cn("text-body","text-text-secondary")` = `text-text-secondary` and the reverse = `text-body`; v6 keeps both both ways.
- **Ghost foreground and dark primary focus ring moved to Changed: VERIFIED.** v5.3.0 `tokens.css:60/451` `#4a4a4a` / `#afafaf`, :472 `rgba(23,23,23,.15)`; now :107/:783 `var(--ui-color-text)` and :810 `rgba(249,249,249,.15)`. Both sit in `### Changed` (CHANGELOG :814-817). The SKILL's "Visual changes to expect" carries both.
- **Icons with `aria-label` / `aria-labelledby` moved to Breaking > Components, silent: VERIFIED.** v5.3.0 `BaseIcon.tsx` defaulted `aria-hidden = true`; `BaseIcon.tsx:102-104` drops it when labelled. No `<...Icon aria-label` in `src` outside stories. The Changed Icons bullet points to it (:853).
- **CTAButton medium to semibold kept under Changed, rule wording widened: VERIFIED as stated.** The rule (CHANGELOG :19) reads "retunes of colour, motion, glyphs and font weight"; v5.3.0 `fontWeight={FontWeights.medium}`, v6 `.text-style-cta` uses `--ui-weight-cta`. Still a maintainer decision: a weight retune is arguably a changed default.
- **Spacing snippet (own `--spacing-*` declaration): VERIFIED.** CHANGELOG :384 now has `(?<![\w-])--spacing-`. I ran the CHANGELOG's snippet as written on `@theme { --spacing-md: 20px }`, `var(--spacing-md)`, `p-md`: result `--spacing-lg: 20px`, `var(--spacing-lg)`, `p-lg`; with `DS_THEME = false` the declaration and `p-md` are untouched; `--my-spacing-md` and `my--spacing-md` are untouched. `codemod.mjs --spacing --write` on the same input gives the same result. The sentence at :376-379 is true.
- **Mirror into the v6 skill and codemod: VERIFIED.** Counts stay 47 / 23 (see the batch-4 verification), "accessible names" is in the silent list, the Slider and labelled-icon bullets and the `cn` sentence are in SKILL.md, the description is a single-quoted 474-char scalar, and both new CHECK BY EYE entries fire on a probe while `aria-hidden` and unlabelled icons are skipped. Fixture run: spacing write, dry exit 1, write, manual fixes, dry exit 0, spacing re-run exit 3, missing path exit 2.

Lint: `npm run lint` exit 0 (`conventions: 30 checks passed`); `node scripts/sync-skills.mjs --check` exit 0.

Totals (round 2): 7 VERIFIED, 0 STILL FALSE. The earlier STILL FALSE (Breaking rule applied inconsistently) is now consistent: every moved item matches the rule as worded.
