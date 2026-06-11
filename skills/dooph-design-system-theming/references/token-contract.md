# dooph Token Contract

Override these in a consuming app's root theme CSS. Keep values deterministic and semantic.

Define light values on `:root` and optionally mirror them under `.light` (same selectors the package uses). Define dark values in `.dark`. The bundle does **not** switch themes from `prefers-color-scheme`; the consuming app (e.g. `next-themes` with `enableSystem`) attaches `.dark` when appropriate — including when the resolved theme tracks the OS — so forced light vs forced dark vs system all work.

If you remap tokens (radii, colors, typography), duplicate light overrides across `:root`/`.light` whenever your app paints an explicit `class="light"`, so branded values apply in forced-light mode too.

The package defines font-family tokens but does not load font files. Consumers must load Google Sans Flex, Host Grotesk, and Bricolage Grotesque, or approved substitutes, then map the loaded families/variables to `--ui-font-*`. Google Sans Flex should be loaded with `GRAD`, `ROND`, `opsz`, `slnt`, `wdth`, and `wght` available so the design-system axis tokens can render.

**Subtree islands.** Any ancestor with **`class="light"`** or **`class="dark"`** re-establishes the corresponding **`--ui-*`** palette for itself and descendants (inheritance). Use that to force a light region under **`<html class="dark">`** (or the reverse). **Portals** rendered outside that subtree won’t inherit — add **`light`** / **`dark`** on the surfaced content or portal container.

## Core Colors

- `--ui-color-primary`, `--ui-color-primary-foreground`, `--ui-color-primary-hover`, `--ui-color-primary-active`, `--ui-color-primary-disabled`
- `--ui-color-secondary`, `--ui-color-secondary-foreground`, `--ui-color-secondary-hover`, `--ui-color-secondary-active`, `--ui-color-secondary-disabled`
- `--ui-color-brand`, `--ui-color-brand-foreground`, `--ui-color-brand-hover`, `--ui-color-brand-active`
- `--ui-color-destructive`, `--ui-color-destructive-foreground`, `--ui-color-destructive-hover`, `--ui-color-destructive-active`, `--ui-color-destructive-disabled`
- `--ui-color-ghost`, `--ui-color-ghost-foreground`, `--ui-color-ghost-hover`, `--ui-color-ghost-active`, `--ui-color-ghost-foreground-active`
- `--ui-color-surface`, `--ui-color-surface-secondary`, `--ui-color-surface-page`
- `--ui-color-border`, `--ui-color-border-hover`, `--ui-color-border-focus`, `--ui-color-border-strong`, `--ui-color-border-disabled`
- `--ui-color-text`, `--ui-color-text-secondary`, `--ui-color-text-tertiary`
- `--ui-color-focus-ring`, `--ui-color-destructive-focus-ring`

## Modals

Used by `ModalContent` and `ModalOverlay`. Override to match the app surface treatment.

- `--ui-color-modal-surface` — background of the modal panel
- `--ui-color-modal-border` — border of the modal panel
- `--ui-color-modal-backdrop` — fullscreen overlay behind the modal (accepts any color or `rgba`)

## Accent

Used by `OutlineButton` for the hover color-blur effect. Override once per project to match the brand.

- `--ui-accent-color` — the splash color rendered on button hover (default: `#5ea4b5`)

For per-instance color control without touching the token, use the `glowColor1` and `glowColor2` props directly on `OutlineButton`. Both default to `var(--ui-accent-color)` when omitted. Use `glowing` to make the glow always visible (not hover-gated), and `inverseTheme` to swap the inner surface to primary tokens when the button sits on a dark or primary-colored background.

## Typography

- `--ui-font-sans`, `--ui-font-label`, `--ui-font-heading`
- `--ui-text-label`, `--ui-text-body`, `--ui-text-heading`, `--ui-text-title`, `--ui-text-hero`
- `--ui-weight-body`, `--ui-weight-button`, `--ui-weight-label`, `--ui-weight-heading`, `--ui-weight-title`, `--ui-weight-hero`
- `--ui-font-var-button`, `--ui-font-var-body`, `--ui-font-var-heading`
- `--ui-tracking-body`, `--ui-tracking-label`, `--ui-tracking-hero`

Only Google Sans Flex styles use `--ui-font-var-*`. Do not apply those axis tokens to Host Grotesk label text or Bricolage Grotesque title/hero text.

## Sizing And Shape

- `--ui-height-button`, `--ui-height-button-sm`
- `--ui-spacing-xxs`, `--ui-spacing-xs`, `--ui-spacing-sm`, `--ui-spacing-rg`, `--ui-spacing-md`, `--ui-spacing-lg`, `--ui-spacing-xl`, `--ui-spacing-xxl`
- `--ui-icon-tiny`, `--ui-icon-standard`, `--ui-icon-medium`, `--ui-icon-stroke`
- `--ui-radius-tight`, `--ui-radius-standard`, `--ui-radius-soft`
- `--ui-shadow-button`, `--ui-shadow-button-hover`, `--ui-shadow-button-active`, `--ui-shadow-menu`, `--ui-shadow-focus`
- `--ui-opacity-disabled`

## Tailwind Mappings

The package maps `--ui-*` tokens into Tailwind v4 with `@theme inline`, including:

- Colors: `bg-primary`, `text-primary-fg`, `bg-secondary`, `text-text`, `border-border`, `bg-surface`
- Fonts: `font-sans`, `font-label`, `font-heading`
- Shadows: `shadow-button`, `shadow-menu`, `shadow-focus`
- Radii: `rounded-tight`, `rounded-standard`, `rounded-soft` (and directional variants such as `rounded-l-standard`)
- Spacing utilities where mapped (see `@theme`)
- Composite utilities: `text-style-button`, `text-style-body`, `text-style-label`, `text-style-title`, `text-style-heading`, `text-style-hero`, `h-button`, `h-button-sm`, `size-button`, `size-button-sm`

Prefer mapped utilities over arbitrary values when composing local UI.

## Tailwind Consumer Preset

`styles.css` is compiled Tailwind: it ships the tokens plus the exact utility classes dooph components use, but the consuming app's own Tailwind build has no knowledge of the dooph token namespace. So app-authored classes like `p-md`, `gap-sm`, `rounded-standard`, or `font-label` never generate, and same-named Tailwind defaults (`font-sans`, numeric spacing) win.

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
