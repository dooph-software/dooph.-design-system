# Changelog

All notable changes to `@dooph-software/design-system` will be documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

The next release is a major (v6). An item is under **Breaking** when code
written against 5.3.0 stops compiling, when a documented token or class stops
styling, when a default, a size, a position, a role or an accessible name
that 5.3.0 set changes without a compile error, or when a value 5.3.0
accepted now throws. Each item says what 5.3.0 had, what v6 has, and how
to fix the consumer code. Items marked **silent** raise no compile error:
find them by searching for the old name, or for the
token, component or test query the item names. **Changed** holds the rest:
retunes of colour, motion, glyphs and font weight, and changes to output that
was never a contract; re-check any custom look built on them.

To upgrade with an agent, run `npx @dooph-software/design-system init-skills`
after installing v6: it installs the `dooph-design-system-v6-migration` skill
that ships in the package.

### Breaking

#### Components

- **`TwoWayToggle` is now `ToggleSwitch`.** Before: `TwoWayToggle`,
  `TwoWayToggleItem`, `TwoWayToggleProps`, `TwoWayToggleItemProps`. After:
  `ToggleSwitch`, `ToggleSwitchItem`, `ToggleSwitchProps`,
  `ToggleSwitchItemProps`, with the same props. Fix: rename the four names.
- **`DropdownMenuCheckboxItem` is removed.** After: `DropdownMenuMultiSelectItem`
  takes the same Radix checkbox-item props (`checked`, `onCheckedChange`,
  `onSelect`, `disabled`) and draws the DS checkbox. Fix: rename it, and set
  `selectType` on the root if the menu should stay open while the user
  ticks items:
  ```tsx
  <DropdownMenu selectType={DropdownMenuSelectType.multi}>
    …<DropdownMenuMultiSelectItem checked={on} onCheckedChange={setOn}>Show grid</DropdownMenuMultiSelectItem>
  </DropdownMenu>
  ```
  For a pick-one list use `DropdownMenuRadioSelectItem` inside a
  `DropdownMenuRadioGroup`.
- **Menu width variants are removed.** Before: `DropdownMenuVariant`
  (`standard` 160px, `action` 144px, `complex` 324px) and a `variant` prop on
  `DropdownMenu` / `DropdownMenuContent`. After: items hold the 160px floor and
  the panel hugs them. Fix: drop `variant`; for a wider menu wrap the items in
  `DropdownMenuSection` and give it a width:
  `<DropdownMenuSection width="var(--ui-min-w-menu-complex)">` (324px), or any
  number of px. There is no 144px floor any more.
- **Shapes: `GemShape` is removed, and ShapeButton offers a different set.**
  Before: `GemShape`, `Shapes.gem`; `ShapeButtons` = `arrow`, `clover`,
  `cookie`, `gem`, `puff`, `star`. After: no gem shape; `ShapeButtons` =
  `clover`, `cookie`, `diamond`, `puff`, `squircle`. Fix: pick another shape
  (`DiamondShape` / `ShapeButtons.diamond` is the closest to the gem). The
  arrow and star shapes still exist as `ArrowShape` and `StarShape`; they are
  just not offered by `ShapeButton` `shape`.
- **`ShapeButton`'s default look changed (silent).** Before: the shape was
  painted in the secondary button colours (grey) and the icon kept the
  inherited text colour. After: a new `variant` (`ShapeButtonVariant`) defaults
  to `prominent` (a violet shape with a prominent-foreground icon); `primary`
  is the only other look, and there is no secondary look. Fix: pass
  `variant={ShapeButtonVariant.primary}` for the neutral look, or re-check the
  design.
- **`SegmentedTabSelect` splits variant and size, and its default changed
  (default: silent).** Before: one `variant` with seven values (`ghost`,
  `ghostSmall`, `micro`, `secondary`, `secondarySmall`, `primary`,
  `primarySmall`); with no prop it rendered `secondary` (a shell with a ghost
  active tab). After: `variant` is `primary` | `ghost`, and a new `size` is
  `container` | `standard` | `containerIcon` | `icon` (`SegmentedSize`). With
  no props it renders `primary` + `container`: a 38px shell of 28px items with
  a filled active tab. Fix:

  | 5.3.0 `variant` | v6 props |
  |---|---|
  | none (default) | `variant={SegmentedVariant.ghost}` to keep the ghost active tab (the shell is now 38px tall) |
  | `secondary`, `secondarySmall` | `variant={SegmentedVariant.ghost}` (size `container` is the default) |
  | `primary`, `primarySmall` | `variant={SegmentedVariant.primary}` or nothing |
  | `ghost` | `variant={SegmentedVariant.ghost} size={SegmentedSize.standard}` |
  | `ghostSmall` | as `ghost`, plus `size={TabSize.sm}` on each `SegmentedTabItem` |
  | `micro` | as `ghost`, plus `size={TabSize.micro}` on each `SegmentedTabItem` |

- **Value controls are named `value` / `onValueChange`.** Callback arguments
  are unchanged; each is a pure prop rename on that element:

  | Component | 5.3.0 | v6 |
  |---|---|---|
  | `VerificationCodeInput` | `onChange` | `onValueChange` |
  | `DatePicker` | `onChange` | `onValueChange` |
  | `Calendar` | `selected`, `onSelect` | `value`, `onValueChange` |
  | `DatePickerSplitTrigger` | `onSelect` | `onValueChange` |
  | `CalendarPresetItem` | `selected`, `onSelect` | `value`, `onValueChange` |

  The old names are compile errors, never silently attached DOM handlers.
- **`OutlineButton` `inverseTheme` is now `themeInverse`**, the name Tooltip
  and the AI model parts use. Fix: rename the prop.
- **`CopyButton` props are type-checked.** Before: every prop was `any`, so
  `<CopyButton />` compiled and copied the string "undefined". After: `value:
  string` is required, `variant` and `onCopied` are checked, and props it never
  supported (`size`, `asChild`, `children`, unknown attributes) are errors.
  Fix: pass `value`; drop `size`, `asChild` and `children`.
- **`CTAButton` takes `children` only with `asChild`.** Before:
  `<CTAButton text="Start" icon={…} href="/x">Start</CTAButton>` compiled and
  the children were silently dropped. After: a compile error. Fix: pass the
  label only as `text`; or use `asChild` with exactly one element child
  (`<CTAButton asChild text="Start" icon={…}><Link href="/x" /></CTAButton>`).
- **`LoadingSpinner` renders `role="progressbar"` (silent).** Before:
  `role="status"`, a live region. After: `role="progressbar"` with no
  `aria-valuenow`, like `ProgressIndicator`. Its `aria-label` default stays
  "Loading". Fix: tests that used `getByRole("status")` query
  `getByRole("progressbar")`.
- **`RollHoverText` no longer sets `aria-label` (silent).** Before: the root
  span carried `aria-label={children}`. After: the words sit in a visually
  hidden copy, so they are read in the flow of the sentence. Fix: tests that
  used `getByLabelText("Deploy now")` use `getByText("Deploy now")`.
- **`Slider`'s thumb takes its name from `aria-labelledby` (silent).** Before:
  `aria-labelledby` and `aria-describedby` went to the root, and the
  `role="slider"` thumb was named "Value" unless you passed `aria-label`.
  After: both land on the thumb, which takes the referenced name and
  description; "Value" is the name only when neither `aria-label` nor
  `aria-labelledby` is passed. Fix: tests that found a labelled-by-reference
  slider with `getByRole("slider", { name: "Value" })` query the referenced
  label text instead.
- **Icons with `aria-label` or `aria-labelledby` are exposed to screen
  readers (silent).** Before: every icon was `aria-hidden="true"` unless you
  passed `aria-hidden` yourself, so a label on it was never read and added
  nothing to the name of a button or link around it. After: a labelled icon
  is not hidden; its label is read, and inside a button or link it becomes
  part of that control's accessible name. Fix: remove the label from a
  decorative icon, or pass `aria-hidden` to keep it hidden; update tests that
  query such a control by its old name.
- **`ProgressIndicator` throws on `progress={NaN}` (silent).** Before: NaN passed the range
  check and rendered with no error. After: it throws the same error as a value outside 0–1. Fix: guard the
  division: `progress={total > 0 ? done / total : 0}`.

#### Props, consts and types

- **"brand" is "prominent", and "error" is "danger", in every option set.**

  | 5.3.0 | v6 |
  |---|---|
  | `ButtonVariant.brand`, `variant="brand"` | `ButtonVariant.prominent`, `variant="prominent"` |
  | `CheckboxVariant.brand` | `CheckboxVariant.prominent` |
  | `LoadingSpinnerColor.brand` | `LoadingSpinnerColor.prominent` |
  | Toast `variant` `"brand"` / `"error"` | `ToastVariant.prominent` / `ToastVariant.danger` |

- **Option consts are renamed.**

  | 5.3.0 | v6 |
  |---|---|
  | `ToastTypes` (const and type) | `ToastVariant` |
  | `TooltipTypes` (const and type) | `TooltipVariant` |
  | `FontAxes` (const) | `FontAxis` (the type already had this name) |
  | `ProgressIndicatorVariants` (const) | `ProgressIndicatorVariant` (the type already had this name) |
  | `ToggleVariant.secondary` / `"secondary"` | `ToggleVariant.ghost` / `"ghost"` |

  `ToastRoot` `variant` and `TooltipContent` `variant` (and `ToastRootProps`,
  `TooltipContentProps`) are typed by the new names.

- **The base size is called `standard` everywhere.**

  | 5.3.0 | v6 |
  |---|---|
  | `ButtonSize.default`, `size="default"` | `ButtonSize.standard`, `size="standard"` |
  | `TabSize.default` | `TabSize.standard` |
  | `ToggleSize.default` | `ToggleSize.standard` |
  | `TextDropdownSize.default` | `TextDropdownSize.standard` |
  | `AvatarSize.small`, `size="small"` | `AvatarSize.sm`, `size="sm"` |
  | `IconSize.tiny` / `.standard` / `.medium` | `IconSize.sm` / `.rg` / `.md` (new: `.lg`, 18px) |

  This is the `size` of `Button`, `TabsTrigger`, `SegmentedTabItem`,
  `ToggleSwitch`, `TextDropdownTrigger` and `Avatar`, and of icons. Fix:
  rename the key or the string literal. Search for `size="default"` and
  `size="small"` as well as the const keys.
- **Colour names passed to `color` props are renamed** (silent on `color`
  props, which also take any CSS colour string: an old name still compiles and
  paints nothing). `DS_COLOR_TOKENS`, `DsColor` and `DsColorToken` lose
  `brand`, `brand-color`, `brand-color-alt`, `error-primary`, `error-secondary`
  and `page-background`; indexing `DS_COLOR_TOKENS` with one is a compile
  error. Fix, on
  `LinearProgressIndicator`, `ProgressIndicator`, `LoadingSpinner`,
  `SliderContinuous`, `SliderStepped`, `SliderLabeled` and any `resolveDsColor`
  call:

  | 5.3.0 name | v6 name |
  |---|---|
  | `brand` | `prominent` (a different colour, see Tokens) |
  | `brand-color` | `prominent-color` (a different colour) |
  | `brand-color-alt` | `prominent-color-ter` (same #44c0e5) |
  | `error-primary` / `error-secondary` | `danger-primary` / `danger-secondary` |
  | `page-background` | `surface-page` |

  `danger` keeps its name and colour; it now reads `--ui-color-danger-primary`.
  New names: `prominent-color-alt` (a teal), plus `danger-primary`,
  `danger-secondary`, `prominent`, `prominent-color`, `prominent-color-ter` and
  `surface-page` above.
- **`null` is no longer accepted** on `Button` `variant` and `size`,
  `SheetContent` `side`, `Checkbox` `variant`, and `TabsTrigger` /
  `SegmentedTabItem` `size` and `variant` (and on the matching members of
  `ButtonProps`, `SheetContentProps`, `CheckboxProps`, `TabsTriggerProps`,
  `SegmentedTabItemProps`). `null` used to render an unstyled control. Fix:
  pass `undefined` or omit the prop: `variant={cond ? ButtonVariant.primary :
  undefined}`.
- **`Button` types `variant` × `size` as a union.** The pill sizes `medium`
  and `big` exist only on `prominent`, `primary` and `secondary`. Two forms
  that compiled in 5.3.0 stop compiling: (a) `interface X extends
  ButtonProps`; (b) a `variant` typed as the whole `ButtonVariant` union passed
  together with a `size` typed as `ButtonSize`, or as a union of five or more
  sizes, even without the pill sizes (smaller unions and literals such as
  `size="sm"` still compile). Fix:
  (a) `type X = ButtonProps & { … }`; (b) narrow the variant, or branch on it
  before passing a union size:
  ```tsx
  type PillVariant = Extract<ButtonVariant, "prominent" | "primary" | "secondary">;
  const isPill = (v: ButtonVariant): v is PillVariant =>
    v === "prominent" || v === "primary" || v === "secondary";
  isPill(variant)
    ? <Button variant={variant} size={size} />
    : <Button variant={variant} size={size as Exclude<ButtonSize, "medium" | "big">} />
  ```
- **`InputProps`, `SliderProps` and `SliderLabeledProps` are unions, not
  interfaces.** `interface X extends InputProps` (or `SliderProps`) no longer
  compiles. Fix: `type X = InputProps & { … }`.
- **`Input` `min` and `max` are `number`.** Before: `number | string` (the
  native attribute). Fix: `min={0}`, not `min="0"`.
- **`LinearProgressIndicator` `value` is `number` only.** Before: Radix's
  `number | null` (null drew nothing useful). Fix: pass a number, for example
  `value={v ?? 0}`.
- **`CopyButton` forwards an `HTMLButtonElement` ref** (was `HTMLElement`).
  `useRef<HTMLElement>` no longer assigns. Fix: `useRef<HTMLButtonElement>(null)`.
- **`CTAButton`'s ref is typed `HTMLElement`** (was `HTMLAnchorElement`),
  because with `asChild` the root can be any element. A
  `useRef<HTMLAnchorElement>` object ref and a callback ref declared with an
  anchor parameter still compile. Two forms stop compiling when they read an
  anchor-only field such as `href`: a ref typed from the component
  (`useRef<ComponentRef<typeof CTAButton>>`) and an inline callback ref
  (`ref={(el) => el?.href}`), where `el` is now `HTMLElement`. Fix: type the ref
  `useRef<HTMLAnchorElement>(null)`, annotate the callback
  (`(el: HTMLAnchorElement | null) => …`), or narrow with
  `el instanceof HTMLAnchorElement`.
- **`IconSize` (the type) is the four token values, not `string`.** Before:
  `const s: IconSize = "2rem"` compiled. After: the `size` prop still takes any
  CSS length or number, but the type `IconSize` is only `IconSize.sm` … `.lg`.
  Fix: annotate free values as `IconProps["size"]` or `string`.
- **`DEFAULT_CALENDAR_PRESETS` and `DEFAULT_SPLIT_TRIGGER_PRESETS` are
  `readonly CalendarPreset[]`.** Assigning one to a `CalendarPreset[]`, or
  calling `.push()` on it, no longer compiles. Fix: copy first:
  `const presets = [...DEFAULT_CALENDAR_PRESETS, myPreset]`. (`DatePicker`
  `splitPresets` and `DatePickerSplitTrigger` `presets` accept readonly arrays,
  so passing the defaults back in still compiles.)
- **`ShapeProps["size"]` is `number | string`.** Passing a size is unchanged;
  code that reads it as a number (`(p: ShapeProps) => p.size * 2`) no longer
  compiles. Fix: handle the string case, or `Number(p.size)`.
- **Shape components are typed `DsShapeComponent` (a `FunctionComponent`).**
  Calling one as a plain function and typing the result `JSX.Element` no longer
  compiles (it returns `ReactNode | Promise<ReactNode>`). Fix: render it as JSX
  (`<StarShape size={24} />`), or type the result
  `ReturnType<typeof StarShape>`.
- **Helper functions are no longer exported:** `formatTriggerLabel`,
  `formatSingleLabel`, `formatRangeLabel`, `isSameDay`, `startOfDay`,
  `serializeAxes`, `checkboxVariants`. They were internal. Fix: keep your own
  copy, for example
  ```ts
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();
  const label = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(date);
  const serializeAxes = (axes: Record<string, number | string>) =>
    Object.entries(axes).map(([axis, v]) => `"${axis}" ${v}`).join(", ");
  ```
  For `checkboxVariants`, render `Checkbox` itself.
- **`buttonVariants()` and `tabTriggerVariants()` no longer include
  typography** (silent). Text is always set by a Text component, so the recipes carry
  only box, colour and state classes. Before: `<Link className={buttonVariants({
  variant: "primary" })}>` got the button text role. After: no text role.
  Fix: `<Button asChild variant="primary"><Link href="/x">Go</Link></Button>`
  (no change needed), or `<ButtonText as={Link} className={buttonVariants({…})}>`
  (`HeroButtonText` for the `medium` and `big` sizes).

#### Tokens

Rename overrides in your own CSS. Values that changed are noted; re-check any
look you tuned around them.

- **Colour, focus, border and radius tokens are renamed (silent).**

  | 5.3.0 token | v6 token | value |
  |---|---|---|
  | `--ui-color-brand` | `--ui-color-prominent` | #4f666d grey-blue → #340fd9 violet |
  | `--ui-color-brand-hover` | `--ui-color-prominent-hover` | #45555b → #2406ac |
  | `--ui-color-brand-active` | `--ui-color-prominent-active` | #323d41 → #1a0189 |
  | `--ui-color-brand-foreground` | `--ui-color-prominent-foreground` | #ffffff → #f8f8f8 |
  | `--ui-color-brand-border` | `--ui-color-prominent-border` | alias of the fill (same rule) |
  | `--ui-color-brand-border-hover` | `--ui-color-prominent-border-hover` | alias (same rule) |
  | `--ui-color-brand-border-active` | `--ui-color-prominent-border-active` | alias (same rule) |
  | `--ui-color-brand-border-disabled` | `--ui-color-prominent-border-disabled` | transparent → the secondary disabled border |
  | `--ui-brand-color` | `--ui-prominent-color` | #46565c → #390ef8 |
  | `--ui-brand-color-alt` | `--ui-prominent-color-ter` | #44c0e5 (same). `--ui-prominent-color-alt` is a new teal, not this one |
  | `--ui-color-error-primary` | `--ui-color-danger-primary` | #ea3f3f (same); dark now #e31515 (5.3.0 had no dark value) |
  | `--ui-color-error-secondary` | `--ui-color-danger-secondary` | #ff5858 (same); dark now #e02e2e (5.3.0 had no dark value) |
  | `--ui-color-page-background` | `--ui-color-surface-page` | same in light; dark #131c1d → #000000 |
  | `--ui-color-border-focus` | `--ui-color-input-border-focus` | now the prominent hover border, in light and dark |
  | `--ui-color-trigger-border-hover` | `--ui-color-input-border-hover` | same in light; dark #3a3b3f → #333333 |
  | `--ui-color-trigger-border-error-focus` | `--ui-color-input-border-danger-focus` | same (danger primary) |
  | `--ui-color-focus-ring-brand` | `--ui-color-focus-ring-prominent` | rgba(70,86,92,.35) → rgba(36,6,172,.35); dark rgba(70,86,92,.15) → rgba(52,15,217,.45) |
  | `--ui-color-focus-ring-error` | `--ui-color-focus-ring-danger` | rgba(236,85,85,.35) → rgba(234,63,63,.35); dark rgba(236,85,85,.15) → rgba(227,21,21,.45) |
  | `--ui-shadow-focus-brand` | `--ui-shadow-focus-prominent` | 4px ring in the prominent colour |
  | `--ui-radius-standard` | `--ui-radius-normal` | 18px (same) |
  | `--ui-icon-tiny`, `--ui-icon-standard`, `--ui-icon-medium` | `--ui-icon-sm`, `--ui-icon-rg`, `--ui-icon-md` | 12 / 14 / 16px (same) |
  | `--ui-icon-large` | `--ui-icon-lg` | 20px → **18px** |
  | `--ui-icon-stroke` | `--ui-icon-stroke-width` | 2 (same) |
  | `--ui-height-tab-micro` | `--ui-height-button-micro` | 30px → 28px (micro tabs are 2px shorter) |
  | `--ui-size-cta-icon` | `--ui-size-cta-icon-standard` / `--ui-size-cta-icon-big` | 20px → 22px / 26px |

  Fix, as one pass over CSS and TS (longest names first, so `brand-color-alt`
  is not caught by `brand-color`):
  ```js
  const TOKENS = {
    "--ui-color-brand-border-disabled": "--ui-color-prominent-border-disabled",
    "--ui-color-brand-border-active": "--ui-color-prominent-border-active",
    "--ui-color-brand-border-hover": "--ui-color-prominent-border-hover",
    "--ui-color-brand-foreground": "--ui-color-prominent-foreground",
    "--ui-color-brand-border": "--ui-color-prominent-border",
    "--ui-color-brand-active": "--ui-color-prominent-active",
    "--ui-color-brand-hover": "--ui-color-prominent-hover",
    "--ui-color-brand": "--ui-color-prominent",
    "--ui-brand-color-alt": "--ui-prominent-color-ter",
    "--ui-brand-color": "--ui-prominent-color",
    "--ui-color-error-primary": "--ui-color-danger-primary",
    "--ui-color-error-secondary": "--ui-color-danger-secondary",
    "--ui-color-page-background": "--ui-color-surface-page",
    "--ui-color-border-focus": "--ui-color-input-border-focus",
    "--ui-color-trigger-border-hover": "--ui-color-input-border-hover",
    "--ui-color-trigger-border-error-focus": "--ui-color-input-border-danger-focus",
    "--ui-color-focus-ring-brand": "--ui-color-focus-ring-prominent",
    "--ui-color-focus-ring-error": "--ui-color-focus-ring-danger",
    "--ui-shadow-focus-brand": "--ui-shadow-focus-prominent",
    "--ui-radius-standard": "--ui-radius-normal",
    "--ui-icon-tiny": "--ui-icon-sm", "--ui-icon-standard": "--ui-icon-rg",
    "--ui-icon-medium": "--ui-icon-md", "--ui-icon-large": "--ui-icon-lg",
    "--ui-icon-stroke": "--ui-icon-stroke-width",
    "--ui-height-tab-micro": "--ui-height-button-micro",
    "--ui-size-cta-icon": "--ui-size-cta-icon-standard",
  };
  const names = Object.keys(TOKENS).sort((a, b) => b.length - a.length);
  const re = new RegExp(`(?<![\\w-])(${names.join("|")})(?![\\w-])`, "g");
  source = source.replace(re, (name) => TOKENS[name]);
  ```
  Two entries are not plain renames, so check what they carry over by hand.
  `--ui-height-tab-micro` (30px) merges into `--ui-height-button-micro` (28px),
  which micro icon buttons read too, so an old tab override now sizes them as
  well. `--ui-size-cta-icon` (20px) sized the icon of both CTA sizes; the map
  sends it to the standard token (22px), so copy an override to
  `--ui-size-cta-icon-big` (26px) as well if the big CTA should follow it.
- **The spacing scale is renamed to match Figma, with a new 6px step (silent).** The
  same names now mean smaller sizes, so every `--ui-spacing-*` override and
  every spacing utility (`p-md`, `gap-lg`, `max-w-md`, …) shifts down a step.

  | 5.3.0 | px | v6 name for that size |
  |---|---|---|
  | `xxs` | 4 | `xxs` (same) |
  | — | — | new `xs` = 6px, new `xxxs` = 2px |
  | `xs` | 8 | `sm` |
  | `sm` | 10 | `rg` |
  | `rg` | 12 | `md` |
  | `md` | 16 | `lg` |
  | `lg` | 20 | `xl` |
  | `xl` | 28 | `xxl` (now 26px) |
  | `xxl` | 40 | `xxxl` (now 42px) |

  Fix: apply the map in ONE pass. Applied step by step it chains (`xs`→`sm`,
  then that `sm`→`rg`). The utilities and `var(--spacing-*)` reads follow the
  DS scale only in an app whose Tailwind build imports the DS `theme.css`;
  elsewhere `max-w-md` and the like are Tailwind's own sizes and must not
  move, so set `DS_THEME` to `false` there. With `DS_THEME` on, a
  `--spacing-*` key your own CSS declares moves with the utilities and reads
  that use it (`--spacing-md: 20px` becomes `--spacing-lg: 20px` as `p-md`
  becomes `p-lg`), so they keep your value. For example:
  ```js
  const DS_THEME = true; // false when your Tailwind build does not import the DS theme.css
  const STEP = { xs: "sm", sm: "rg", rg: "md", md: "lg", lg: "xl", xl: "xxl", xxl: "xxxl" };
  const UTIL = "p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|inset|inset-x|inset-y|top|right|bottom|left|start|end|w|h|size|min-w|min-h|max-w|max-h|inline|min-inline|max-inline|basis|scroll-m|scroll-p|translate-x|translate-y";
  const themed = DS_THEME ? `|(?<![\\w-])--spacing-|(?<![\\w-])-?(?:${UTIL})-` : "";
  const re = new RegExp(`(--ui-spacing-${themed})(xxl|xl|lg|md|rg|sm|xs)(?![\\w-])`, "g");
  source = source.replace(re, (_, prefix, step) => prefix + STEP[step]);
  ```
  Run it BEFORE the `ds-*-ui-*` helper table below: that table already gives
  v6 names, which this map would shift a second time. The regex leaves
  `text-*` alone and does not touch the `ds-*-ui-*` names.
- **17 per-component motion tokens are removed (silent).** Motion now runs on one
  shared scale (see Added). Overriding a scale token retunes every component
  on that step; to change one component alone, target its `ds-*` class.

  | removed | use |
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

- **Tokens removed with no replacement (silent):** `--ui-min-w-menu-action` (144px; see
  the menu width item above) and `--ui-min-w-cta-pill-big` (370px; the big CTA
  pill now hugs its content). Fix: delete the override, or set a `min-width`
  on your own element.
- **`--ui-height-button-micro` is 28px (was 26px)** (silent). Micro icon
  buttons (`ButtonSize.iconMicro`) grow 2px, and micro tabs use this height
  too (30px → 28px). Fix: none needed; override the token to keep a size.
- **Token defaults sit in cascade layers, so your overrides always win**
  (silent). Before: the DS tokens were unlayered, so a consumer `:root { --ui-* }`
  override won only if it loaded after the DS stylesheet or had higher
  specificity. After: the defaults are in `@layer ds.tokens`, and any unlayered
  consumer override wins whatever its order or specificity. Two side effects:
  - A `:root { --ui-color-x: … }` override now also beats the DS `.dark`
    value, even when your CSS loads first. Fix: scope light-only colour
    overrides to `:root:not(.dark), .light` and restate the dark value under
    `.dark` if you need one. This changes the look only for an override that
    loaded before the DS stylesheet (or used a weaker selector such as
    `html`); one that loaded after it already applied in dark in 5.3.0, so
    leave it as it is.
  - A consumer override inside a cascade layer of its own takes part in layer
    order; a layer declared before `ds` loses to the DS defaults. Fix: keep
    token overrides unlayered.
  The reduced-motion collapse keeps winning over your motion overrides (it is
  `!important` inside the layer), so you need no reduced-motion block of your
  own.

#### CSS classes and utilities

- **Tailwind theme keys follow the token renames (silent).** Apps that compile Tailwind
  with the DS `theme.css` must rename the utilities:

  | 5.3.0 utility | v6 utility |
  |---|---|
  | `bg-brand`, `bg-brand-hover`, `bg-brand-active`, `text-brand`, `border-brand` | `bg-prominent`, `bg-prominent-hover`, `bg-prominent-active`, `text-prominent`, `border-prominent` |
  | `text-brand-fg` | `text-prominent-fg` |
  | `border-brand-border`, `border-brand-border-hover`, `border-brand-border-active`, `border-brand-border-disabled` | `border-prominent-border`, `border-prominent-border-hover`, `border-prominent-border-active`, `border-prominent-border-disabled` |
  | `*-brand-color` | `*-prominent-color` |
  | `*-brand-color-alt` | `*-prominent-color-ter` |
  | `*-error-primary`, `*-error-secondary` | `*-danger-primary`, `*-danger-secondary` |
  | `*-page-background` | `*-surface-page` |
  | `*-border-focus` | `*-input-border-focus` |
  | `*-trigger-border-hover` | `*-input-border-hover` |
  | `*-trigger-border-error-focus` | `*-input-border-danger-focus` |
  | `rounded-standard` (and `rounded-l-standard` …) | `rounded-normal` |
  | `shadow-focus-brand`, `shadow-focus-error` | `shadow-focus-prominent`, `shadow-focus-danger` |
  | `h-tab-micro` (30px) | `h-button-micro` (28px: a merge, not a rename; the micro tabs are 2px shorter) |

  `*` is any colour utility prefix (`bg-`, `text-`, `border-`, `ring-`,
  `outline-`, `fill-`, `stroke-`, …), with or without variants, and the
  matching `--color-*` / `--radius-*` / `--shadow-*` theme variables. A key
  your own CSS declares (an app-defined `--color-brand` in `@theme`, say) is
  yours, not the DS's: its utilities keep working and must not be renamed, so
  the fix drops those keys first. `appCss` is the text of all your own
  stylesheets. Fix, in one pass:
  ```js
  const KEYS = {
    "brand-border-disabled": "prominent-border-disabled", "brand-border-active": "prominent-border-active",
    "brand-border-hover": "prominent-border-hover", "brand-border": "prominent-border",
    "brand-color-alt": "prominent-color-ter", "brand-color": "prominent-color",
    "brand-hover": "prominent-hover", "brand-active": "prominent-active", "brand-fg": "prominent-fg",
    "brand": "prominent", "error-primary": "danger-primary", "error-secondary": "danger-secondary",
    "page-background": "surface-page", "trigger-border-error-focus": "input-border-danger-focus",
    "trigger-border-hover": "input-border-hover", "border-focus": "input-border-focus",
    "focus-brand": "focus-prominent", "focus-error": "focus-danger", "standard": "normal", "tab-micro": "button-micro",
  };
  for (const [, key] of appCss.matchAll(/--(?:color|radius|shadow)-([\w-]+)\s*:/g)) delete KEYS[key];
  const PREFIX = "--color|--radius|--shadow|bg|text|border(?:-[trblxyse])?|ring|ring-offset|outline|fill|stroke|divide|placeholder|caret|accent|decoration|from|via|to|shadow|rounded(?:-[trblse]{1,2})?|h";
  const keys = Object.keys(KEYS).sort((a, b) => b.length - a.length).join("|");
  const re = new RegExp(`(?<![\\w-])(-?(?:${PREFIX})-)(${keys})(?![\\w-])`, "g");
  source = source.replace(re, (whole, prefix, key) =>
    (key === "standard" && !/^(?:-?rounded|--radius)/.test(prefix)) || (key === "tab-micro" && prefix !== "h-") ||
    ((key === "focus-brand" || key === "focus-error") && prefix !== "shadow-" && prefix !== "--shadow-") ? whole : prefix + KEYS[key]);
  ```
- **The spacing helper classes changed (silent).** `ds-*-ui-*` classes ship in
  `styles.css`; a removed one simply stops styling. 5.3.0 had twelve. Use the
  theme utility if your app runs Tailwind with `theme.css`; otherwise write the
  property with the token in your own CSS. Apply this table AFTER the
  spacing rename above; its right-hand names are already v6 names:

  | 5.3.0 class | 5.3.0 value | v6 utility | without Tailwind |
  |---|---|---|---|
  | `ds-p-ui-xs` | 8px | `p-sm` (or the class `ds-p-ui-sm`) | `padding: var(--ui-spacing-sm)` |
  | `ds-px-ui-xs` | 8px | `px-sm` (or the class `ds-px-ui-sm`) | `padding-inline: var(--ui-spacing-sm)` |
  | `ds-px-ui-sm` | 10px | `px-rg` (the class `ds-px-ui-sm` still exists but is now 8px) | `padding-inline: var(--ui-spacing-rg)` |
  | `ds-py-ui-xxs` | 4px | unchanged | — |
  | `ds-py-ui-xs` | 8px | `py-sm` | `padding-block: var(--ui-spacing-sm)` |
  | `ds-py-ui-rg` | 12px | `py-md` | `padding-block: var(--ui-spacing-md)` |
  | `ds-pl-ui-md` | 16px | `pl-lg` | `padding-left: var(--ui-spacing-lg)` |
  | `ds-pl-ui-rg` | 12px | `pl-md` | `padding-left: var(--ui-spacing-md)` |
  | `ds-pr-ui-rg` | 12px | `pr-md` | `padding-right: var(--ui-spacing-md)` |
  | `ds-pr-ui-sm` | 10px | `pr-rg` | `padding-right: var(--ui-spacing-rg)` |
  | `ds-gap-ui-xs` | 8px | `gap-sm` | `gap: var(--ui-spacing-sm)` |
  | `ds-my-ui-xs` | 8px | `my-sm` | `margin-block: var(--ui-spacing-sm)` |

- **Other `ds-*` helper classes removed or renamed (silent):**

  | 5.3.0 class | v6 |
  |---|---|
  | `ds-focus-ring` | no class draws a ring always now. To keep the look, in your own CSS: `outline: var(--ui-focus-ring-width) solid var(--ui-color-focus-ring-prominent)`. For a ring on focus only, `ds-focus-ring-on-focus` (or `ds-focus-ring-on-open` for an open trigger) |
  | `ds-focus-ring-error-on-focus` | `ds-focus-ring-danger-on-focus` |
  | `ds-disabled-control` | `ds-disabled-state` (covers `:disabled` and `[aria-disabled="true"]`) |
  | `ds-menu-w-standard`, `ds-menu-w-action`, `ds-menu-w-complex` | none: `DropdownMenuSection width` (see Components) |
  | `ds-size-cta-icon` | `ds-size-cta-icon-standard` / `ds-size-cta-icon-big` |
  | `ds-min-w-cta-pill-big` | none (the pill hugs) |

- **`cn()` merges DS classes with their Tailwind counterparts (silent).** Before:
  `cn("rounded-tight", "rounded-full")`, `cn("p-md", "p-lg")`,
  `cn("h-button", "h-8")` and `cn("text-body", "text-sm")` kept both
  classes, and stylesheet order decided. After: the later class wins and the
  earlier one is dropped, as for any Tailwind pair. The role font sizes
  (`text-body`, `text-label` …) count as font sizes, so a later `text-sm`
  drops `text-body`. Fix: none for most apps; code that relied on both
  classes surviving must apply them on separate elements.

#### Layout

- **Component spacing is in px, not rem** (silent). Before: Button,
  SplitButton, SearchBox, HotkeyIndicator, DropdownTrigger, Tooltip, Toast,
  Table, Tabs, Avatar, ShapeButton, CodeDigitInput, the menu label,
  TextDropdownTrigger, Checkbox, OutlineSection and LinearProgressIndicator
  used Tailwind's rem steps (`p-4`, `gap-2`, `px-3`…), so they scaled
  with the root font size. After: they read the px `--ui-*` tokens like the
  rest of the package. Fix: none at a 16px root, except the tab and toggle
  padding in the next item; with another root size, re-check those layouts,
  or override the tokens.
- **Tab and toggle options are narrower** (silent). Before: `TabsTrigger`
  (and so `SegmentedTabItem`) and `ToggleSwitchItem` had 16px horizontal
  padding at the standard size (`px-4`) and 12px at `sm`. After: 10px at
  every text size (`px-rg`), so each option is 12px narrower at standard and
  4px narrower at `sm`, at any root font size. Micro tabs keep 10px. Fix:
  none; re-check fixed-width tab rows and toggles.
- **`PopoverContent` `sideOffset` defaults to 6 (was 4)** (silent). Popovers,
  and the DatePicker panel, sit 2px further from the trigger. Fix: pass
  `sideOffset={4}` (on DatePicker, `contentProps={{ sideOffset: 4 }}`) to keep
  the old gap.
- **`CTAButton` is measured differently** (silent). Before: a 20px icon in a
  round end chip; the standard label sat at least 40px from the chip; the big
  pill had 12px padding and was at least 370px wide. After: the icon is 22px
  (standard) or 26px (big) on a fixed end shape; the standard gap is 60px;
  both pills have 16px padding, and the big pill hugs its content. Fix: none;
  re-check layouts built around a CTA, or set a `min-width` on your own
  wrapper.
- **The dropdown triggers end in a caret square** (silent). Before:
  `DropdownTrigger` and `TypeableDropdownTrigger` ended in a 14px chevron
  with 10px right padding. After: they end in `DropdownCaret`, a square as tall
  as the trigger (38px at the default height), with no right padding, so each
  trigger is wider. Fix: none; re-check fixed-width layouts.

#### Package and build

- No supported import breaks. The `exports` map (`.`, `./styles.css`,
  `./theme.css`), the entry points and the peer dependencies are unchanged.
  The tarball no longer contains the per-module `.js` / `.cjs` files under
  `dist/components/**` and `dist/utils/**` or the CommonJS source maps; the
  `exports` map never exposed them. Fix: if you deep-imported a file under
  `dist/` by bypassing `exports`, import from the package root instead.

### Added

Every new component below also exports its `<Name>Props` type, except the
new menu items and submenu parts, the two toolbar halves (they share
`AIPromptInputToolbarProps`) and the shapes (`ShapeProps`).

- **Components**
  - AI chat parts: `AIPromptInput` with `AIPromptInputTextarea`,
    `AIPromptInputToolbar`, `AIPromptInputToolbarStart`,
    `AIPromptInputToolbarEnd` and `AIPromptInputSubmit` (send and stop; a
    consumer `onClick` runs first and `preventDefault()` cancels the stop);
    `AITextPart` (the assistant prose; `children` comes from whatever markdown
    renderer you use, and `streamingAnimation` makes blocks rise in);
    `AIThinkingPart` (`state` `thinking` | `thought`, rendered as `data-phase`
    on every row); `AIToolPart` (`state` `active` | `complete` | `error`,
    `variant` `simple` | `skill`); `AITurnSummary`; `UserMessageHeader`;
    `ChatDivider`; `AIContextGauge` (named "Context used" by default); the
    model picker parts `AIModelSelectTrigger`, `AIModelSelectItem` and
    `AIModelTooltipContent`; and `AIThinkingEffortSelector` (throws when
    `value` is not one of `steps`). Consts `AIThinkingPartState`,
    `AIToolPartState`, `AIToolPartVariant`; type `AIThinkingEffortStep`.
  - `Sticker`: a small label chip, `variant` `prominent` | `secondary` |
    `tertiary` | `alternate` | `danger` | `custom` (`custom` takes a `color`
    and throws without one), `size` `standard` | `micro` (`StickerVariant`,
    `StickerSize`).
  - `ToggleSwitch` and `ToggleSwitchItem` (the renamed `TwoWayToggle`), with
    per-item `size` and `variant`; a single selection can never be cleared.
  - `FancyToggleSwitch` and `FancyToggleSwitchItem`: a row of 54px
    prominent pill options with a leading indicator (a ring and check, or a
    filled circle around an item `icon`); single select, never cleared.
  - `MorphRotationShape`: DS shapes that spring-morph into one another while
    turning; `mode` `autoplay` | `controlled` | `embedded`
    (`MorphRotationShapeMode`), `restingAngle`, per-instance `timing`
    (`MorphRotationShapeAutoplayTiming`, `MorphRotationShapeStepTiming`,
    `CssTime`), `onStepComplete`. `shapes` takes shape components or `Shapes`
    keys; keys are the form a Server Component can pass. It forwards `ref`.
  - `ShapeMorphSpinner`: an M3 Expressive shape-morphing loader (22px by
    default, `role="progressbar"`); `SHAPE_MORPH_SPINNER_SHAPES` is its
    default shape list. It forwards `ref`.
  - `DropdownCaret`: the shape-morphing caret the dropdown triggers use;
    hover leans the shape and opening morphs it (`DropdownCaretVariant`
    `dropdown` | `typeable`).
  - Shapes `CapsuleShape`, `DiamondShape`, `DoubleShape`,
    `EightLeafCloverShape`, `PixircleShape`, `SquircleShape`, `TripleShape`,
    and new `Shapes` keys for them. Every shape exports its outline as
    `<NAME>_SHAPE_PATH` (`ARROW_SHAPE_PATH`, `CAPSULE_SHAPE_PATH`,
    `CLOVER_SHAPE_PATH`, `COOKIE_SHAPE_PATH`, `DIAMOND_SHAPE_PATH`,
    `DOUBLE_SHAPE_PATH`, `EIGHT_LEAF_CLOVER_SHAPE_PATH`, `PENTAGON_SHAPE_PATH`,
    `PIXIRCLE_SHAPE_PATH`, `PUFF_SHAPE_PATH`, `SQUIRCLE_SHAPE_PATH`,
    `STAR_SHAPE_PATH`, `TRIPLE_SHAPE_PATH`). Type `DsShapeComponent`: the type
    of the DS shape components; `shapes` props accept only these or `Shapes`
    keys, so a wrapped shape is a compile error instead of a render-time throw.
  - Menu parts: `DropdownMenuRadioSelectItem`, `DropdownMenuMultiSelectItem`,
    `DropdownMenuPlainItem`, `DropdownMenuSegment` (`DropdownMenuSegmentVariant`
    `divider` | `labeled`), `DropdownMenuSubTrigger` and
    `DropdownMenuSubContent` (a styled submenu; the sub panel takes `portal` /
    `portalProps`). `DropdownMenu` takes `selectType` (`DropdownMenuSelectType`
    `single` | `multi`; multi keeps the menu open). `DropdownMenuSection` takes
    `width` and forwards `ref`. Types `DropdownMenuProps`,
    `DropdownMenuContentProps`, `DropdownMenuItemProps`,
    `DropdownMenuSectionProps`.
  - `SplitButtonGroup`: the SplitButton chrome as a part, for a split button
    whose trigger opens a `DropdownMenu`.
  - Text roles `HeroBodyText`, `HeroButtonText` and `CTAText`, with
    `TextVariant.heroBody`, `.heroButton`, `.cta` (`BaseText` `variant`),
    `FontSizes.heroBody`, `FontSizes.heroButton` and `Tracking.mono`. The
    `fontSize` and `letterSpacing` props of every Text role (and of
    `ToastTitle`, `ToastDescription`, `TooltipTitle`, `TooltipBody`), and the
    types `FontSize`, `FontSizeValue`, `LetterSpacingValue` and
    `TrackingValue`, accept these values; the `.text-style-hero-body`,
    `.text-style-hero-button` and `.text-style-cta` classes.
  - `FadeChangeText`: like `RollChangeText`, with a fade.
- **Props**
  - `Button` sizes `ButtonSize.medium` (46px) and `ButtonSize.big` (54px):
    pill buttons with the 16px hero button label, on `prominent`, `primary` and
    `secondary` only (the types reject the others).
  - `Input` `variant` (`InputVariant` `text` | `number` | `iconText` |
    `iconNumber`; the icon variants require an `icon` element). Number
    variants fill their container (`autoWidth` makes them hug the value),
    accept only digits, one decimal separator and a leading minus, and take
    `format` (`true` or `Intl.NumberFormatOptions`, applied on blur) with
    `locale`, plus `min` / `max`, which drive the error state when `hasError`
    is omitted (`hasError` `true` / `false` always wins). Every variant takes
    `onValueChange(value)`.
  - `SliderContinuous`, `SliderStepped` and `SliderLabeled` take `variant`
    (`SliderVariant` `primary` | `prominent` | `custom`; `custom` requires
    `color`) and `stepColor`; `SliderStepped` and `SliderLabeled` take
    `highlightedStep` (one step drawn tall). Types `SliderProps`,
    `SliderLabeledProps` and the new `SliderSteppedProps` carry them.
  - `ShapeButton` `variant` (`ShapeButtonVariant` `primary` | `prominent`);
    its default changes the look, see Breaking > Components.
  - `HotkeyIndicator` `variant` (`HotkeyIndicatorVariant` `default` | `menu`,
    the chip used on menu rows); it sets `data-pressed` on its root when
    `pressed`, and forwards `ref`.
  - `TabSize.iconMicro`, `TabVariant.unselected`, `ToggleSize.icon`,
    `ToggleSize.iconMicro`, `ToggleVariant.unselected`,
    `LoadingSpinnerVariant.star` (`LoadingSpinner` `variant`, a turning
    star), `SegmentedSize` (`SegmentedTabSelect` `size`).
  - `TypeableDropdownTrigger` `displayValue`, and `data-select-type`, which it
    receives from `DropdownMenuTrigger`.
  - `DatePicker` `triggerProps` (onto the trigger button: `id` for a
    `<label htmlFor>`, `aria-*`, handlers, `className`), `contentProps` (onto
    the popover panel: `align`, `side`, `sideOffset`, …) and `defaultOpen`.
    `Calendar` forwards `ref` and passes `<div>` attributes to its root.
  - Overridable accessible names: `labels` (`previousMonth`, `nextMonth`) on
    `Calendar`, `DatePicker` and `CalendarCaption` (type `CalendarLabels`);
    `closeLabel` on `toast()` options (type `ToastOptions`, now exported);
    `digitLabel(index, length)` on `VerificationCodeInput`.
  - `ModalContent` and `SheetContent` take `portal` (default `true`) and
    `portalProps`, like the other overlay contents; types `ModalContentProps`
    and `SheetContentProps`.
  - `TableHeaderCell` `buttonProps`: props for the sort button (not
    `variant`, `size`, `onClick` or `children`).
  - `ref` on every icon, every shape, `SidebarWithHoverIcon`,
    `HotkeyIndicator`, `SplitButton` and `Calendar`. Icons and shapes accept
    any `<svg>` attribute and handler, shapes accept `className`, and
    `IconProps` / `ShapeProps` gain `ref` (and `className`, `aria-hidden` on
    shapes). `SplitButton` passes `id`, `aria-*`, `data-*` and handlers to its
    root.
  - `SplitButtonTrigger` declares `aria-label` (default "More options").
- **Tokens.** Each new colour, radius, shadow, spacing and text-size token
  here also gets its Tailwind theme key in `theme.css` (`bg-*` / `text-*` /
  `border-*`, `rounded-*`, `shadow-*`, `p-*` / `gap-*` …, `text-*`), except
  the focus-ring and slider-step colours and the button and CTA spacing
  tokens, which components read through other tokens and `ds-*` classes.
  - Motion scale: `--ui-motion-duration-fast` (150ms),
    `--ui-motion-duration-base` (200ms), `--ui-motion-duration-slow` (300ms),
    `--ui-motion-duration-slower` (420ms), `--ui-motion-duration-slowest`
    (600ms); `--ui-motion-ease-standard`, `--ui-motion-ease-enter`,
    `--ui-motion-ease-exit`, `--ui-motion-ease-linear`. Loop cycles:
    `--ui-shimmer-duration` (2000ms), `--ui-spinner-duration` (1400ms, one dash
    cycle of the flat spinner), `--ui-spinner-rotate-duration` (1400ms, one
    turn), `--ui-spinner-spokes-duration` (1800ms, spokes and star).
  - Shape morph: `--ui-shape-morph-duration`, `--ui-shape-morph-ease` (a
    generated spring), `--ui-shape-morph-interval`,
    `--ui-shape-morph-passive-spin-duration`, and `--ui-shape-morph-nudge`
    (the hover lean, as a fraction of a step; the `--ds-shape-morph-nudge`
    custom property feeds it per element).
  - Expression: `--ui-caret-shape-scale` and `--ui-caret-nudge`, and the
    preset `<html data-ds-expression="practical">`, which sets both to 0 (plain
    chevrons, no hover lean). Precedence: your tokens > the preset > the DS
    defaults.
  - The danger button family returns: `--ui-color-danger`,
    `--ui-color-danger-hover`, `--ui-color-danger-active`,
    `--ui-color-danger-disabled`, `--ui-color-danger-foreground`,
    `--ui-color-danger-foreground-active`, `--ui-color-danger-border`,
    `--ui-color-danger-border-hover`, `--ui-color-danger-border-active`,
    `--ui-color-danger-border-disabled`, with `--ui-color-danger-primary` and
    `--ui-color-danger-secondary` (`bg-danger`, `text-danger-fg` …). 5.0
    removed tokens with these names; the v6 ones are new aliases (a secondary
    surface with danger text), and the danger `Button` reads them. A v4 value
    carried over needs checking.
  - Prominent family: `--ui-color-prominent`, `--ui-color-prominent-hover`,
    `--ui-color-prominent-active`, `--ui-color-prominent-disabled`,
    `--ui-color-prominent-foreground`, `--ui-color-prominent-border`,
    `--ui-color-prominent-border-hover`, `--ui-color-prominent-border-active`,
    `--ui-color-prominent-border-disabled`; `--ui-prominent-color`,
    `--ui-prominent-color-alt` (a new teal, #13c29f), `--ui-prominent-color-ter`;
    `--ui-color-focus-ring-prominent`, `--ui-color-focus-ring-danger`,
    `--ui-shadow-focus-prominent`, `--ui-shadow-focus-danger`; input borders
    `--ui-color-input-border-hover`, `--ui-color-input-border-focus`,
    `--ui-color-input-border-danger-focus`; `--ui-color-surface-page`.
  - Press and focus: `--ui-shadow-press-prominent`, `--ui-shadow-press-primary`
    (`shadow-press-*`), `--ui-focus-ring-width` (4px) and
    `--ui-focus-ring-width-sm` (2px), `--ui-shadow-standard`.
  - Sizes: `--ui-height-button-medium` (46px), `--ui-height-button-big`
    (54px), `--ui-spacing-button-medium-x` (22px), `--ui-spacing-button-big-x`
    (32px), `--ui-height-menu-label`, `--ui-height-text-trigger`,
    `--ui-height-linear-progress`, `--ui-height-outline-button`,
    `--ui-min-w-outline-button`, `--ui-size-avatar`, `--ui-size-avatar-sm`,
    `--ui-size-checkbox-icon`, `--ui-size-shape-button`, `--ui-size-kbd`,
    `--ui-size-slider-step`, `--ui-height-slider-step-tall`,
    `--ui-text-code-digit`, `--ui-spacing-toast-inset`,
    `--ui-spacing-table-placeholder-y`, `--ui-radius-outline-frame`,
    `--ui-radius-mini` (10px), `--ui-spacing-xxxs` (2px), `--ui-spacing-xxxl`
    (42px), `--ui-icon-sm`, `--ui-icon-rg`, `--ui-icon-md`, `--ui-icon-lg`,
    `--ui-icon-stroke-width`, `--ui-radius-normal`.
  - CTA: `--ui-size-cta-icon-standard` (22px), `--ui-size-cta-icon-big`
    (26px), `--ui-size-cta-shape-standard`, `--ui-size-cta-shape-big`,
    `--ui-spacing-cta-content-standard` (60px), `--ui-weight-cta` (semibold).
  - Text: `--ui-text-hero-body`, `--ui-text-hero-button` (16px),
    `--ui-tracking-mono` (-0.03em).
  - OutlineButton glow: `--ui-outline-button-orb-1-*` and
    `--ui-outline-button-orb-2-*` (opacity, blur, hover blur, width, height,
    anchor).
  - Sticker: `--ui-color-sticker-*` (`prominent`, `secondary`, `tertiary`,
    `alternate`, `danger` and their `bg-` washes), `--ui-sticker-bg-opacity`,
    `--ui-sticker-bg-opacity-secondary`, `--ui-spacing-sticker-y`.
  - Slider: `--ui-color-slider-step-inactive`,
    `--ui-color-slider-step-primary-active`,
    `--ui-color-slider-step-prominent-active`,
    `--ui-slider-track-primary-active-opacity`,
    `--ui-slider-track-prominent-active-opacity`.
  - AI chat: `--ui-color-ai-anthropic`, `--ui-color-ai-gemini`,
    `--ui-color-ai-openai`, `--ui-color-ai-spacexai`, `--ui-chat-*` (prompt
    height, prose code radius, link offset, quote border, stream blur and rise,
    model swatch, tool and thinking shimmer), `--ui-width-chat-model-tooltip`.
  - Change text: `--ui-fade-change-depth`, `--ui-roll-change-breathe`.
- **Classes and utilities** in `styles.css`: the pill paddings
  `ds-px-button-medium` and `ds-px-button-big`; sizing utilities
  `h-button-medium`, `h-button-big`, `h-button-micro`, `size-avatar`, `size-avatar-sm`,
  `size-checkbox-icon`, `size-shape-button`, `h-menu-label`,
  `h-text-trigger`, `h-linear-progress`, `min-w-menu`, `min-h-button`,
  `min-w-button` (all merge with
  Tailwind classes through `cn`); the helpers `ds-focus-ring-sm`,
  `ds-focus-within-ring-danger`, `ds-focus-ring-danger-on-focus`,
  `ds-opacity-disabled`, `ds-radius-mini-outset-xxs`, `ds-p-ui-sm`,
  `ds-motion-state`, `ds-motion-overlay`, `ds-motion-overlay-dialog`,
  `ds-motion-overlay-sheet`, `ds-change-swap`, `ds-size-icon-rg`,
  `ds-min-size-kbd`, `ds-size-outline-button`, `ds-gap-cta-content-standard`,
  `ds-size-cta-icon-standard`, `ds-size-cta-icon-big`. The components' own
  helpers also ship: `ds-chat-*`, `ds-dropdown-caret*`, `ds-expr-caret-*`,
  `ds-fade-change-*`, `ds-outline-button-*`, `ds-outline-orb-*`,
  `ds-progress-ring*`, `ds-shape-morph*`, `ds-slider-*`, `ds-spinner-*`,
  `ds-width-chat-model-tooltip`.
- **`DS_TW_MERGE_CONFIG`**: the package's tailwind-merge config, for an app
  with its own merge helper:
  `extendTailwindMerge<"text-style">(DS_TW_MERGE_CONFIG)`.
- **`init-skills --yes`** (or `-y`) answers every prompt yes.
- **The `dooph-design-system-setup` skill** ships with the package (install,
  imports, fonts, the Tailwind preset, Server Components).

### Changed

- **Motion runs on one shared scale.** Every duration and curve comes from the
  `--ui-motion-*` tokens; retune all motion by overriding them. Overlays
  (menu, tooltip, popover, toast, modal, sheet) use the enter curve when they
  open and the exit curve when they close. Some timings moved to the nearest
  step: hover transitions 100 → 150ms, menu and tooltip open 100 → 150ms,
  CopyButton swap 120/160 → 150ms, Slider glide 180 → 200ms, reveal-change out
  320 → 300ms, rolling digits 240/260 → 200/300ms, SidebarWithHoverIcon
  260/180 → 300/200ms, RollHoverText 500 → 420ms. Hover transitions also ease
  opacity, shadow and transform, and no longer ease layout properties.
- **Reduced motion is one global rule:** every scale duration collapses to
  1ms and the staggers to 0. Loops stop or show a still frame: the flat
  spinner freezes at its longest arc, spokes and star stop turning.
- **`LoadingSpinner`** animates in CSS, with no JavaScript loop: the
  component renders once and writes only geometry, so its server-rendered
  markup needs no hydration to move. The flat variant follows Material's
  circular indeterminate pattern; its arc runs on two custom properties
  registered with CSS `@property`.
- **The prominent colour is violet** (#340fd9 in place of the 5.3.0 grey-blue
  brand colour), with its hover, active and focus-ring shades.
- **Button text and button shadows follow Figma in light:**
  `--ui-color-primary-foreground` is #f8f8f8 (was #ffffff), and
  `--ui-shadow-button`, `-button-secondary`, `-button-hover` and
  `-button-active` keep their alphas in rgb(56,56,56) (was black).
- **The dark theme follows the Figma dark mode.**
  Dark values that changed (renamed tokens under their v6 name; the focus
  rings and the danger colours are in the token table under Breaking >
  Tokens). Re-check any dark override you tuned against 5.3.0:

  | Token | 5.3.0 dark | v6 dark |
  |---|---|---|
  | `--ui-color-primary-foreground` | #000000 | #161616 |
  | `--ui-color-secondary` | #1d1d1f | #0f0f0f |
  | `--ui-color-secondary-foreground` | #ffffff | #f8f8f8 |
  | `--ui-color-secondary-hover` | #2b2b2d | #171717 |
  | `--ui-color-secondary-active` | #313235 | #161616 |
  | `--ui-color-secondary-disabled` | #222224 | #191919 |
  | `--ui-color-secondary-border` | #303235 | #222222 |
  | `--ui-color-secondary-border-hover` | #313235 | #2d2d2d |
  | `--ui-color-secondary-border-active` | #3a3b3f | #2b2b2b |
  | `--ui-color-secondary-border-disabled` | #1f1f21 | #1b1b1b |
  | `--ui-color-ghost-foreground-active` | #ffffff | #f8f8f8 |
  | `--ui-color-surface-primary` | #000000 | #0c0c0c |
  | `--ui-color-surface-secondary` | #242425 | #1b1b1b |
  | `--ui-color-modal-surface` | #212124 | #070707 |
  | `--ui-color-modal-backdrop` | rgba(0,0,0,.7) | rgba(0,0,0,.25) |
  | `--ui-color-border-primary` | #333437 | #363636 |
  | `--ui-color-border-secondary` | #3e3f42 | #3b3b3b |
  | `--ui-color-border-popovers` | #36363b | #212121 |
  | `--ui-color-text` | #ffffff | #f8f8f8 |
  | `--ui-color-focus-ring-primary` | rgba(23,23,23,.15) | rgba(249,249,249,.25) |
  | `--ui-shadow-menu`, `--ui-shadow-cta` | black at .7 / .65 | rgba(11,11,11,.85) |

  The other dark shadows keep their alphas and take Figma's rgb(11,11,11).
  Text tertiary (#717171), text secondary (#afafaf), the primary button
  paints and the ghost hover and active washes are unchanged.
- **Ghost text is the text colour:** `--ui-color-ghost-foreground` is
  `var(--ui-color-text)` (was #4a4a4a light / #afafaf dark), so everything
  painted with it is darker at rest: `ghost` and `text` Buttons (and
  CopyButton's ghost variant, which renders one), TextLink, the default
  HotkeyIndicator, TextDropdownTrigger, and the Calendar weekday names and
  outside days. To keep the old grey, set
  `--ui-color-ghost-foreground: #4a4a4a` (and #afafaf in `.dark`).
- **Change text:** `RollChangeText` travels a shorter distance
  (`--ui-roll-change-depth` 0.9em → 0.55em), its blur scales with the font
  (`--ui-roll-change-blur` 4px → 0.1em; a px override still works), and its
  edge fades out instead of being cut off.
- **`CTAButton`**: the round end chip is a fixed shape per size (an
  eight-leaf clover at standard, a puff at big), in the secondary or primary
  button colour, and the label is a semibold `CTAText`. Its new measurements
  are under Breaking > Layout.
- **`PopoverContent`** (and the DatePicker panel) use the floating-panel look
  of the menus: the popover border, the modal surface (dark #070707 in place
  of #000000) and the menu shadow. The new offset is under Breaking > Layout.
- **`SearchBox`** draws the DS `SearchIcon` (16px, stroke 2) in place of its
  own thinner glyph.
- **Micro tabs** (`TabSize.micro`, and the micro `SegmentedTabSelect` items)
  have a 10px corner radius (`--ui-radius-mini`), down from 12px
  (`--ui-radius-tight`). Their height change is under Breaking > Tokens.
- **`shadow-standard` paints.** The theme adds `--shadow-standard`
  (`--ui-shadow-standard`, a soft shadow with a 4px blur), so in an app that compiles
  Tailwind with `theme.css`, a `shadow-standard` class that generated nothing
  in 5.3.0 now draws that shadow. Remove the class where you do not want it.
- **CopyButton**'s icon swap zooms: the outgoing icon shrinks to 60% and fades
  out as the incoming one grows from 60% and fades in.
- **The dropdown triggers** (`DropdownTrigger`, `TypeableDropdownTrigger`)
  use `DropdownCaret` in place of the plain chevron (the new width is under
  Breaking > Layout). A disabled `DropdownTrigger` fades as one piece, chevron
  included.
- **Icons:** `IconProps` is a type alias (an intersection) rather than an
  interface; `interface X extends IconProps` still compiles. `color` sets CSS
  `color`, so parts filled with `currentColor` follow it (`strokeColor` still
  wins for the stroke). Labelled icons are no longer hidden from screen
  readers; see Breaking > Components.
- **Colour props** on `ProgressIndicator` and `LoadingSpinner` take any
  `DS_COLOR_TOKENS` name (`"text-secondary"`, `"danger"`, …) as well as a CSS
  colour. Before, names other than `primary` / `brand` drew nothing. The new
  `ShapeMorphSpinner` and `AIContextGauge` take them too, as
  `LinearProgressIndicator` already did.
- **`"use client"` only where a module needs it.** Button, Checkbox,
  ShapeButton, CodeDigitInput, Modal, Popover, Sheet, Tooltip, Tabs, SearchBox,
  SplitButton, LinearProgressIndicator, DatePickerTrigger, LoadingSpinner and
  RollChangeText render as server components (their Radix parts stay client),
  and `buttonVariants` / `tabTriggerVariants` can be called from server code.
- **Text is always set by a Text component.** Every component renders its text
  through `ButtonText`, `BodyText`, `LabelText` and the other roles (with
  `as`), so typography sits on one element.
- **Styling hooks:** `CalendarGrid` documents `data-range`, `data-today` and
  `data-outside` on its day cells, and `HotkeyIndicator` sets `data-pressed`,
  for consumer selectors such as `data-[range=middle]:…`.
- **`ShapeMorphSpinner`, `DropdownCaret` and `MorphRotationShape`** pass
  `Shapes` keys, so they render from a React Server Component.
- **`styles.css` holds only what the components use.** Utility classes that
  appeared only in this repository's docs, skills or Storybook stories are no
  longer compiled into it, and its theme layer keeps only `--font-sans`,
  `--spacing` and the `--default-*` variables: it drops the `--color-*`,
  `--font-*`, `--font-weight-*`, `--radius-*`, `--shadow-*`, `--text-*`,
  `--ease-*` and `--tracking-*` variables it carried in 5.3.0 (for example
  `--color-primary`, `--color-text`, `--radius-md`, `--shadow-lg`,
  `--text-sm`). The set of generated utilities and theme
  variables in the sheet follows the component markup, so it changes whenever
  a component's classes do; it is not a contract, which is why this item is
  not under Breaking. If your markup used a generic utility (`w-64`, `p-4`,
  `text-white` …) without running your own Tailwind, add it to your own build;
  read `--ui-*` tokens instead of the theme variables.
- **Fewer tarball files:** about a third fewer (no unreachable per-module
  files or CommonJS source maps), and the ESM source maps of stamped chunks
  line up with their code.
- **The consumer skills** (`dooph-design-system-usage`,
  `dooph-design-system-theming`) are rewritten for v6; the v3 and v5 migration
  skills were corrected against their own releases.

### Fixed

- `fillColor` applies to `PentagonShape` and `PuffShape` (they always painted
  the text colour).
- `ToastProvider` `duration` sets the auto-dismiss delay of every toast it
  renders; a per-toast 4000ms used to override it. The default stays 4000ms,
  and a per-toast `duration` still wins.
- Toasts closed by their timer, the close button, Escape or a swipe play their
  exit animation: the provider used to drop a closing toast from its list at
  once, and now keeps it until its exit animation ends. `dismiss()` no longer
  removes the toast on a fixed 200ms timer.
- `ToastDescription` inside a prominent `ToastRoot` uses the prominent
  foreground colour, so hand-composed prominent toasts are legible; `ToastRoot`
  renders `data-variant`.
- `ToastClose` keeps the toast's text colour on hover and press. Its
  `hover:text-current` used to lose on specificity to the ghost button's hover
  colour (#161616 in light), which was near invisible on the prominent toast.
- `Calendar` no longer crashes on an invalid `value` or an unknown `mode`: it
  warns in development and renders nothing. The DatePicker triggers show an
  empty label for an invalid value instead of throwing.
- `asChild` on `OutlineButton`, `ShapeButton`, `DropdownTrigger` and
  `TextDropdownTrigger` no longer throws "Slot failed to slot onto its
  children"; the child element becomes the interactive root and the
  decoration renders inside it.
- `OutlineButton` runs a consumer's `onMouseMove` / `onMouseLeave` alongside
  its glow tracking instead of losing the tracking.
- `cn` treats the role font-size utilities (`text-body`, `text-label` …, from
  `theme.css`) as font sizes: `text-body` and a text colour no longer erase
  each other, in either order. (That a later `text-sm` now drops `text-body` is under
  Breaking > CSS classes and utilities.)
- The flat `ProgressIndicator` animates one value that every dash is
  computed from, and keeps both arcs mounted. So when `progress` changes
  mid-animation its track no longer overlaps the indicator, slides back or
  vanishes, and an empty arc fades out instead of leaving a round-cap dot or
  reappearing without a transition.
- `ProgressIndicator` has a default accessible name, "Progress"; your
  `aria-label` replaces it and `aria-labelledby` drops it.
- `SplitButtonTrigger` has a default accessible name, "More options". The
  split parts share the secondary `Button`'s border, hover and press borders,
  and disabled / `aria-disabled` paint.
- `DatePickerSplitTrigger` merges `triggerProps.className` after its seam
  classes instead of replacing them, and `disabled` on `DatePickerSplitTrigger`
  or `SplitButton` can no longer be undone by a part's `disabled: false`.
- `Input`: `hasError` sets `aria-invalid` on the `<input>`; a disabled plain
  input no longer lifts on hover.
- `VerificationCodeInput`: focusing an empty cell past the first empty one
  moves focus to the first empty cell, so a typed digit lands where it shows.
- `Slider`: PageUp / PageDown and Shift+Arrow move 10 steps on stepped
  sliders; extra values in a multi-value array are kept, not dropped or
  moved. (Its thumb's accessible name is under Breaking > Components.)
- `Table`: a consumer `style` on `TableHeader` / `TableRow` merges instead of
  wiping the column grid; the parts carry table, row, columnheader and cell
  roles, and sortable headers set `aria-sort`; sortable header labels use the
  real `text-text` colour utility; plain header labels get the button text
  style too; the last `TableRow` draws no divider, so the bottom edge matches
  the other sides.
- `Checkbox`: a checked or indeterminate box keeps its fill while pressed; its
  focus ring is 2px.
- Focus rings: `TabsContent` and every `CodeDigitInput` cell (with a danger
  ring when errored) show one; `ShapeButton`'s ring is hidden when disabled.
- Disabled `CalendarPresetItem`, `SearchBox` and `CodeDigitInput` set
  `data-disabled`, so the DS disabled opacity and cursor apply (in 5.3.0 they
  set no `data-disabled`). An `aria-disabled` SplitButton part or
  `ShapeButton` no longer reacts to hover and press: their hover and press
  classes skip `[aria-disabled=true]`.
- `TypeableDropdownTrigger` no longer puts Radix's `type="button"` on its root
  `<div>`.
- A consumer `style` now wins over a component's own inline values in
  `LinearProgressIndicator` and `Slider` (`DropdownMenuSection`'s new
  `width`, the custom `Sticker` and the AI model parts behave the same way).
- A consumer padding class now replaces the padding of `SearchBox`,
  `DropdownTrigger`, `TypeableDropdownTrigger`, `Input`, `DropdownMenuContent`,
  `DropdownMenuSection`, `DropdownMenuSearch`, `OutlineButton` and
  `OutlineSection`, and a gap class replaces the dropdown triggers' gap,
  instead of competing on stylesheet order.
- Sizes and spacing of Button, SplitButton, SearchBox, HotkeyIndicator,
  DropdownTrigger, Tooltip, Toast, Table, Tabs, Avatar, ShapeButton,
  CodeDigitInput, the menu label, TextDropdownTrigger, Checkbox, OutlineSection
  and LinearProgressIndicator follow `--ui-*` overrides.
- `HeartFillIcon` fills the 24-unit icon grid (it rendered at about 58% size in
  the top-left corner).
- `ArrowShape`, `CloverShape` and `CookieShape` no longer emit a clipPath with a
  fixed `id`, so two on one page no longer duplicate ids.
- Nested `.dark` regions work: inside a `.dark` element on a light page, every
  alias token (danger button, tooltips, selection, shimmers, focus and press
  rings, slider steps, the secondary sticker…) takes its dark value. A
  consumer `:root` override of the checkbox size or radius, or the avatar
  radii, now reaches dark regions too.
- `Input` no longer detaches and re-attaches a callback `ref` on every
  keystroke.
- `RollHoverText` is read as part of the sentence by screen readers.
- Server components: every client module in `dist` carries `"use client"`,
  including those whose file opens with a header comment. In 5.3.0
  `VerificationCodeInput`, `DropdownMenuSearch`, `SidebarWithHoverIcon`,
  `RevealChangeText`, `RollChangeText` and `RollingDigitsText` shipped without
  it, so a React Server Component could not render them.
- `init-skills` with no terminal (piped or closed stdin) installs into all
  three directories instead of exiting 0 having copied nothing.
- The package ships `THIRD_PARTY_NOTICES.md`, with the shape-morph MIT notice
  and the Apache 2.0 licence of the vendored morph engine.

### Removed

Details and fixes are under Breaking.

- Components and exports: `TwoWayToggle`, `TwoWayToggleItem`,
  `TwoWayToggleProps`, `TwoWayToggleItemProps`, `DropdownMenuCheckboxItem`,
  `GemShape`, `DropdownMenuVariant`, `ToastTypes`,
  `TooltipTypes`, `FontAxes`, `ProgressIndicatorVariants`,
  `formatTriggerLabel`, `formatSingleLabel`, `formatRangeLabel`, `isSameDay`,
  `startOfDay`, `serializeAxes`, `checkboxVariants`.
- Props: `DropdownMenu` / `DropdownMenuContent` `variant`, `OutlineButton`
  `inverseTheme`, `VerificationCodeInput` / `DatePicker` `onChange`,
  `Calendar` / `CalendarPresetItem` `selected` and `onSelect`,
  `DatePickerSplitTrigger` `onSelect`.
- Const keys: `ButtonVariant.brand`, `CheckboxVariant.brand`,
  `LoadingSpinnerColor.brand`, the `default` size keys of `ButtonSize`,
  `TabSize`, `ToggleSize` and `TextDropdownSize`, `AvatarSize.small`,
  `IconSize.tiny` / `.standard` / `.medium`, `ToggleVariant.secondary`,
  `SegmentedVariant` `ghostSmall` / `micro` / `secondary` / `secondarySmall` /
  `primarySmall`, `Shapes.gem`, `ShapeButtons` `arrow` / `gem` / `star`, and
  the `DS_COLOR_TOKENS` names `brand`, `brand-color`, `brand-color-alt`,
  `error-primary`, `error-secondary`, `page-background`.
- Tokens: the `brand`, `error`, `page-background`, `border-focus`,
  `trigger-border`, `radius-standard` and old icon-size names (renamed); 17
  motion tokens; `--ui-min-w-menu-action`, `--ui-min-w-cta-pill-big`,
  `--ui-size-cta-icon`, `--ui-height-tab-micro`; the Tailwind theme keys built
  on the renamed tokens (`--color-brand*`, `--color-error-*`,
  `--color-page-background`, `--color-border-focus`, `--color-trigger-border-*`,
  `--radius-standard`, `--shadow-focus-brand`, `--shadow-focus-error`).
- Classes: `ds-focus-ring`, `ds-focus-ring-error-on-focus`,
  `ds-disabled-control`, `ds-menu-w-standard`, `ds-menu-w-action`,
  `ds-menu-w-complex`, `ds-size-cta-icon`, `ds-min-w-cta-pill-big`,
  `ds-my-ui-xs`, `ds-gap-ui-xs`, `ds-p-ui-xs`, `ds-px-ui-xs`, `ds-py-ui-xs`,
  `ds-py-ui-rg`, `ds-pl-ui-md`, `ds-pl-ui-rg`, `ds-pr-ui-rg`, `ds-pr-ui-sm`,
  `h-tab-micro`.

---

This file has no entries for 2.0.0 through 5.3.0. Short notes for most of
those versions are on the GitHub Releases page
(https://github.com/dooph-software/dooph.-design-system/releases); the full
changes are in the commit history between the tags `v2.0.0` … `v5.3.0`, and
the v3 and v5 majors are described by the `dooph-design-system-v3-migration`
and `dooph-design-system-v5-migration` skills.

---

## [1.1.0] — 2026-06-23

### Added
- **React Server Component (RSC) support is now built in.** Every interactive
  component ships a per-module `"use client"` directive that is preserved into
  `dist`, so a Next.js App Router **Server Component** can
  `import { Button } from "@dooph-software/design-system"` (and context-driven
  components like `Tooltip`/`DropdownMenu`) and `next build` succeeds with no
  `createContext is not a function` error. **Consumers no longer need a local
  `"use client"` re-export wrapper barrel.**

### Changed
- Build now emits one chunk per source module (tsup `splitting`, multi-entry)
  instead of a single inlined barrel, so client and server-safe modules stay
  separate and directives survive per module. `dist/index.js` remains the single
  public entry. Pure/server-safe modules (`cn`, type-only files, variant enums,
  icon/shape SVG components, `BaseText`) intentionally carry **no** directive and
  stay renderable in the RSC layer. ESM + CJS outputs, the exports map,
  `sideEffects`, types, and `styles.css`/`theme.css` emission are unchanged.
- Dot-accessible variant/size enums (`ButtonVariant`, `ButtonSize`, `TabVariant`,
  `TabSize`, `ToggleVariant`, `ToggleSize`, `SegmentedVariant`, `TextDropdownSize`,
  `ShapeButtons`, `CheckboxChecked`, `CheckboxVariant`, `ToastTypes`, `TooltipTypes`)
  moved out of their (now client) component files into sibling server-safe
  `constants.ts` modules, so a Server Component can read enum **values**
  (e.g. `ButtonVariant.primary`) without crossing a client boundary. Public import
  paths via the package barrel are unchanged; only internal deep imports were
  rewired.

---

## [1.0.0] — 2026-06-09

### Added
- Initial public release as `@dooph-software/design-system`.

---

<!-- Add new releases above this line in the format:

## [version] — YYYY-MM-DD
### Added / Changed / Deprecated / Removed / Fixed / Security
- Description of change.

-->
