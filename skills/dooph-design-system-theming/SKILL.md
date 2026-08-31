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

> **Upgrading from v2?** The `--ui-*` names below are the v3 contract. If your
> app still uses v2 token overrides (`--ui-color-destructive*`, bare
> `--ui-color-border` / `--ui-color-surface`, `--ui-color-logo`,
> `--ui-accent-color`), do the one-time rename sweep in the
> **dooph-design-system-v3-migration** skill first, then follow this skill.

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

The package defines font-family *tokens* but ships **no font files**. There is
one token per text role — `body`, `button`, `heading`, `label`, `title`, `hero`,
`mono` — so each role can be overridden independently. Load fonts yourself, then
map the loaded families/variables to the role tokens:

```css
:root, .light {
  --ui-font-body: var(--font-google-sans-flex), system-ui, sans-serif;
  --ui-font-button: var(--font-google-sans-flex), system-ui, sans-serif;
  --ui-font-heading: var(--font-google-sans-flex), system-ui, sans-serif;
  --ui-font-label: var(--font-host-grotesk), system-ui, sans-serif;
  --ui-font-title: var(--font-bricolage-grotesque), var(--font-google-sans-flex), system-ui, sans-serif;
  --ui-font-hero: var(--font-bricolage-grotesque), var(--font-google-sans-flex), system-ui, sans-serif;
  --ui-font-mono: var(--font-google-sans-code), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
```

Miss `--ui-font-mono` and `<MonoText>` falls back to the platform monospace with
no error — it looks *almost* right, which is why it goes unnoticed. Keep a
`ui-monospace` fallback ahead of bare `monospace`: the browser default for the
latter is smaller than surrounding text, and on Windows it is Courier New.

Only override the roles you want to change — e.g. to render button labels in a
different face while leaving body text alone, set just `--ui-font-button`.

### Axes: load them as ranges or they silently do nothing

Two faces carry axes the design system names through `--ui-font-var-*` tokens:

- **Google Sans Flex** — `GRAD`, `ROND`, `opsz`, `slnt`, `wdth`, `wght`. Loading
  `wght` only flattens the body/button/heading roles.
- **Google Sans Code** — `MONO`. The family has a *proportional* cut at MONO 0,
  so without this axis the mono role renders in a non-monospaced face. That is
  the failure mode to watch for: mono type whose columns do not line up.

Request each axis as a **range** (`MONO@0..1`, not `MONO@1`). A pinned or omitted
axis makes the provider serve a file that does not carry it at all, and
`font-variation-settings` then fails silently. The axis tokens apply only to
these two faces — not to Host Grotesk labels or Bricolage Grotesque titles/hero,
which implement no such axes.

```
https://fonts.googleapis.com/css2?family=Google+Sans+Code:MONO,ital,wght@0..1,0,300..800&display=swap
```

**Next.js:** assign each `next/font` loader a `variable`, put the variables on
`<html className>`, and map them in `theme.css`. If the Next version can't load
Google Sans Flex or Google Sans Code axes, use `next/font/local` or provider CSS
with the full axis request and keep the same token mapping.

**Vite / other:** load via `@font-face`, a hosted `<link>`, or provider CSS, then
map families to `--ui-font-*`. The Google Fonts request must include the axes
above, not just `wght`.

### Verifying mono actually loaded

Computed style is not proof: `font-variation-settings: "MONO" 1` reports as set
even when the served file has no MONO axis to apply it to. Render `iiiiiiiiii`,
`WWWWWWWWWW` and `0000000000` in `<MonoText>` and check all three measure the
same width.

### Line height is yours

There is no leading token and no text role sets `line-height` — it inherits, so
without a baseline every role lands on whatever your reset defines (1.5 under
Tailwind's preflight), which is loose for display type. Set it once per role in
your app CSS, in `@layer base` so `leading-*` utilities and the `lineHeight`
prop still override it:

```css
@layer base {
  .text-style-hero { line-height: 1.05; }
  .text-style-title { line-height: 1.2; }
  .text-style-heading { line-height: 1.25; }
  .text-style-body { line-height: 1.5; }
  .text-style-button, .text-style-label { line-height: 1; }
}
```

Fixed-height controls (buttons, inputs) are unaffected by leading either way;
these values matter for copy and display type.

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
  --ui-color-page-background: var(--app-bg);
  --ui-color-border-focus: var(--accent-700);
  --ui-color-focus-ring-brand: color-mix(in srgb, var(--accent-700) 28%, transparent);
}

.dark {
  --ui-color-page-background: var(--app-bg-dark);
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

- **`OutlineButton` accent:** override `--ui-brand-color-alt` (both glow orbs
  default to it), or pass `glowColor1`/`glowColor2` per instance.
- **`Tooltip`:** token-driven, not theme-detected. Defaults to `themeInverse`;
  override `--ui-color-tooltip-*` to restyle. Pass `themeInverse={false}` for a
  matching-theme tooltip.
- **`Toast` / `Tooltip` widths:** pinned per variant —
  `--ui-width-toast-simple` / `--ui-width-toast-complex` /
  `--ui-width-toast-viewport`, and `--ui-width-tooltip-rich` /
  `--ui-min-w-tooltip-complex` (the simple tooltip hugs its text by design).
  Override only if your product needs other widths.
- **`DropdownMenu` width:** `--ui-min-w-menu` (160) / `--ui-min-w-menu-action`
  (144) / `--ui-min-w-menu-complex` (324) are the floors behind
  `DropdownMenuVariant`.
- **`Avatar`:** the package owns the surface/padding/radius via
  `--ui-color-surface-secondary`, `--ui-color-border-secondary`, and
  `--ui-brand-color` (icon/content tint) — there is no dedicated avatar-bg
  token; the app owns the logo/image content (and any light/dark logo swap)
  as `children`.
- **`Slider*` / `LinearProgressIndicator`:** fill color comes from the `color`
  prop (token name or CSS color, default `primary`), not from tokens — the
  slider paints the handle in it and the active track at 45% of it. Geometry
  tokens `--ui-height-slider-track`, `--ui-radius-slider-inner`,
  `--ui-slider-track-gap`, `--ui-width-slider-handle`,
  `--ui-height-slider-handle` control track/handle sizing, not colors. The
  stepped slider insets its handle travel and end dots by `--ui-spacing-xs`.
- **`ShimmerText`:** override `--ui-shimmer-base`/`--ui-shimmer-highlight` to
  retune the animated sheen; children must not set an explicit text color
  while shimmering (the parent owns `color` via `background-clip: text`).

## Adding new values

When the app needs a repeated value the tokens don't cover, define an app-level
semantic token (e.g. `--app-warning-bg`) and map it to a `--ui-*` token only if
it should change a dooph component. Don't scatter `#hex`, `rgb()`, `style={{}}`,
or arbitrary utility values across feature files.

The full token surface and Tailwind mappings live in
`references/token-contract.md` — read it when you need the exhaustive list.
