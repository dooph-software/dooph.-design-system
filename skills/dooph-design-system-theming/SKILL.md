---
name: dooph-design-system-theming
description: Use when installing, theming, branding, or extending @dooph-software/design-system in a consuming React app, especially Next.js or Vite. Enforces token-based overrides with Tailwind v4 and forbids hardcoded or inline styling.
metadata:
  short-description: Extend dooph with clean token overrides
---

# dooph Design System Theming

Use this skill when a consuming app needs branded styling, font integration, dark mode, or framework setup for `@dooph-software/design-system`.

## Non-Negotiables

- Never theme by editing package CSS in `node_modules`.
- Never use inline styles or hardcoded component colors/radii/shadows to brand dooph components.
- Override deterministic `--ui-*` tokens in app CSS: **`:root, .light`** for the light palette and **`.dark`** for the dark palette (after importing package CSS). Use the **same selectors** everywhere you remap so branding applies for default light, forced-light class, forced dark, and **root theme** no matter Next.js (`next-themes`), Vite, or another toggle.
- Import order matters: package CSS first, app theme CSS after it.
- Keep Tailwind utilities semantic: use mapped tokens like `bg-primary`, `text-text`, `border-border`, `shadow-button`; avoid arbitrary one-off values except when introducing a new documented token.
- Default palette control is **`class`/`:root`** on **`document.documentElement`**, not per-component theme props. Optionally force a **subtree** to the light palette with **`className="light"`** on a wrapper (**`--ui-*` inherit** downward; see § Subtheme island). Prefer remapping **`--ui-*`** over **`dark:`** one-offs or inline colors on **dooph** surfaces.
- The package does not load font files. Consumers must load fonts and map them into `--ui-font-sans`, `--ui-font-label`, and `--ui-font-heading`.
- Google Sans Flex must be loaded with its custom axes available; the package applies `GRAD`, `ROND`, `slnt`, and `wdth` only to Google Sans Flex text styles.

## Required CSS Order

```css
@import '@dooph-software/design-system/styles.css';
@import './theme.css';
```

`styles.css` defines default tokens and Tailwind v4 `@theme inline` mappings. Your `theme.css` should override `--ui-*` values so all package utilities and components adopt the app brand automatically.

## Root Theme Pattern

Mirror the package selector shape so overrides apply in both default light (`:root`), explicit forced light (`:root`/`.light`), and dark (`.dark`):

```css
:root,
.light {
  --ui-color-primary: var(--brand-950);
  --ui-color-primary-foreground: white;
  --ui-color-primary-hover: var(--brand-900);
  --ui-color-primary-active: var(--brand-800);

  --ui-color-brand: var(--accent-700);
  --ui-color-brand-foreground: white;
  --ui-color-brand-hover: var(--accent-800);
  --ui-color-brand-active: var(--accent-900);

  --ui-color-surface-page: var(--app-bg);
  --ui-color-surface: var(--app-surface);
  --ui-color-border: var(--app-border);
  --ui-color-border-focus: var(--accent-700);
  --ui-color-focus-ring: color-mix(in srgb, var(--accent-700) 28%, transparent);

  --ui-font-sans: var(--font-google-sans-flex), system-ui, sans-serif;
  --ui-font-label: var(--font-ibm-plex-sans), system-ui, sans-serif;
  --ui-font-heading: var(--font-bricolage-grotesque), var(--font-google-sans-flex), system-ui, sans-serif;
}

.dark {
  --ui-color-surface-page: var(--app-bg-dark);
  --ui-color-surface: var(--app-surface-dark);
  --ui-color-text: var(--app-text-dark);
  --ui-color-text-secondary: var(--app-text-secondary-dark);
  --ui-color-text-tertiary: var(--app-text-tertiary-dark);
  --ui-color-border: var(--app-border-dark);
  --ui-color-primary: var(--brand-100);
  --ui-color-primary-foreground: var(--brand-950);
  --ui-color-ghost-hover: color-mix(in srgb, white 6%, transparent);
  --ui-color-ghost-active: color-mix(in srgb, white 10%, transparent);
}
```

If you never use an explicit `.light` class (only “no `.dark`” for light), you may scope light overrides to `:root` only for brevity.

## Overriding tokens (any provider)

Regardless of Next.js (`next-themes`), Vite, or a custom toggle, remap **`--ui-*`** in **`theme.css` after** **`@import '@dooph-software/design-system/styles.css'`** using the package’s selectors:

```css
/* Light (default + forced `class="light"` on `<html>` or wrappers) */
:root,
.light {
  --ui-radius-tight: 10px;
  --ui-color-surface-page: var(--brand-page);
}

/* Dark */
.dark {
  --ui-radius-tight: 10px;
  --ui-color-surface-page: var(--brand-page-dark);
}
```

If you **never** add **`class="light"`** anywhere, `:root`-only overrides are fine; if you might, mirror important overrides under **`.light`** too so forced light stays on-brand.

## Theme classes (light / dark)

The package ships **defaults** only: **`:root`/`.light`** share the light palette; **`.dark`** is dark. No **`prefers-color-scheme`** in the bundle — **system mode** belongs in your app (**Next**: e.g. `ThemeProvider attribute="class" enableSystem`; **Vite**: toggle **`dark`** with **`document.documentElement.classList`**).

Components resolve **`var(--ui-*)`** from the nearest ancestor that set them. Rebrand globally by overriding **`--ui-*`** on **`:root`**, **`.light`**, and **`.dark`** (same shape as snippets above).

Avoid **`dark:`** / inline palettes for **dooph** internals unless composing **app-only** chrome around them.

Mode-invariant sizing, radius, spacing, and font tokens do not need `.dark` duplicates. Define them once under `:root`/`.light`; add `.dark` overrides only for values that actually change.

## Subtheme island (`className="light"` on a wrapper)

**Yes — `.light` on a subtree forces the light `--ui-*` palette for that branch.** The package’s **`.light`** rule applies the full light token set **on that element**; custom properties inherit, so primitives under the wrapper (**`bg-surface`**, **`text-text`**, radii wired to **`--ui-radius-*`**, etc.) render light while **`<html>`** can stay **`class="dark"`**.

**Portals caveat:** overlays/menus appended under **`document.body`** do **not** inherit from **`div.light`** unless the portalled subtree is decorated with **`light`** (`className` on the surfaced content / `Portal` container) — fix per surface.

Example: **`<html class="dark">`** with **`<main class="light">…</main>`** for a light preview region.

An equivalent **`className="dark"`** subtree works for a dark island inside an otherwise light tree (dark **`--ui-*`** from that ancestor).

## Component Branding Hooks

### Avatar

`Avatar` is a composable shell. The package owns the square surface, padding, radius, and `--ui-color-avatar-bg`; consuming apps own logo/image/icon content.

```tsx
<Avatar>
  <img src={logoUrl} alt="" />
</Avatar>
```

If the logo changes between light and dark, handle that in app code or app CSS. Do not edit package code or expect a package-level logo provider.

### Tooltip

Tooltips are token-driven, not runtime theme-detected. `TooltipContent` defaults to `themeInverse={true}` and uses inverse tooltip tokens. Pass `themeInverse={false}` for a matching-theme tooltip.

Override these if your brand changes tooltip treatment:

```css
:root,
.light {
  --ui-color-tooltip-inverse-surface: var(--ui-color-primary);
  --ui-color-tooltip-inverse-text: var(--ui-color-primary-foreground);
  --ui-color-tooltip-inverse-border: var(--ui-color-primary);
  --ui-color-tooltip-matching-surface: var(--ui-color-secondary);
  --ui-color-tooltip-matching-text: var(--ui-color-secondary-foreground);
  --ui-color-tooltip-matching-border: var(--ui-color-border);
}

.dark {
  /* Optional only if your dark-mode tooltip values differ from token references above. */
}
```

### Toast

Toast width is tokenized so stacked standard/action toasts keep stable widths:

```css
:root,
.light {
  --ui-width-toast: 230px;
  --ui-width-toast-action: 360px;
  --ui-width-toast-viewport: var(--ui-width-toast-action);
}
```

Override these only if your product needs different toast widths. They usually do not need dark-mode overrides.

## Next.js App Router

```tsx
// app/layout.tsx
import '@dooph-software/design-system/styles.css';
import './theme.css';
import {
  Google_Sans_Flex,
  IBM_Plex_Sans,
  Bricolage_Grotesque,
} from 'next/font/google';
import { ThemeProvider } from 'next-themes';

const googleSansFlex = Google_Sans_Flex({
  subsets: ['latin'],
  variable: '--font-google-sans-flex',
  display: 'swap',
  axes: ['GRAD', 'ROND', 'opsz', 'slnt', 'wdth'],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage-grotesque',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${googleSansFlex.variable} ${ibmPlexSans.variable} ${bricolageGrotesque.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Assign each `next/font` loader a CSS variable and map those variables to `--ui-font-sans`, `--ui-font-label`, and `--ui-font-heading` in `theme.css`. If the installed Next.js version does not support Google Sans Flex custom axes, load it with `next/font/local` or provider CSS and keep the same token mapping. For provider CSS, request the full axis surface:

```html
<link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:GRAD,ROND,opsz,slnt,wdth,wght@0..100,0..100,6..144,0,25..151,1..1000&display=swap" rel="stylesheet">
```

With `next-themes`, `attribute="class"` toggles **`dark`** on `<html>` for dark mode; resolved light clears that class (`:root` defaults apply). If you want an explicit **`light`** class too (helps some three-way setups), configure the provider’s **theme-value mapping** per `next-themes` docs (`value={{ light: 'light', dark: 'dark' }}`) so `<html>` can be `light` or `dark` — duplicate brand overrides across **`:root, .light`** in your `theme.css`. Keep **`--ui-*`** values in CSS, not React theme objects.

## Vite React

```tsx
// src/main.tsx
import '@dooph-software/design-system/styles.css';
import './theme.css';
```

Load fonts via `@font-face`, a hosted stylesheet, or app shell markup; then map those font families to `--ui-font-*` in `theme.css`. When using Google Fonts for Google Sans Flex, request `GRAD`, `ROND`, `opsz`, `slnt`, `wdth`, and `wght`; loading only `wght` will prevent the design-system axis tokens from rendering.

Example without `next-themes` — drive **`dark`** from saved preference / `prefers-color-scheme` yourself; apply it on **`document.documentElement`** (keep **`theme.css`** overriding **`--ui-*`** on **`.dark`** as usual):

```ts
document.documentElement.classList.toggle(
  'dark',
  preference === 'dark' ||
    (preference === 'system' &&
      matchMedia('(prefers-color-scheme: dark)').matches),
);
```

Many apps omit a **`light`** class on **`<html>`** and rely on removing **`dark`** for light mode. Add **`document.documentElement.classList.toggle('light', …)`** only if your product uses **`class="light"`** explicitly on **`<html>`**.

## Tailwind Consumer Remap

This package emits global Tailwind utility classes because component recipes use Tailwind internally. If a consuming app also emits Tailwind after importing the package, the app should remap same-named theme utilities to dooph tokens:

```css
@theme inline {
  --font-sans: var(--ui-font-sans);
  --font-label: var(--ui-font-label);
  --font-heading: var(--ui-font-heading);

  --radius-tight: var(--ui-radius-tight);
  --radius-standard: var(--ui-radius-standard);
  --radius-soft: var(--ui-radius-soft);
}
```

Do this in app CSS after the app imports Tailwind and the design-system CSS.

## Adding New Tokens

When app needs a new repeated value:

1. Add an app-level semantic token, e.g. `--app-warning-bg`.
2. Map it to a dooph token only if it changes existing components.
3. If creating a reusable local extension, define a local component/class that consumes tokens.
4. Do not scatter `#hex`, `rgb()`, `style={{}}`, or arbitrary utility values across feature files.

For the full token surface and the Tailwind conflict contract, read `references/token-contract.md`.
