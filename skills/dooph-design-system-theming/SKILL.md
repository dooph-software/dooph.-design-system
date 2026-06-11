---
name: dooph-design-system-theming
description: Use when installing, setting up, branding, theming, or configuring @dooph-software/design-system in a consuming React app (Next.js, Vite, or other) — importing styles, wiring its Tailwind v4 preset, loading fonts, enabling dark mode, or rebranding by overriding --ui-* tokens. Covers the setup that makes the package render correctly and on-brand. For writing UI with the components themselves, use dooph-design-system-usage.
metadata:
  short-description: Install, theme, and rebrand dooph cleanly
---

# Theming the dooph Design System

This skill covers app-level setup: imports, the Tailwind preset, fonts, dark
mode, and rebranding. The system is themed entirely by overriding `--ui-*`
tokens in CSS — never by editing package files, inline styles, or hardcoded
colors/radii on components. Get the setup right once and every component adopts
the brand automatically, in light and dark.

## 1. Imports (required, in this order)

```css
@import "tailwindcss";                              /* only if the app uses Tailwind */
@import "@dooph-software/design-system/styles.css"; /* tokens + component styles */
@import "@dooph-software/design-system/theme.css";  /* Tailwind preset — see § 2 */
@import "./theme.css";                              /* YOUR --ui-* overrides */
```

Order matters: package styles before your overrides so your tokens win.
`styles.css` is required for every consumer. `theme.css` (the preset) is only
for apps that run their own Tailwind build. Your app's `theme.css` holds the
`--ui-*` overrides and font mapping.

## 2. The Tailwind preset (`theme.css`) — read this if the app uses Tailwind

`styles.css` is *compiled* Tailwind: it ships the tokens plus the exact utility
classes dooph components use internally. But your own Tailwind build doesn't know
the dooph token namespace. So when **you** write `p-md`, `gap-sm`,
`rounded-standard`, or `font-label`, your Tailwind never generates them, and
same-named Tailwind defaults (`font-sans`, the numeric spacing scale) silently
win. That mismatch is why apps used to need a manual `@theme inline` remap.

Importing `@dooph-software/design-system/theme.css` fixes it: it registers every
`--ui-*` token in your Tailwind build, so all dooph utilities generate and
colliding defaults are overridden. Values still resolve from `styles.css` at
runtime, so your `--ui-*` overrides keep working. **No manual remap needed.**

Apps that don't use Tailwind skip the preset entirely.

## 3. Fonts (always the app's job)

The package defines font-family *tokens* but ships **no font files**. Load fonts
yourself, then map the loaded families/variables to the three font tokens:

```css
:root, .light {
  --ui-font-sans: var(--font-google-sans-flex), system-ui, sans-serif;
  --ui-font-label: var(--font-host-grotesk), system-ui, sans-serif;
  --ui-font-heading: var(--font-bricolage-grotesque), var(--font-google-sans-flex), system-ui, sans-serif;
}
```

Load **Google Sans Flex with its axes available** (`GRAD`, `ROND`, `opsz`,
`slnt`, `wdth`, `wght`) — the design system applies axis settings only to Google
Sans Flex text styles, and loading `wght` only will flatten them. `--ui-font-var-*`
axis tokens apply to Google Sans Flex text, not to Host Grotesk labels or
Bricolage Grotesque titles/hero.

**Next.js:** assign each `next/font` loader a `variable`, put the variables on
`<html className>`, and map them in `theme.css`. If the Next version can't load
Google Sans Flex axes, use `next/font/local` or provider CSS with the full axis
request and keep the same token mapping.

**Vite / other:** load via `@font-face`, a hosted `<link>`, or provider CSS, then
map families to `--ui-font-*`. The Google Fonts request must include the axes
above, not just `wght`.

## 4. Dark mode

- **Light palette** lives on `:root` and `.light` (the package ships both with
  identical values). **Dark palette** lives on `.dark`.
- The package does **not** read `prefers-color-scheme`. "System mode" is the
  app's job: your provider/toggle adds or removes `.dark` on `document.documentElement`.
  - Next.js: `next-themes` `ThemeProvider attribute="class" enableSystem` toggles `.dark`.
  - Vite/other: `document.documentElement.classList.toggle("dark", isDark)`.
- Components read `var(--ui-*)` from the nearest ancestor that set them, so an
  ancestor with `class="light"` (or `class="dark"`) forces that palette on its
  subtree — useful for a light preview region inside a dark app.
  - **Portals caveat:** menus/modals appended to `document.body` don't inherit a
    `div.light` ancestor. Decorate the portalled content (or portal container)
    with `light`/`dark` per surface if you need it.

## 5. Rebranding by overriding tokens

Override `--ui-*` in your app `theme.css`, mirroring the package's selector shape
so branding applies in default light, forced `.light`, and `.dark`:

```css
:root, .light {
  --ui-color-primary: var(--brand-950);
  --ui-color-primary-foreground: white;
  --ui-color-brand: var(--accent-700);
  --ui-color-surface-page: var(--app-bg);
  --ui-color-border-focus: var(--accent-700);
  --ui-color-focus-ring: color-mix(in srgb, var(--accent-700) 28%, transparent);
}

.dark {
  --ui-color-surface-page: var(--app-bg-dark);
  --ui-color-primary: var(--brand-100);
  --ui-color-primary-foreground: var(--brand-950);
}
```

Notes:
- If you never paint an explicit `class="light"`, `:root`-only light overrides
  are fine. If you might, mirror important overrides under `.light` too.
- Mode-invariant tokens (spacing, radius, sizing, fonts) are defined once on
  `:root`/`.light`; add a `.dark` value only for what actually changes.
- Prefer token overrides over `dark:` one-offs or inline colors on dooph
  surfaces. Don't theme via component props or React theme objects — keep it in CSS.

### Component branding hooks

- **`OutlineButton` accent:** override `--ui-accent-color` (the hover glow), or
  pass `glowColor1`/`glowColor2` per instance.
- **`Tooltip`:** token-driven, not theme-detected. Defaults to `themeInverse`;
  override `--ui-color-tooltip-*` to restyle. Pass `themeInverse={false}` for a
  matching-theme tooltip.
- **`Toast` widths:** `--ui-width-toast`, `--ui-width-toast-action`,
  `--ui-width-toast-viewport` — override only if your product needs other widths.
- **`Avatar`:** the package owns the surface/padding/radius and
  `--ui-color-avatar-bg`; the app owns the logo/image content (and any
  light/dark logo swap).

## Adding new values

When the app needs a repeated value the tokens don't cover, define an app-level
semantic token (e.g. `--app-warning-bg`) and map it to a `--ui-*` token only if
it should change a dooph component. Don't scatter `#hex`, `rgb()`, `style={{}}`,
or arbitrary utility values across feature files.

The full token surface and Tailwind mappings live in
`references/token-contract.md` — read it when you need the exhaustive list.
