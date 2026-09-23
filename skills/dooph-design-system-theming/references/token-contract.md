# dooph Token Contract

Override these in a consuming app's root theme CSS. Keep values deterministic and semantic.

Define light values on `:root` and optionally mirror them under `.light` (same selectors the package uses). Define dark values in `.dark`. The bundle does **not** switch themes from `prefers-color-scheme`; the consuming app (e.g. `next-themes` with `enableSystem`) attaches `.dark` when appropriate — including when the resolved theme tracks the OS — so forced light vs forced dark vs system all work.

If you remap tokens (radii, colors, typography), duplicate light overrides across `:root`/`.light` whenever your app paints an explicit `class="light"`, so branded values apply in forced-light mode too.

The package defines font-family tokens but does not load font files. Consumers must load Google Sans Flex, Host Grotesk, Bricolage Grotesque, and Google Sans Code, or approved substitutes, then map the loaded families/variables to `--ui-font-*`. Google Sans Flex should be loaded with `GRAD`, `ROND`, `opsz`, `slnt`, `wdth`, and `wght` available, and Google Sans Code with `MONO`, so the design-system axis tokens can render. Request every axis as a RANGE — pinned or omitted, the provider serves a file without the axis and the token silently does nothing.

**Subtree islands.** Any ancestor with **`class="light"`** or **`class="dark"`** re-establishes the corresponding **`--ui-*`** palette for itself and descendants (inheritance). Use that to force a light region under **`<html class="dark">`** (or the reverse). **Portals** rendered outside that subtree won’t inherit — add **`light`** / **`dark`** on the surfaced content or portal container.

## Core Colors

- `--ui-color-primary`, `--ui-color-primary-foreground`, `--ui-color-primary-hover`, `--ui-color-primary-active`, `--ui-color-primary-disabled`
- `--ui-color-secondary`, `--ui-color-secondary-foreground`, `--ui-color-secondary-hover`, `--ui-color-secondary-active`, `--ui-color-secondary-disabled`
- `--ui-color-prominent`, `--ui-color-prominent-foreground`, `--ui-color-prominent-hover`, `--ui-color-prominent-active`, `--ui-color-prominent-disabled` (renamed from `--ui-color-brand*` in 5.4, alongside `ButtonVariant.brand` → `.prominent`)
- `--ui-color-danger-primary`, `--ui-color-danger-secondary` — the two RAW destructive paints (Figma `danger-primary`/`danger-secondary`). Mode-invariant: no `.dark` overrides.
- `--ui-color-danger`, `--ui-color-danger-foreground`, `--ui-color-danger-foreground-active`, `--ui-color-danger-hover`, `--ui-color-danger-active`, `--ui-color-danger-disabled` — the danger BUTTON state family (Figma `ButtonDanger/*`), backing `ButtonVariant.danger`. Every one defaults to an alias (bg/disabled → the secondary family, hover → `danger-secondary`, active/foreground → `danger-primary`), which is also why they need no `.dark` block — the tokens they alias are already per-mode. Override one to retune the danger button alone; override `--ui-color-danger-primary`/`-secondary` to move every danger-tinted surface at once. Spelled `error` before 5.4 (`--ui-color-error*`); that spelling is gone.
- `--ui-color-ghost-foreground`, `--ui-color-ghost-hover`, `--ui-color-ghost-active`, `--ui-color-ghost-foreground-active` (ghost/text buttons have no rest bg — hover/active are translucent overlays)
- `--ui-color-surface-primary`, `--ui-color-surface-secondary`, `--ui-color-surface-page` (Figma `surface-page`/`surface-primary`/`surface-secondary`; `--ui-color-page-background` was renamed to `--ui-color-surface-page` in 5.4, and `bg-page-background` to `bg-surface-page`)
- `--ui-color-text`, `--ui-color-text-secondary`, `--ui-color-text-tertiary`
- `--ui-color-focus-ring-prominent`, `--ui-color-focus-ring-primary`, `--ui-color-focus-ring-danger` (Figma `Inputs/focus-ring-prominent|-primary|-danger`; the `-brand`/`-error` spellings were renamed in 5.4)

## Button Borders

Every button variant carries its own border tokens for default/hover/active (plus disabled where Figma defines one), independently overridable from the background — e.g. give prominent buttons a contrasting outline without touching `--ui-color-prominent`.

- Primary (defaults alias the matching bg tokens): `--ui-color-primary-border`, `--ui-color-primary-border-hover`, `--ui-color-primary-border-active`, `--ui-color-primary-border-disabled`
- Secondary (distinct literals — the visible outline on light buttons): `--ui-color-secondary-border`, `--ui-color-secondary-border-hover`, `--ui-color-secondary-border-active`, `--ui-color-secondary-border-disabled`
- Prominent (defaults alias the matching bg tokens; disabled aliases secondary): `--ui-color-prominent-border`, `--ui-color-prominent-border-hover`, `--ui-color-prominent-border-active`, `--ui-color-prominent-border-disabled`
- Danger (defaults alias secondary for rest/disabled and the raw danger paints for hover/active): `--ui-color-danger-border`, `--ui-color-danger-border-hover`, `--ui-color-danger-border-active`, `--ui-color-danger-border-disabled`

Ghost and text buttons have no border tokens (transparent borders).

## General Borders

- `--ui-color-border-primary` — Figma `borderPrimary`: general control/container border (inputs, triggers, tables, cards). v3 splits the old single `--ui-color-border` into `-primary`/`-secondary`.
- `--ui-color-border-secondary` — Figma `borderSecondary`: a second general-purpose border tone (e.g. `Avatar`'s shell border) distinct from `-primary`.
- `--ui-color-border-popovers` — floating panel border shared by menus, modals, and toasts. The DS name is kept even though the Figma source calls the equivalent `borderModal` (deliberate naming choice — this token is shared across more than modals).
- `--ui-color-input-border-focus` — focus border for typeable triggers/inputs/controls; defaults to `var(--ui-color-prominent-border-hover)` in light and `var(--ui-color-prominent-border-active)` in dark, so it follows prominent. Renamed from `--ui-color-border-focus` in 5.4 (Figma `dropdown/input-border-focus`)
- `--ui-color-input-border-hover` — hover border for typeable triggers, inputs, and search boxes. Renamed from `--ui-color-trigger-border-hover` in 5.4
- `--ui-color-input-border-danger-focus` — focus border for typeable triggers/inputs in an error state; defaults to `var(--ui-color-danger-primary)`. Renamed from `--ui-color-trigger-border-error-focus` in 5.4

## Modals

Used by `ModalContent` and `ModalOverlay`. Override to match the app surface treatment.

- `--ui-color-modal-surface` — background of the modal panel
- `--ui-color-modal-backdrop` — fullscreen overlay behind the modal (accepts any color or `rgba`)

The modal panel border uses the shared `--ui-color-border-popovers` (see General Borders).

## Prominent Identity

Figma `color-prominent`/`color-prominent-alt` — the two-color brand identity pair, distinct from the `--ui-color-prominent` *button* tokens above. Renamed from `--ui-brand-color`/`--ui-brand-color-alt` in 5.4. Unlike the button family (which is fully mode-invariant), the alt DOES change between light and dark.

- `--ui-prominent-color` — primary brand identity color (e.g. `Avatar` content tint via `text-prominent-color`)
- `--ui-prominent-color-alt` — secondary/alt brand identity color; also the default for `OutlineButton`'s hover color-blur orbs. Mode-invariant as of 5.4: it used to carry `#44c0e5` in dark, and that value is now `--ui-prominent-color-ter` in its own right
- `--ui-prominent-color-ter` — third brand identity color (new in 5.4)

`OutlineButton`'s `glowColor1` and `glowColor2` props both default to `var(--ui-prominent-color-alt)` when omitted — override the token globally, or pass the props per instance. Use `glowing` to make the glow always visible (not hover-gated), and `inverseTheme` to swap the inner surface to primary tokens when the button sits on a dark or primary-colored background.

## Typography

There are **eight** text roles: `body`, `button`, `heading`, `subheading`, `label`, `title`, `hero`, `mono`.

- `--ui-font-body`, `--ui-font-button`, `--ui-font-heading`, `--ui-font-label`, `--ui-font-title`, `--ui-font-hero`, `--ui-font-mono` — one family stack per text role, each independently overridable (defaults: body/button/heading → Google Sans Flex, label → Host Grotesk, title/hero → Bricolage Grotesque, mono → Google Sans Code). `subheading` shares the heading family.
- `--ui-text-label`, `--ui-text-body`, `--ui-text-mono`, `--ui-text-subheading`, `--ui-text-heading`, `--ui-text-title`, `--ui-text-hero`
- `--ui-weight-body`, `--ui-weight-button`, `--ui-weight-label`, `--ui-weight-subheading`, `--ui-weight-heading`, `--ui-weight-title`, `--ui-weight-hero`, `--ui-weight-mono`
- `--ui-weight-regular`, `--ui-weight-medium`, `--ui-weight-semibold`, `--ui-weight-bold` — the standard scale behind `FontWeights.*`
- `--ui-font-var-button`, `--ui-font-var-body`, `--ui-font-var-heading`, `--ui-font-var-mono`
- `--ui-tracking-body`, `--ui-tracking-label`, `--ui-tracking-hero`

`--ui-text-mono` and `--ui-weight-mono` alias `--ui-text-body` and `--ui-weight-button` by default, so mono sits at the same optical scale as a button label; override either directly to break that link.

`--ui-font-var-*` tokens apply to the two faces that carry axes: Google Sans Flex (button/body/heading/subheading) and Google Sans Code (`--ui-font-var-mono: "MONO" 1`). Label, title and hero ship no axis token because their faces implement none. A Text component's `axes` prop appends to the role's token, so a named axis overrides while the rest survive.

**`MONO` is not optional decoration.** Google Sans Code has a proportional cut at MONO 0, so the token is what actually makes the mono role monospaced.

**There is no line-height token and no role sets one.** Leading inherits, so the consuming app owns it (a base rule) or a call site does (the `lineHeight` prop).

## Sizing And Shape

- `--ui-height-button`, `--ui-height-button-sm`, `--ui-height-button-micro` (v3 — backs `ButtonSize.iconMicro` / `size-button-micro`)
- `--ui-spacing-xxxs`, `--ui-spacing-xxs`, `--ui-spacing-xs`, `--ui-spacing-sm`, `--ui-spacing-rg`, `--ui-spacing-md`, `--ui-spacing-lg`, `--ui-spacing-xl`, `--ui-spacing-xxl`
- `--ui-icon-sm` (12), `--ui-icon-rg` (14), `--ui-icon-md` (16), `--ui-icon-lg` (18), `--ui-icon-stroke-width` (1.5) — back `IconSize.sm/rg/md/lg`. Renamed in 5.4 from `--ui-icon-tiny`/`-standard`/`-medium`/`-stroke`; `--ui-icon-large` (20) is gone, replaced by the 18px `-lg`.
- `--ui-radius-tight`, `--ui-radius-normal` (renamed from `--ui-radius-standard` in 5.4; utility `rounded-standard` → `rounded-normal`), `--ui-radius-soft`, `--ui-radius-slider-inner` (v3 — inner corner radius on the `Slider*` track pills and thumb)
- `--ui-shadow-button`, `--ui-shadow-button-secondary`, `--ui-shadow-button-hover`, `--ui-shadow-button-active`, `--ui-shadow-menu`, `--ui-shadow-focus-prominent`, `--ui-shadow-focus-primary`
- `--ui-opacity-disabled`

## Slider Sizing (v3)

Geometry-only tokens for `SliderContinuous`/`SliderStepped`/`SliderLabeled` — the fill color comes from the component's `color` prop (token name or CSS color, default `primary`), not from these:

- `--ui-slider-track-primary-active-opacity` / `--ui-slider-track-prominent-active-opacity` — the alpha the active track is tinted at, per `SliderVariant`. An OPACITY rather than a colour so the component's `color` prop still supplies the hue; Figma's resolved rgba() would have frozen it
- `--ui-color-slider-step-primary-active` / `--ui-color-slider-step-prominent-active` — the active step dot, per `SliderVariant`. A real colour, because it is composed from the CONTENT paint rather than the track's hue
- `--ui-color-slider-step-inactive` — the unfilled step dot, shared by both variants (defaults to `--ui-color-border-secondary`)
- `--ui-height-slider-track` — track height (Tailwind: `h-slider-track`)
- `--ui-radius-slider-inner` — inner-edge radius where the active/inactive pills meet the thumb
- `--ui-slider-track-gap` — gap the active/inactive fill pills each stop short of the thumb edge
- `--ui-width-slider-handle`, `--ui-height-slider-handle` — thumb dimensions
- `--ui-spacing-xs` — doubles as the stepped slider's end inset: how far the first/last dot (and the handle's travel) sit from the ends of the track

## Stickers

Used by `Sticker`. Content and wash are separate paints: most variants wash their own content hue, but secondary washes `--ui-color-secondary-border-active` and danger washes `--ui-color-danger-secondary` (its content is `--ui-color-danger-primary`). Figma spells the shared opacity `sticker-bg-opactity`; the token corrects that.

- `--ui-color-sticker-prominent` / `-secondary` / `-alternate` / `-tertiary` / `-danger` — the glyph and label colour. Each aliases the paint Figma aliases (`--ui-color-prominent`, `--ui-color-text-tertiary`, `--ui-prominent-color-alt`, `--ui-prominent-color-ter`, `--ui-color-danger-primary`), except danger in dark, which is a literal `#ffffff`
- `--ui-color-sticker-bg-prominent` / `-secondary` / `-alternate` / `-tertiary` / `-danger` — the wash, a `color-mix` of the hue at the opacity below. Dark secondary mixes at the shared 20% rather than the secondary opacity; dark danger is a solid `#ffffff`, not a mix
- `--ui-sticker-bg-opacity` — 20% in both modes. `StickerVariant.custom` applies this to its `color` prop
- `--ui-sticker-bg-opacity-secondary` — 80% light / 60% dark. The light secondary wash reads it; the dark wash does not (see above)
- `--ui-spacing-sticker-y` — vertical padding, 6px (Figma's raw value, off the spacing scale). Tailwind: `py-sticker-y`

## Panel And Field Widths

- `--ui-min-w-menu` (160px) · `--ui-min-w-menu-action` (144px) ·
  `--ui-min-w-menu-complex` (324px) — the three `DropdownMenuVariant` floors
- `--ui-min-w-search-box` — the standalone `SearchBox` shell. It ALIASES
  `--ui-min-w-menu-complex`, since they are the same width by design, but keeps
  its own name so the search field can be widened without touching menus
- `--ui-width-tooltip-rich` (pinned) · `--ui-min-w-tooltip-complex` — the simple
  tooltip intentionally hugs its text and has no token
- `--ui-width-toast-simple` · `--ui-width-toast-complex` ·
  `--ui-width-toast-viewport`
- `--ui-width-calendar-presets` · `--ui-min-w-calendar-panel` — the panel width
  sets the day-cell size, since cells are aspect-square across seven equal
  columns

## Text Shimmer (v3)

Used by `ShimmerText`'s `ds-shimmer-text` utility (animated gradient masked to glyphs via `background-clip: text`):

- `--ui-shimmer-base` — the gradient's resting color (default: `var(--ui-color-text-tertiary)`)
- `--ui-shimmer-highlight` — the sweeping highlight color (default: `color-mix(in srgb, var(--ui-color-text-tertiary) 35%, transparent)`)

## Motion

Every animated component owns a `--ui-<component>-*` family, and the component
reads them only through CSS — nothing is mirrored in JavaScript. Retuning a value
here retunes the component, including under `prefers-reduced-motion`.

Families: `--ui-roll-hover-*` (`RollHoverText`), `--ui-underline-link-*`
(`UnderlineLinkText`), `--ui-rolling-digits-*` (`RollingDigitsText`),
`--ui-sidebar-icon-*` (`SidebarWithHoverIcon`).

### Rolling Digits

**Renamed in 5.x.** These were `--ui-rolling-money-*` in 5.0.0, alongside the
`RollingMoneyText` → `RollingDigitsText` component rename, and the `cents`
segment became `decimals`. If you overrode any of them, rename accordingly:
`--ui-rolling-money-cents-size` → `--ui-rolling-digits-decimals-size`, and so on.
`--ui-rolling-money-fade-duration` has no direct equivalent — it split into
`enter-duration` and `exit-duration`.

- `--ui-rolling-digits-duration` — the roll: a wheel already on screen turning to its new digit
- `--ui-rolling-digits-stagger` — `0ms` by default, so the whole figure lands as one snap; raise it for a right-to-left cascade with the ones place leading
- `--ui-rolling-digits-enter-duration` / `--ui-rolling-digits-exit-duration` — a slot opening from, or collapsing to, zero width as the figure gains or loses a digit
- `--ui-rolling-digits-opacity-ratio` — the fraction of that duration the fade occupies (default `0.55`), so an arriving glyph is opaque before it stops overlapping its neighbour
- `--ui-rolling-digits-ease`
- `--ui-rolling-digits-digit-width` — the width of one digit slot, default `1ch`. Retune only if your face's tabular advance drifts noticeably from its `0` advance
- `--ui-rolling-digits-separator-width` — the advance reserved for `,` and `.`, default `0.34em`. Fixed because `width` cannot animate from `auto`; too narrow reads tight but never clips
- `--ui-rolling-digits-decimals-size` / `-rise` / `-gap` — the raised small-decimals treatment, all in em of the INTEGER part, which is what keeps the proportion constant at every figure size. Changing `-size` needs `-rise` re-tuned alongside it

The component forces `font-variant-numeric: tabular-nums` on itself and offers no
way off: the fixed slot width is only correct while every digit shares one
advance.

### Roll On Change

Used by `RollChangeText`. The two halves carry deliberately different curves: the
old content leaves on an accelerating ease-in (it is being discarded, so it
should not linger) while the new content arrives on the house decelerating curve.

- `--ui-roll-change-out-duration` / `--ui-roll-change-in-duration`
- `--ui-roll-change-out-ease` / `--ui-roll-change-in-ease`
- `--ui-roll-change-depth` — travel distance, in em so it scales with the type
- `--ui-roll-change-blur` — in px on purpose: a lens effect, not a typographic
  measure. Scaling it with font size makes large text read as smeared rather
  than fast. The in-animation's mid-point blur is derived from this token, so
  the two cannot drift apart.

### Spinner Sizing

`LoadingSpinner` and `ProgressIndicator` render at these, and the whole drawing —
stroke weight, wave amplitude, arc gaps — scales with them, because the SVG keeps
its own user-unit viewBox and only the rendered size comes from the token:

- `--ui-size-spinner-sm` (16px) · `-rg` (22px) · `-md` (32px) · `-xl` (40px)

Before 5.x these tokens existed but were inert — the components rendered from a
JS table instead, so overriding one did nothing. They are live now.

### Sidebar Icon

- `--ui-sidebar-icon-duration` — the rail traversing the frame when `side` flips
- `--ui-sidebar-icon-hover-duration` — the rail bowing into a chevron; faster, because it answers a pointer
- `--ui-sidebar-icon-ease`

## Tailwind Mappings

The package maps `--ui-*` tokens into Tailwind v4 with `@theme inline`, including:

- Colors: `bg-primary`, `text-primary-fg`, `bg-secondary`, `text-text`, `bg-surface-primary`, `bg-surface-secondary`, `bg-surface-page`, `bg-danger-primary`, `text-danger-primary`, `border-border-primary`, `border-border-secondary`, `border-border-popovers`, `border-input-border-focus`, `text-prominent-color`, `bg-prominent-color-alt`
- Fonts: `font-body`, `font-button`, `font-heading`, `font-label`, `font-title`, `font-hero`, `font-mono`
- Shadows: `shadow-button`, `shadow-button-secondary`, `shadow-menu`, `shadow-focus-prominent`, `shadow-focus-primary`, `shadow-focus-danger` (v3)
- Radii: `rounded-tight`, `rounded-normal`, `rounded-soft`, `rounded-slider-inner` (v3, and directional variants such as `rounded-l-standard`)
- Spacing utilities where mapped (see `@theme`)
- Composite utilities: `text-style-button`, `text-style-body`, `text-style-label`, `text-style-title`, `text-style-heading`, `text-style-subheading`, `text-style-hero`, `text-style-mono`, `h-button`, `h-button-sm`, `size-button`, `size-button-sm`, `size-button-micro`, `h-slider-track`

Prefer mapped utilities over arbitrary values when composing local UI.

## Tailwind Consumer Preset

`styles.css` is compiled Tailwind: it ships the tokens plus the exact utility classes dooph components use, but the consuming app's own Tailwind build has no knowledge of the dooph token namespace. So app-authored classes like `p-md`, `gap-sm`, `rounded-normal`, or `font-label` never generate, and same-named Tailwind defaults (`font-sans`, numeric spacing) win.

When the app runs its own Tailwind v4 build, import the shipped preset so the app's Tailwind learns every `--ui-*` token:

```css
@import "tailwindcss";
@import "@dooph-software/design-system/styles.css";
@import "@dooph-software/design-system/theme.css";
```

This makes every dooph utility generate in the app build and overrides colliding defaults; values still resolve from `styles.css` at runtime. No manual `@theme inline` remap is needed. Apps without Tailwind ignore `theme.css`.

## Dark Mode Rules

- **Light palette:** `:root`/`.light` (package defaults ship both; omit theme classes means `:root`-only applies).
- **Dark palette:** `.dark` — app attaches to `<html>` (or ancestor of your tree) when the resolved theme is dark.
- **`prefers-color-scheme`:** not used by this package — implement “system” in the provider so it mirrors the OS via `.dark` (or clears it).
- **Next.js** with `next-themes`: `ThemeProvider attribute="class"` toggles `.dark`; for explicit `light` + `dark` classes on `<html>`, set provider `themes`/`value` so forced light clears `.dark` and may set `light`.
- **Vite:** toggle `.dark` on `document.documentElement` (same contract).
- Avoid `dark:bg-[#...]` and inline overrides for dooph components; remap tokens instead.
