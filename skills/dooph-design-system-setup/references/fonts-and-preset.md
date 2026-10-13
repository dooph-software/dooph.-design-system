# Fonts and the Tailwind preset

## The font contract

The package ships no font files and no `@font-face`. Each text role reads one token, and the app loads the face and points the token at it.

| Token | DS default family | Weights the roles use | Axes the DS sets |
|---|---|---|---|
| `--ui-font-body` | Google Sans Flex | 400 | `"wdth" 100, "GRAD" 19, "ROND" 100, "slnt" 0` |
| `--ui-font-button` | Google Sans Flex | 500 (600 for the CTA label) | `"wdth" 100, "GRAD" 11, "ROND" 100, "slnt" 0` |
| `--ui-font-heading` | Google Sans Flex | 600 | `"wdth" 100, "GRAD" 11, "ROND" 100, "slnt" 0` |
| `--ui-font-label` | Host Grotesk | 400 | none |
| `--ui-font-title` | Bricolage Grotesque | 700 | none |
| `--ui-font-hero` | Bricolage Grotesque | 700 | none |
| `--ui-font-mono` | Google Sans Code, then `ui-monospace` | 500 | `"MONO" 1` (fixed pitch) |

The weights and axes come from the `--ui-weight-*` and `--ui-font-var-*` tokens; `BaseText`'s `fontWeight` and `axes` props can ask for others. An axis the loaded file does not have is ignored without an error, so a face loaded without its axes renders at the font's defaults (Google Sans Flex: `GRAD` 0 and `ROND` 0, so no rounding instead of the DS's `ROND` 100).

Axis ranges to request:

| Family | Axes and ranges |
|---|---|
| Google Sans Flex | `GRAD` 0..100, `ROND` 0..100, `opsz` 6..144, `slnt` -10..0, `wdth` 25..151, `wght` 1..1000 |
| Google Sans Code | `MONO` 0..1 (request it as a range), `wght` 300..800 |
| Host Grotesk | `wght` 300..800 |
| Bricolage Grotesque | `opsz` 12..96, `wdth` 75..100, `wght` 200..800 |

### Next.js (`next/font`)

```tsx
// app/layout.tsx
import { Bricolage_Grotesque, Google_Sans_Code, Google_Sans_Flex, Host_Grotesk } from "next/font/google";

const sansFlex = Google_Sans_Flex({ subsets: ["latin"], variable: "--font-google-sans-flex", display: "swap", axes: ["GRAD", "ROND", "opsz", "slnt", "wdth"] });
const sansCode = Google_Sans_Code({ subsets: ["latin"], variable: "--font-google-sans-code", display: "swap", axes: ["MONO"] });
const hostGrotesk = Host_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-host-grotesk", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage-grotesque", display: "swap", axes: ["opsz"] });

// <html className={`${sansFlex.variable} ${sansCode.variable} ${hostGrotesk.variable} ${bricolage.variable}`}>
```

`wght` comes with every variable face; `opsz` matters because the Text components set `font-optical-sizing: auto`. `next build` prints "Failed to find font override values for font `Google Sans Flex`" (and the same for Google Sans Code). It is a warning, and the fonts still load.

### Any other app (Google Fonts `<link>`)

```html
<link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:GRAD,ROND,opsz,slnt,wdth,wght@0..100,0..100,6..144,-10..0,25..151,1..1000&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Google+Sans+Code:MONO,ital,wght@0..1,0,300..800&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Host+Grotesk:wght@300..800&display=swap" rel="stylesheet" />
```

These load under the DS default family names, so no mapping is needed unless you rename or swap a face.

### Mapping the tokens

```css
/* app/globals.css, after the imports. Unlayered, so it beats the DS defaults. */
:root,
.light {
  --ui-font-body: var(--font-google-sans-flex), system-ui, sans-serif;
  --ui-font-button: var(--font-google-sans-flex), system-ui, sans-serif;
  --ui-font-heading: var(--font-google-sans-flex), system-ui, sans-serif;
  --ui-font-label: var(--font-host-grotesk), system-ui, sans-serif;
  --ui-font-title: var(--font-bricolage-grotesque), system-ui, sans-serif;
  --ui-font-hero: var(--font-bricolage-grotesque), system-ui, sans-serif;
  --ui-font-mono: var(--font-google-sans-code), ui-monospace, monospace;
}
```

Write the selector as `:root, .light`. The DS declares its font defaults on `:root` and `.light` and never on `.dark`, so a `.light` element inside the page redeclares them. With the mapping on `:root` alone, text inside any `.light` element reverts to the DS family names. Font tokens have no dark value, so this selector covers dark mode too. Colours are different: see dooph-design-system-theming before scoping a colour override.

## The page

`styles.css` includes Tailwind's preflight, which sets the system font stack on `<html>`, and no background. The app sets the page paint itself:

```css
@layer base {
  body {
    background-color: var(--ui-color-surface-page);
    color: var(--ui-color-text);
    font-family: var(--ui-font-body);
  }
}
```

Text rendered through the DS Text components sets its own role font regardless.

## What `theme.css` changes in an existing Tailwind app

`theme.css` is `@theme inline` source for the app's own Tailwind v4 build. It maps the DS's colour, font-family, text-size, radius, shadow and spacing tokens to utilities (not every token: weights, font axes, tracking, icon sizes and component-only tokens have no utility), so those names resolve to `var(--ui-…)` and follow token overrides at runtime. Where a DS name equals a Tailwind default name, the DS wins:

| Utility (each with `xs`, `sm`, `md`, `lg`, `xl`) | Without the preset | With the preset |
|---|---|---|
| `w-`, `min-w-`, `max-w-`, `basis-`, `inline-`, `min-inline-`, `max-inline-` | `var(--container-*)`: 20rem, 24rem, 28rem, 32rem, 36rem | `var(--ui-spacing-*)`: 6px, 8px, 12px, 16px, 20px |
| `font-mono` | Tailwind's mono stack | `var(--ui-font-mono)` |

Unchanged: `2xl` and larger container widths, `text-sm` and the other Tailwind text sizes, `rounded-md`, `shadow-md`, breakpoints (`md:`) and container queries (`@md:`).

New names the preset adds include `p-md`, `gap-md`, `m-md`, `h-md`, `size-md`, `inset-md` and `translate-x-md` (they did not exist before), plus `rg` (10px), `xxs` (4px), `xxxs` (2px), `xxl` (26px) and `xxxl` (42px).

To keep a container width after adding the preset, name the variable or the value:

```html
<div class="max-w-(--container-md)">  <!-- 28rem; Tailwind still emits --container-md -->
<div class="max-w-[28rem]">
```
