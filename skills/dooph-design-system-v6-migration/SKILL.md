---
name: dooph-design-system-v6-migration
description: 'Use when upgrading a consuming project from @dooph-software/design-system v5.x to v6.x, after the new version is installed. Symptoms: TwoWayToggle, ToastTypes or ButtonVariant.brand fail to resolve; a --ui-color-brand override stops working or a --ui-spacing-* one lands on the wrong size; bg-brand or ds-p-ui-xs paint nothing; spacing looks a step off; tests stop finding role "status". No longer applies once the codemod exits 0, tsc passes and every step 6 check is done.'
metadata:
  short-description: Upgrade a consuming app from dooph DS v5 to v6
---

# Upgrading @dooph-software/design-system v5 → v6

v6 has 47 breaking changes. Most are renames. **23 of them raise no compile
error**: token overrides that are no longer read, utility and `ds-*` classes
that no longer exist, a spacing scale whose names now mean smaller sizes, colour
names on `color` props, changed defaults, sizes, positions, roles and
accessible names, and a value that now throws. Run
the codemod even if the app compiles. Some silent changes cannot be found by an
old name, because nothing was renamed: for those, search for the token,
component or test query the item names.

> Coming from v4 or earlier? Finish `dooph-design-system-v5-migration` (and
> `dooph-design-system-v3-migration` before it) first, done-check included. v6
> renames names those skills land on (`--ui-color-error-*`,
> `--ui-color-page-background`, `bg-page-background`, the `brand` family), and it
> brings back `--ui-color-danger*` and `surface-page` names. So the older
> skills' codemod and greps report valid v6 code once this migration is done:
> run them only at their own step, never after this one, and never as a lasting
> CI gate.
>
> Upgrading beyond v6: see the v7 migration skill when it ships.

## Before you start

- Commit, so each step below is its own diff. Step 1 can run only once.
- Know whether your Tailwind build imports
  `@dooph-software/design-system/theme.css` (the preset). Utility renames below
  apply only if it does; without it, names like `max-w-md` are Tailwind's own.
- Paths below are relative to the installed package,
  `node_modules/@dooph-software/design-system/`. Call it `$DS`:
  `DS=node_modules/@dooph-software/design-system`.
- Run the codemod on the project root (`.`), in one call. It skips
  `node_modules`, build output (`dist`, `build`, `.next` …) and the agent
  skill folders (`.agents`, `.claude`, `.agent`), and it looks for your CSS
  entry and your own theme keys across everything it scans. You can also pass
  several folders in one call (`codemod.mjs app components lib`); never run it
  one folder at a time, because a folder without your CSS entry loses the
  preset and own-key checks.

## 1. Shift the spacing scale (once)

v6 renames the spacing scale to match the design files and adds steps. The same
names now mean smaller sizes:

| v5 name | px | v6 name for that size |
|---|---|---|
| `xxs` | 4 | `xxs` (same) |
| — | — | new `xxxs` = 2px, new `xs` = 6px |
| `xs` | 8 | `sm` |
| `sm` | 10 | `rg` |
| `rg` | 12 | `md` |
| `md` | 16 | `lg` |
| `lg` | 20 | `xl` |
| `xl` | 28 | `xxl` (26px, the nearest step) |
| `xxl` | 40 | `xxxl` (42px, the nearest step) |

Every `--ui-spacing-*` override, `var(--spacing-*)` read, `--spacing-*` key
your own `@theme` declares, and spacing utility (`p-md`, `gap-lg`, `-mt-xs`,
`max-w-md`, `size-rg` …) moves down a step. A key you declare moves with the
utilities that read it, so they keep your value. Nothing errors: `p-md` still
exists, it is just 12px now.

```bash
node $DS/skills/dooph-design-system-v6-migration/codemod.mjs . --spacing           # dry run
node $DS/skills/dooph-design-system-v6-migration/codemod.mjs . --spacing --write   # once
```

- **Exactly once, on v5 code, before anything else.** A second run shifts every
  name again (`p-lg` → `p-xl`). The codemod refuses (exit 3) when the code
  already uses `xxxs` or `xxxl`, which exist only in v6, but it cannot see every
  second run. Commit right after.
- It shifts utilities only when it finds the `theme.css` import in the paths it
  scans. If your CSS entry lives elsewhere, add `--preset`.
- It lists the `xl` / `xxl` sites, which land 2px off. Use `p-[28px]` there if
  the exact size matters.
- **`ds-px-ui-sm` keeps its name and drops from 10px to 8px.** The shift leaves
  it alone and lists it. Where it was v5 code, write `px-rg` (or
  `padding-inline: var(--ui-spacing-rg)`).
- It lists every v5 `<SegmentedTabSelect variant={SegmentedVariant.ghost}>`
  with no `size`. Add `size={SegmentedSize.standard}` to exactly those (step
  5). This is the only run that knows the code is v5, so note the list now.

## 2. Run the codemod

```bash
node $DS/skills/dooph-design-system-v6-migration/codemod.mjs .           # dry run
node $DS/skills/dooph-design-system-v6-migration/codemod.mjs . --write
```

`--write` applies the renames in steps 3–5 marked **auto**. It then prints
**NEEDS A HUMAN** (file:line for each removed or redesigned name, and for any
other v5 DS name still in the code, which keeps the exit code at 1 until fixed)
and **CHECK BY EYE** (call sites to look at, which never fail the run). Exit
codes: `1` work pending, `2` unreadable path, `0` no v5 DS name left outside
the theme keys you declare yourself (doc-comment lines are not checked). Read the CHECK BY EYE list: it holds the silent changes the codemod can
only point at (changed defaults, offsets and measurements). It matches names,
not imports: a same-named identifier from another package, or a theme key you
defined yourself in code it did not scan, is renamed too. Review the diff.

## 3. Token overrides (your CSS)

Since v6 the DS defaults sit in the cascade layer `ds.tokens`, so an unlayered
override always wins, whatever the import order (see the end of this step).

**Renamed (auto):**

| v5 token | v6 token | default value |
|---|---|---|
| `--ui-color-brand` (`-hover`, `-active`, `-foreground`, `-border`, `-border-hover`, `-border-active`, `-border-disabled`) | `--ui-color-prominent` (same suffixes) | grey-blue #4f666d → violet #340fd9; `-border-disabled` transparent → the secondary disabled border |
| `--ui-brand-color` | `--ui-prominent-color` | #46565c → #390ef8 |
| `--ui-brand-color-alt` | `--ui-prominent-color-ter` | #44c0e5 (same). `--ui-prominent-color-alt` is a new teal, not this one |
| `--ui-color-error-primary`, `--ui-color-error-secondary` | `--ui-color-danger-primary`, `--ui-color-danger-secondary` | same in light; dark now #e31515 / #e02e2e |
| `--ui-color-page-background` | `--ui-color-surface-page` | same |
| `--ui-color-border-focus` | `--ui-color-input-border-focus` | now the prominent hover border, in light and dark |
| `--ui-color-trigger-border-hover` | `--ui-color-input-border-hover` | same |
| `--ui-color-trigger-border-error-focus` | `--ui-color-input-border-danger-focus` | same |
| `--ui-color-focus-ring-brand`, `--ui-color-focus-ring-error` | `--ui-color-focus-ring-prominent`, `--ui-color-focus-ring-danger` | re-tinted to the new colours |
| `--ui-shadow-focus-brand` | `--ui-shadow-focus-prominent` | ring in the prominent colour |
| `--ui-radius-standard` | `--ui-radius-normal` | 18px (same) |
| `--ui-icon-tiny`, `-standard`, `-medium`, `-large` | `--ui-icon-sm`, `-rg`, `-md`, `-lg` | same, except `lg` 20px → 18px |
| `--ui-icon-stroke` | `--ui-icon-stroke-width` | 2 (same) |

An override keeps your value, so it renders as before. Where you only *read* one
of these (`var(--ui-color-brand)`), you get the new default.

**Removed, needs a human:**

| v5 token | v6 |
|---|---|
| 17 per-component motion tokens (below) | the shared `--ui-motion-*` scale |
| `--ui-size-cta-icon` (20px) | split: `--ui-size-cta-icon-standard` (22px) and `--ui-size-cta-icon-big` (26px). It sized both CTA icons, so copy an override to both if both should follow it |
| `--ui-height-tab-micro` (30px) | merged: micro tabs now use `--ui-height-button-micro` (28px), which micro icon buttons read too. An old tab override moved there resizes both |
| `--ui-min-w-menu-action` (144px) | none: menus keep a 160px floor and hug their items. Delete the line |
| `--ui-min-w-cta-pill-big` (370px) | none: the big CTA pill hugs its content. Delete, or set `min-width` on your own element |

Motion. Overriding a scale step retunes every component on that step, so do not
copy a per-component override onto it blindly. The durations sit on the DS's
inner elements and are not inherited, so a duration on a wrapper of yours
changes nothing. To retime one component alone, override its `ds-*` class in
your own unlayered CSS, scoped to a wrapper you own:
`.my-cta .ds-roll-hover-in, .my-cta .ds-roll-hover-out { transition-duration: 300ms; }`.
Check the result with reduced motion turned on as well.

| removed | scale step it now reads |
|---|---|
| `--ui-reveal-change-in-duration` | `--ui-motion-duration-slower` |
| `--ui-reveal-change-out-duration` | `--ui-motion-duration-slow` |
| `--ui-reveal-change-ease` | `--ui-motion-ease-enter` |
| `--ui-roll-change-in-duration` | `--ui-motion-duration-slow` |
| `--ui-roll-change-out-duration` | `--ui-motion-duration-base` |
| `--ui-roll-change-in-ease` | `--ui-motion-ease-enter` |
| `--ui-roll-change-out-ease` | `--ui-motion-ease-exit` |
| `--ui-roll-hover-duration` | `--ui-motion-duration-slower` |
| `--ui-rolling-digits-duration` | `--ui-motion-duration-base` |
| `--ui-rolling-digits-enter-duration` | `--ui-motion-duration-slow` |
| `--ui-rolling-digits-exit-duration` | `--ui-motion-duration-base` |
| `--ui-rolling-digits-ease` | `--ui-motion-ease-enter` |
| `--ui-sidebar-icon-duration` | `--ui-motion-duration-slow` |
| `--ui-sidebar-icon-hover-duration` | `--ui-motion-duration-base` |
| `--ui-sidebar-icon-ease` | `--ui-motion-ease-enter` |
| `--ui-underline-link-duration` | `--ui-motion-duration-slowest` |
| `--ui-underline-link-ease` | `--ui-motion-ease-enter` |

**`--ui-color-danger*` is back, with a new meaning.** v5 had no tokens by these
names; v6's `--ui-color-danger`, `-hover`, `-active`, `-disabled`,
`-foreground`, `-border*` are the danger button's colours (a secondary surface
with danger text). An override of these names left over from v4, dead in v5, now
applies again. Check each one, or delete it.

**Same name, new value (no rename, silent):**

- `--ui-height-button-micro` is 28px (was 26px): micro icon buttons grow 2px.

Colour retunes are under "Visual changes to expect" below: the ghost
foreground and the dark theme.

**Overrides now always win, which changes two things** (silent):

- A `:root { --ui-color-x: … }` override now beats the DS dark value on
  `<html class="dark">` whatever the load order. This changes the look only for
  an override that loaded **before** the DS stylesheet (or used a weaker
  selector such as `html`): v5's equally specific `.dark` rule, coming later,
  won over it. An override that loaded after the DS stylesheet already beat the
  dark value in v5, so leave it as it is: rescoping it changes your dark mode.
  Only for the first kind, if the value was meant for light only, scope it to
  `:root:not(.dark), .light` and restate the dark value under `.dark`.
  `dooph-design-system-theming` has the recipes.
- An override inside your own `@layer` takes part in layer order, and one in a
  layer declared before `ds` loses to the defaults. Keep token overrides
  unlayered.

You need no reduced-motion block of your own: the DS collapse still wins over
your motion overrides.

## 4. Utility classes and `ds-*` helpers (your markup and CSS)

**Theme keys (auto, only with the preset).** Utilities and `var(--color-*)`
reads follow the token renames. `*` is any colour prefix (`bg-`, `text-`,
`border-`, `ring-`, `outline-`, `fill-`, `stroke-` …), with or without variants:

| v5 | v6 |
|---|---|
| `bg-brand`, `bg-brand-hover`, `bg-brand-active`, `text-brand`, `border-brand` | `bg-prominent`, `bg-prominent-hover`, `bg-prominent-active`, `text-prominent`, `border-prominent` |
| `text-brand-fg` | `text-prominent-fg` |
| `border-brand-border` (`-hover`, `-active`, `-disabled`) | `border-prominent-border` (same suffixes) |
| `*-brand-color`, `*-brand-color-alt` | `*-prominent-color`, `*-prominent-color-ter` |
| `*-error-primary`, `*-error-secondary` | `*-danger-primary`, `*-danger-secondary` |
| `*-page-background` | `*-surface-page` |
| `*-border-focus` | `*-input-border-focus` |
| `*-trigger-border-hover`, `*-trigger-border-error-focus` | `*-input-border-hover`, `*-input-border-danger-focus` |
| `rounded-standard` (and `rounded-l-standard` …) | `rounded-normal` |
| `shadow-focus-brand`, `shadow-focus-error` | `shadow-focus-prominent`, `shadow-focus-danger` |

If your own theme declares one of these keys (`--color-brand: …` in your
`@theme`), `bg-brand` is yours: the codemod leaves every key you declare alone.
One edge: v5's precompiled `styles.css` shipped some of these classes itself
(`bg-brand`, `text-brand`, `border-brand`, `text-brand-fg` …) in the utilities
layer. Where its rule came after yours, your own key never painted that class
in v5; v6 ships none of them, so the same markup now paints your colour. Look
at the elements that use them.

**`h-tab-micro` (needs a human).** Removed. `h-button-micro` is the micro tab's
height now, 28px (was 30px).

**Spacing helpers (needs a human, after step 1).** These `ds-*` classes ship in
`styles.css` and need no Tailwind. A removed one simply stops styling. The
right-hand names are already v6 names, so apply this table only after the step 1
shift, or the shift moves them again:

| v5 class | v5 px | with the preset | without Tailwind |
|---|---|---|---|
| `ds-p-ui-xs` | 8 | `p-sm`, or the class `ds-p-ui-sm` | `padding: var(--ui-spacing-sm)` |
| `ds-px-ui-xs` | 8 | `px-sm`, or the class `ds-px-ui-sm` | `padding-inline: var(--ui-spacing-sm)` |
| `ds-px-ui-sm` | 10 | `px-rg` (the class still exists, now 8px) | `padding-inline: var(--ui-spacing-rg)` |
| `ds-py-ui-xs` | 8 | `py-sm` | `padding-block: var(--ui-spacing-sm)` |
| `ds-py-ui-rg` | 12 | `py-md` | `padding-block: var(--ui-spacing-md)` |
| `ds-pl-ui-md` | 16 | `pl-lg` | `padding-left: var(--ui-spacing-lg)` |
| `ds-pl-ui-rg` | 12 | `pl-md` | `padding-left: var(--ui-spacing-md)` |
| `ds-pr-ui-rg` | 12 | `pr-md` | `padding-right: var(--ui-spacing-md)` |
| `ds-pr-ui-sm` | 10 | `pr-rg` | `padding-right: var(--ui-spacing-rg)` |
| `ds-gap-ui-xs` | 8 | `gap-sm` | `gap: var(--ui-spacing-sm)` |
| `ds-my-ui-xs` | 8 | `my-sm` | `margin-block: var(--ui-spacing-sm)` |

`ds-py-ui-xxs` is unchanged.

**Other helpers:**

| v5 class | v6 | codemod |
|---|---|---|
| `ds-focus-ring-error-on-focus` | `ds-focus-ring-danger-on-focus` | auto |
| `ds-focus-ring` (ring always drawn) | no class draws it always now. To keep the look, write it in your own CSS: `outline: var(--ui-focus-ring-width) solid var(--ui-color-focus-ring-prominent); outline-offset: 0`. For a ring on focus only, `ds-focus-ring-on-focus` (`:focus`; an element that never takes focus never shows it), or `ds-focus-ring-on-open` for an open trigger | needs a human |
| `ds-disabled-control` (`:disabled`) | `ds-disabled-state` (also fades `[aria-disabled="true"]`) | needs a human |
| `ds-menu-w-standard`, `-action`, `-complex` | none: `DropdownMenuSection width` (step 5) | needs a human |
| `ds-size-cta-icon` | `ds-size-cta-icon-standard` or `ds-size-cta-icon-big` | needs a human |
| `ds-min-w-cta-pill-big` | none (the pill hugs) | needs a human |

**`cn()` now merges DS classes with their Tailwind counterparts.**
`cn("p-md", "p-lg")`, `cn("h-button", "h-8")` and `cn("text-body", "text-sm")`
keep only the later class, as for any Tailwind pair: the role font sizes
(`text-body`, `text-label` …) count as font sizes. Code that relied on both
surviving must put them on separate elements.

**`styles.css` holds only the utilities the components use.** If your markup
used a generic utility (`w-64`, `p-4`, `text-white`) without running your own
Tailwind, it may have come from v5's sheet by accident. Add it to your own build.

The typography theme keys (`--font-*`, `--text-*` in `theme.css`) and the
`text-style-*` classes are unchanged, so with the preset the typography
utilities still generate. Without your own Tailwind, the ones v5's sheet
carried (`font-title`, `font-label`, `text-heading`, `tracking-wide` …) no
longer ship. Either way, set text through a Text component (`BodyText`,
`ButtonText` … with `as`), with typography set only through its props (`font`,
`fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`); see
`dooph-design-system-usage`. Step 5 has the recipe change.

## 5. Component API (your TSX)

`npx tsc --noEmit` finds everything in this step except the items marked
**silent**.

**Renames (auto):**

| v5 | v6 |
|---|---|
| `TwoWayToggle`, `TwoWayToggleItem`, `TwoWayToggleProps`, `TwoWayToggleItemProps` | `ToggleSwitch`, `ToggleSwitchItem`, `ToggleSwitchProps`, `ToggleSwitchItemProps` (same props) |
| `ToastTypes` (const and type), `TooltipTypes` | `ToastVariant`, `TooltipVariant` |
| `FontAxes`, `ProgressIndicatorVariants` (consts) | `FontAxis`, `ProgressIndicatorVariant` (the types already had these names) |
| `ButtonVariant.brand`, `CheckboxVariant.brand`, `LoadingSpinnerColor.brand` | `.prominent` |
| `ToastTypes.brand`, `ToastTypes.error` | `ToastVariant.prominent`, `ToastVariant.danger` |
| `ButtonSize.default`, `TabSize.default`, `ToggleSize.default`, `TextDropdownSize.default` | `.standard` |
| `AvatarSize.small` | `AvatarSize.sm` |
| `IconSize.tiny`, `.standard`, `.medium` | `IconSize.sm`, `.rg`, `.md` (new: `.lg`, 18px) |
| `ToggleVariant.secondary` | `ToggleVariant.ghost` |
| `OutlineButton` `inverseTheme` | `themeInverse` |

The base-size rename is the `size` of `Button`, `TabsTrigger`,
`SegmentedTabItem`, `ToggleSwitch`, `TextDropdownTrigger` and `Avatar`, and of
icons.

The codemod renames the const forms. The string forms are compile errors, so
`tsc` finds them: `variant="brand"` → `"prominent"`, `size="default"` →
`"standard"`, `size="small"` → `"sm"`, Toast `variant: "brand"` / `"error"` →
`"prominent"` / `"danger"`, `ToggleSwitch` / `ToggleSwitchItem`
`variant="secondary"` → `"ghost"`. In untyped JS, search for them.

**Colour names on `color` props (silent).** `color` takes any CSS colour
string, so a v5 name compiles and paints nothing. The codemod renames them on
`color=` and `stepColor=`, in `resolveDsColor()` and in `DS_COLOR_TOKENS[…]`,
and lists other string literals under CHECK BY EYE:

| v5 | v6 |
|---|---|
| `brand` | `prominent` (now violet) |
| `brand-color` | `prominent-color` |
| `brand-color-alt` | `prominent-color-ter` |
| `error-primary`, `error-secondary` | `danger-primary`, `danger-secondary` |
| `page-background` | `surface-page` |

**Removed or redesigned (needs a human):**

- **`DropdownMenuCheckboxItem`** → `DropdownMenuMultiSelectItem`, same
  `checked` / `onCheckedChange` / `onSelect` / `disabled`, drawing the DS
  checkbox. To keep the menu open while ticking, set
  `selectType={DropdownMenuSelectType.multi}` on `DropdownMenu`. For a pick-one
  list use `DropdownMenuRadioSelectItem` in a `DropdownMenuRadioGroup`.
- **`DropdownMenuVariant` and the `variant` prop of `DropdownMenu` /
  `DropdownMenuContent`** are gone. Items hold a 160px floor and the panel hugs
  them. For a wider menu, wrap the items:
  `<DropdownMenuSection width="var(--ui-min-w-menu-complex)">` (324px), or a
  number of px.
- **`GemShape`, `Shapes.gem`** are gone; `DiamondShape` / `Shapes.diamond` is
  the closest. **`ShapeButtons`** is now `clover`, `cookie`, `diamond`, `puff`,
  `squircle`: `arrow`, `gem` and `star` are gone (`ArrowShape` and `StarShape`
  still exist, just not on `ShapeButton`).
- **`ShapeButton`'s default look changed (silent).** v5 painted the shape in the
  secondary button colours (grey) and the icon kept the inherited text colour.
  v6 adds `variant` (`ShapeButtonVariant`), which defaults to `prominent`: a
  violet shape with a prominent-foreground icon. `primary` is the only other
  look; there is no grey one. For the neutral look pass
  `variant={ShapeButtonVariant.primary}`, or re-check the design. The codemod
  lists every `<ShapeButton>` with no `variant`.
- **`SegmentedTabSelect`** splits `variant` (`primary` | `ghost`) from a new
  `size` (`SegmentedSize`: `container` | `standard` | `containerIcon` | `icon`).
  **Its default changed (silent):** with no props it was a 52px shell (38px
  items) with a ghost active tab, and is now `primary` + `container`, a 38px
  shell (28px items) with a filled active tab. v6 has no 52px shell, so no
  mapping renders exactly as v5 and the codemod writes none: it lists every
  `<SegmentedTabSelect>` with no `variant`, and the `--spacing` run lists the
  v5 `ghost` ones.

  The `size` column decides whether there is a shell: **with a shell, leave
  `size` out**; without one, `size={SegmentedSize.standard}`.

  | v5 `variant` | v5 shell | v6 props |
  |---|---|---|
  | none (default) | yes | `variant={SegmentedVariant.ghost}`, **no `size`** (keeps the shell and the ghost active tab) |
  | `secondary`, `secondarySmall` | yes | `variant={SegmentedVariant.ghost}`, **no `size`** |
  | `primary`, `primarySmall` | yes | `variant={SegmentedVariant.primary}`, or nothing |
  | `ghost` | no | `variant={SegmentedVariant.ghost} size={SegmentedSize.standard}` |
  | `ghostSmall` | no | as `ghost`, **plus `size={TabSize.sm}` on every `SegmentedTabItem`** |
  | `micro` | no | as `ghost`, **plus `size={TabSize.micro}` on every `SegmentedTabItem`** |

  `ghostSmall` and `micro` take two edits: the root props and a `size` on
  every item. Without the item `size` the items render at the standard size,
  taller than before.

- **Helper functions are no longer exported:** `formatTriggerLabel`,
  `formatSingleLabel`, `formatRangeLabel`, `isSameDay`, `startOfDay`,
  `serializeAxes`, `checkboxVariants`. Keep your own copy (render `Checkbox`
  instead of `checkboxVariants`):
  ```ts
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();
  const label = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(date);
  const serializeAxes = (axes: Record<string, number | string>) =>
    Object.entries(axes).map(([axis, v]) => `"${axis}" ${v}`).join(", ");
  ```

**Prop and type changes (`tsc` finds them):**

| Change | Fix |
|---|---|
| Value controls: `VerificationCodeInput` / `DatePicker` `onChange`; `Calendar` / `CalendarPresetItem` `selected`, `onSelect`; `DatePickerSplitTrigger` `onSelect` | `onValueChange`, and `value` for `selected`. Callback arguments are unchanged |
| `CopyButton` props are typed: `value: string` is required; `size`, `asChild`, `children` are errors | pass `value`; drop the others |
| `CopyButton` forwards an `HTMLButtonElement` ref | `useRef<HTMLButtonElement>(null)` |
| `CTAButton` takes `children` only with `asChild` (v5 silently dropped them) | label in `text`; or `<CTAButton asChild text="Start" icon={…}><Link href="/x" /></CTAButton>` |
| `CTAButton`'s ref is `HTMLElement` (was `HTMLAnchorElement`). A ref typed from the component (`useRef<ComponentRef<typeof CTAButton>>`) or an inline callback (`ref={(el) => el?.href}`) that reads `href` fails | `useRef<HTMLAnchorElement>(null)`, annotate the callback `(el: HTMLAnchorElement \| null) => …`, or narrow with `el instanceof HTMLAnchorElement` |
| `null` is no longer accepted on `Button` `variant` / `size`, `SheetContent` `side`, `Checkbox` `variant`, `TabsTrigger` / `SegmentedTabItem` `size` / `variant` | pass `undefined` or omit: `variant={cond ? ButtonVariant.primary : undefined}` |
| `ButtonProps` is a union: the pill sizes `medium` / `big` exist only on `prominent`, `primary`, `secondary` | `type X = ButtonProps & {…}` instead of `interface X extends ButtonProps`; see the snippet below for a whole-union `variant` |
| `InputProps`, `SliderProps`, `SliderLabeledProps` are unions | `type X = InputProps & {…}` |
| `Input` `min` / `max` are `number` | `min={0}`, not `min="0"` |
| `LinearProgressIndicator` `value` is `number` (no `null`) | `value={v ?? 0}` |
| `IconSize` (the type) is the four token values, not `string` | annotate free sizes as `IconProps["size"]` |
| `DEFAULT_CALENDAR_PRESETS`, `DEFAULT_SPLIT_TRIGGER_PRESETS` are `readonly` | copy before changing: `[...DEFAULT_CALENDAR_PRESETS, mine]` |
| `ShapeProps["size"]` is `number \| string` | `Number(p.size)` where you compute with it |
| Shape components are `DsShapeComponent`, a `FunctionComponent`: called as a function they return `ReactNode \| Promise<ReactNode>` | render them as JSX (`<StarShape size={24} />`), or type the result `ReturnType<typeof StarShape>` (typing it `ReactNode` does not compile) |

A `variant` typed as the whole `ButtonVariant` union together with a `size`
typed `ButtonSize`, or as a union of five or more sizes, no longer compiles,
even without the pill sizes. Smaller unions and literals such as `size="sm"`
still do. Branch on the variant:

```tsx
type PillVariant = Extract<ButtonVariant, "prominent" | "primary" | "secondary">;
const isPill = (v: ButtonVariant): v is PillVariant =>
  v === "prominent" || v === "primary" || v === "secondary";

isPill(variant)
  ? <Button variant={variant} size={size} />
  : <Button variant={variant} size={size as Exclude<ButtonSize, "medium" | "big">} />
```

**Silent behaviour changes:**

- **`buttonVariants()` and `tabTriggerVariants()` no longer set typography.**
  `<Link className={buttonVariants({ variant: "primary" })}>` loses the button
  text role. Use `<Button asChild variant="primary"><Link href="/x">Go</Link></Button>`,
  or `<ButtonText as={Link} className={buttonVariants({…})}>` (`HeroButtonText`
  for the `medium` and `big` sizes). The codemod lists every call.
- **`LoadingSpinner` is `role="progressbar"`** (was `role="status"`). Tests:
  `getByRole("progressbar")`. The codemod lists `*ByRole("status")` queries.
- **`RollHoverText` no longer sets `aria-label`.** Its words sit in a visually
  hidden copy. Tests: `getByText("Deploy now")`, not `getByLabelText`.
- **A `Slider` labelled with `aria-labelledby` takes that label as its name.**
  v5 sent `aria-labelledby` and `aria-describedby` to the root and named the
  `role="slider"` thumb "Value"; v6 puts both on the thumb. Tests:
  `getByRole("slider", { name: "Volume" })` (the referenced text), not
  `{ name: "Value" }`. "Value" is still the name of a slider with neither
  `aria-label` nor `aria-labelledby`. The codemod lists `*ByRole("slider")`
  queries.
- **An icon with `aria-label` or `aria-labelledby` is no longer hidden.** v5
  made every icon `aria-hidden` unless you passed `aria-hidden`; v6 exposes a
  labelled one, so its label is read and joins the name of a button or link
  around it. Drop the label from a decorative icon, or pass `aria-hidden`;
  re-check tests that find such a control by name. The codemod lists a
  labelled `<…Icon>` without `aria-hidden` when its tag sits on one line;
  search for `Icon` with `aria-label` to find the rest.
- **`ProgressIndicator` throws on `progress={NaN}`** (v5's range check let NaN
  through, so it rendered without an error).
  Guard the division: `progress={total > 0 ? done / total : 0}`.

## Layout changes (silent)

No name changed for these, so neither `tsc` nor a grep finds them. Search for
the component, and look at each place it is used.

- **Component spacing is in px, not rem.** Button, SplitButton, SearchBox,
  HotkeyIndicator, DropdownTrigger, Tooltip, Toast, Table, Tabs, Avatar,
  ShapeButton, CodeDigitInput, the menu label, TextDropdownTrigger, Checkbox,
  OutlineSection and LinearProgressIndicator read the px `--ui-*` tokens. No
  change at a 16px root font size, except the tab padding below; with another
  root size, re-check those layouts.
- **Tab and toggle options are narrower.** `TabsTrigger`, `SegmentedTabItem`
  and `ToggleSwitchItem` have 10px horizontal padding at every text size (v5:
  16px at standard, 12px at `sm`): 12px narrower at standard, 4px at `sm`.
  Re-check fixed-width tab rows and toggles.
- **`PopoverContent` sits 6px from its trigger** (v5: 4px), and so does the
  DatePicker panel. To keep the old gap: `sideOffset={4}`, or on DatePicker
  `contentProps={{ sideOffset: 4 }}`. The codemod lists `<PopoverContent>`
  without `sideOffset` and `<DatePicker>` without `contentProps`.
- **`CTAButton` is measured differently.** v5: a 20px icon in a round end
  chip, the standard label at least 40px from the chip, and a big pill with
  12px padding and a 370px minimum width. v6: a 22px (standard) or 26px (big)
  icon on a fixed end shape, a 60px standard gap, 16px padding on both pills,
  and the big pill hugs its content. Re-check layouts around a CTA, or set a
  `min-width` on your own wrapper. The codemod lists every `<CTAButton>`.
- **Dropdown triggers are wider.** `DropdownTrigger` and
  `TypeableDropdownTrigger` ended in a 14px chevron with 10px right padding;
  they now end in `DropdownCaret`, a square as tall as the trigger (38px at the
  default height) with no right padding. Re-check fixed-width layouts. The
  codemod lists both.

## Visual changes to expect

Not breaking, but re-check any custom look built on them:

- The prominent colour (the old "brand") is violet, with matching hover, active
  and focus-ring shades, unless you override it.
- Ghost text is the text colour: `--ui-color-ghost-foreground` is
  `var(--ui-color-text)` (was #4a4a4a light / #afafaf dark), so `ghost` and
  `text` Buttons (and CopyButton's ghost variant), TextLink, the default
  HotkeyIndicator, TextDropdownTrigger, and the Calendar weekday names and
  outside days are darker at rest. To keep the grey:
  `--ui-color-ghost-foreground: #4a4a4a` for light and `#afafaf` under `.dark`.
- Micro icon buttons are 28px; micro tabs are 28px, with a 10px corner radius
  (was 12px); large icons are 18px; the CTA icon is 22 / 26px (step 3).
- Motion moved to the nearest scale step: hover 100 → 150ms, menu and tooltip
  open 100 → 150ms, RollHoverText 500 → 420ms, and others close by.
- `PopoverContent` and the DatePicker panel use the menu panel look.
  `SearchBox` draws the DS `SearchIcon`. Dropdown triggers use a
  shape-morphing caret (`<html data-ds-expression="practical">` makes it a
  plain chevron).
- With the preset, a `shadow-standard` class, which generated nothing in v5,
  now draws a soft shadow (the new `--shadow-standard` key). Remove it where
  you do not want one.
- The dark theme follows the Figma dark mode: most dark surfaces, borders,
  text colours, focus rings and the danger colours changed (the CHANGELOG
  lists every value). A dark override you tuned against v5 needs a look.
  In light, primary and prominent button text is #f8f8f8 (was #ffffff) and
  the button shadows are rgb(56,56,56) rather than black.

## Package

The `exports` map (`.`, `./styles.css`, `./theme.css`), the entry points and the
peer dependencies are unchanged. The per-module `.js` / `.cjs` files (and their
source maps) under `dist/components/` and `dist/utils/` are gone; the `exports`
map never exposed them. If you imported a `dist/` path directly, import from
the package root.

## New in v6

Additive, no action: the AI chat parts, `Sticker`, `FancyToggleSwitch`,
`MorphRotationShape`, `ShapeMorphSpinner`, `DropdownCaret`, new shapes, the
`DropdownMenuRadioSelectItem` / `DropdownMenuMultiSelectItem` /
`DropdownMenuSubTrigger` / `DropdownMenuSubContent` menu parts, `SplitButtonGroup`, `Button` sizes `medium` and
`big`, `Input` variants, the motion scale tokens, the practical expression
preset, and `DS_TW_MERGE_CONFIG`. See `dooph-design-system-usage` and
`dooph-design-system-theming`.

Re-run `npx @dooph-software/design-system init-skills` after upgrading, so your
agent folders get the v6 skills.

## 6. Verify (the done-check)

1. The codemod exits 0: `node $DS/skills/dooph-design-system-v6-migration/codemod.mjs .`.
   Read its CHECK BY EYE list once.
2. `npx tsc --noEmit` passes.
3. No v5 name is left. **This is the codemod's exit code from item 1**: it runs
   the patterns below itself, in plain Node (no `rg` or PCRE needed), on every
   file it scans, and lists each hit under NEEDS A HUMAN, except the theme keys
   you declare yourself and doc-comment lines. Report this item from that exit
   code, never from a search you ran instead.

   Optional extra, the same patterns as a search (skips `node_modules`, build
   output and the agent skill folders; `-e` is needed because the patterns
   start with `-`):

   ```bash
   rg -nP --glob '!node_modules' --glob '!.next' --glob '!dist' --glob '!build' \
     --glob '!.claude' --glob '!.agents' --glob '!.agent' \
     -e '--ui-(color-brand|brand-color|color-error-|color-page-background|color-border-focus|color-trigger-border|color-focus-ring-(brand|error)|shadow-focus-brand|radius-standard|icon-(tiny|standard|medium|large)|icon-stroke(?![\w-])|height-tab-micro|size-cta-icon(?![\w-])|min-w-menu-action|min-w-cta-pill-big)' \
     -e '--ui-(reveal-change-(in-duration|out-duration|ease)|roll-change-(in|out)-(duration|ease)|roll-hover-duration|rolling-digits-(duration|enter-duration|exit-duration|ease)|sidebar-icon-(duration|hover-duration|ease)|underline-link-(duration|ease))(?![\w-])' \
     -e '(?<![\w-])-?(bg|text|border|ring|outline|fill|stroke|shadow|from|via|to)-(brand(-[\w-]+)?|error-(primary|secondary)|page-background|trigger-border[\w-]*|border-focus|focus-(brand|error))(?![\w-])' \
     -e '(?<![\w-])--(color|radius|shadow)-(brand[\w-]*|error-(primary|secondary)|page-background|trigger-border[\w-]*|border-focus|standard|focus-(brand|error))(?![\w-])' \
     -e '(?<![\w-])(rounded(-[trblse]{1,2})?-standard|h-tab-micro|ds-focus-ring|ds-focus-ring-error-on-focus|ds-disabled-control|ds-menu-w-\w+|ds-size-cta-icon|ds-min-w-cta-pill-big|ds-(p|px|py|my|gap)-ui-xs|ds-py-ui-rg|ds-p[lr]-ui-(md|rg|sm))(?![\w-])' \
     -e '(?<![\w$])(TwoWayToggle\w*|ToastTypes|TooltipTypes|FontAxes|ProgressIndicatorVariants|DropdownMenuCheckboxItem|DropdownMenuVariant|GemShape|inverseTheme)(?![\w$])' \
     -e '\b(ButtonVariant|CheckboxVariant|LoadingSpinnerColor)\.brand\b|\b(ButtonSize|TabSize|ToggleSize|TextDropdownSize)\.default\b|\bAvatarSize\.small\b|\bIconSize\.(tiny|standard|medium)\b|\bToggleVariant\.secondary\b|\bShapes\.gem\b|\bShapeButtons\.(arrow|gem|star)\b|\bSegmentedVariant\.(ghostSmall|micro|secondary|secondarySmall|primarySmall)\b' \
     -e '((color|stepColor)=\{?\s*|resolveDsColor\(\s*|DS_COLOR_TOKENS\[\s*)["'"'"'](brand|brand-color|brand-color-alt|error-primary|error-secondary|page-background)["'"'"']' \
     .
   ```

   A hit on a theme key your own CSS declares (step 4) is yours; leave it.
   Without `rg`, in a git repository: replace the first two lines with
   `git grep --untracked -nP \`, and the final `.` with
   `-- . ':!.claude' ':!.agents' ':!.agent'` (git skips ignored folders such as
   `node_modules` and `.next`). Older GNU `grep -P` takes only one pattern, so
   it is no substitute. Without either, grep for the plain names `--ui-color-brand`,
   `--ui-brand-color`, `--ui-color-error-`, `page-background`, `border-focus`,
   `trigger-border`, `focus-ring-brand`, `focus-ring-error`, `radius-standard`,
   `-brand`, `ds-focus-ring`, `ds-disabled-control`, `ds-menu-w-`, `-ui-xs`,
   `TwoWayToggle`, `ToastTypes`, `.default`, `.small` and the motion names above,
   and confirm by eye that each hit is a v6 name (`--ui-color-input-border-focus`,
   `ds-focus-ring-on-focus`, `ds-py-ui-xxs`, `--ui-roll-change-depth` …).
   These patterns use look-around (`(?<!`, `(?!`), which only a PCRE search
   runs (`rg -P`, `git grep -P`). A search tool without it may answer "no
   matches" without running them: if a search returns nothing for the third
   or fourth pattern although your own CSS declares a `--color-*` key that
   your markup uses, it did not run. Never report it as clean.
4. **Look at the app in a browser (required)** and compare it with the v5
   build. These failures are visual, so a clean build proves nothing about
   them. Your hand-back must reproduce this list item by item, each marked
   **seen** (and whether it matches v5) or **not seen** (and why); a shorter
   list, or "visual check required" with a few items, does not count. The
   codemod prints this list when it exits 0: paste it and fill in every line.

   - [ ] spacing on a page that used `xl` / `xxl` steps (they land 2px off;
         list the sites you left) or `ds-px-ui-sm`
   - [ ] one prominent (ex-brand) button
   - [ ] one ghost button and other ghost text (TextLink, TextDropdownTrigger)
   - [ ] every `ShapeButton`
   - [ ] every `SegmentedTabSelect`: shell or no shell as in v5, item height
   - [ ] every tab row and toggle (narrower padding)
   - [ ] a popover and the DatePicker panel (offset)
   - [ ] every `CTAButton`
   - [ ] every dropdown trigger (`DropdownTrigger`, `TypeableDropdownTrigger`)
   - [ ] anything that used `ds-focus-ring`
   - [ ] a dark-mode page with a colour override
   - [ ] anything styled with `buttonVariants()` or `tabTriggerVariants()`
   - [ ] any element with `shadow-standard`

   Never report the migration done while an item is **not seen** without
   saying so.

A codemod exit 0, a clean `tsc` and every visual item **seen** mean the
migration is done, and this skill no longer applies.
