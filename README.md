# dooph Design System

React component primitives and tokenized CSS. The package is framework-agnostic at runtime: use it from Next.js, Vite, or any React shell that can import CSS.

Use defaults or override tokens on an individual basis in your consuming project for a custom look!

**This is a read-only publication of the design system we use at dooph. Licensed with MIT. Usage of this design system never grants you access or rights to dooph intellectual property including but not limited to the trade name 'Dooph LLC', brand name 'dooph', the wordmark and logomark, and anything else reasonably attributed to the brand.**

## Installation

```bash
npm install @dooph-software/design-system
```

```tsx
import { Button } from "@dooph-software/design-system";
import "@dooph-software/design-system/styles.css";
```

## Initialize (agent skills)

If you want your agent to implement stuff from this design system more accurately, you can run a command to copy agent skills into your project:

```bash
npx @dooph-software/design-system init-skills
```

This copies the bundled skills into the agent directories of your choice (`.agents/`, `.claude/`, `.agent/`). No project files are modified. The styles import above is still required separately.

## Font Contract

This package does **not** ship font files or load remote fonts. It defines default font-family tokens only:

```css
--ui-font-sans: "Google Sans Flex", system-ui, sans-serif;
--ui-font-label: "Host Grotesk", system-ui, sans-serif;
--ui-font-heading: "Bricolage Grotesque", system-ui, sans-serif;
```

Consuming apps are responsible for loading fonts and mapping loaded font variables or family names into:

```css
--ui-font-sans
--ui-font-label
--ui-font-heading
```

This keeps the package framework-agnostic and lets each app choose `next/font`, local files, provider CSS, or system fallbacks.

## Next.js Font Example

Use `next/font/google` where available, assign CSS variables, then map those variables to dooph tokens in app CSS.

```tsx
// app/layout.tsx
import "@dooph-software/design-system/styles.css";
import "./theme.css";
import {
  Google_Sans_Flex,
  Host_Grotesk,
  Bricolage_Grotesque,
} from "next/font/google";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
  display: "swap",
  axes: ["GRAD", "ROND", "wdth"],
});

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-host-grotesk",
  display: "swap",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${googleSansFlex.variable} ${hostGrotesk.variable} ${bricolageGrotesque.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

```css
/* app/theme.css */
:root {
  --ui-font-sans: var(--font-google-sans-flex), system-ui, sans-serif;
  --ui-font-label: var(--font-host-grotesk), system-ui, sans-serif;
  --ui-font-heading:
    var(--font-bricolage-grotesque), var(--font-google-sans-flex), system-ui,
    sans-serif;
}
```

If a specific Google font is not supported by the installed Next.js version, load it with `next/font/local` or provider CSS and keep the same `--ui-font-*` mapping.

## Vite Font Example

Load fonts with `@font-face`, provider CSS, or a `<link>` in the app shell, then map families to dooph tokens.

```css
@import "@dooph-software/design-system/styles.css";
@import "./theme.css";
```

```css
/* src/theme.css */
@font-face {
  font-family: "Host Grotesk";
  src: url("/fonts/host-grotesk.woff2") format("woff2");
  font-weight: 400 700;
  font-display: swap;
}

:root {
  --ui-font-sans: "Google Sans Flex", system-ui, sans-serif;
  --ui-font-label: "Host Grotesk", system-ui, sans-serif;
  --ui-font-heading:
    "Bricolage Grotesque", "Google Sans Flex", system-ui, sans-serif;
}
```

## Tailwind v4 Consumer Contract

The package CSS is compiled from Tailwind v4 and emits global utility classes such as `.rounded-tight`, `.rounded-standard`, `.rounded-soft`, `.font-sans`, and `.shadow-button` because component recipes use Tailwind utilities internally.

If a consuming app also builds Tailwind CSS after importing this package, the app's later utilities can override same-named package utilities. The supported strategy is to map the app's Tailwind theme tokens back to dooph's `--ui-*` tokens so whichever utility wins still resolves to the same design-system value.

In the app's root CSS, after `@import 'tailwindcss';` and after the package CSS import, include:

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

Keep branded values in `--ui-*` overrides, not in one-off component classes or inline styles.

## License

MIT — see [LICENSE](./LICENSE) for the full text.  
The "dooph" name and logo are not covered by the MIT license and remain trademarks of dooph software.
