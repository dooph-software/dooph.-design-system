# dooph Design System

React component primitives and tokenized CSS. The package is framework-agnostic at runtime: use it from Next.js, Vite, or any React shell that can import CSS.

Use defaults or override tokens on an individual basis in your consuming project for a custom look!

**This is a read-only publication of the design system we use at dooph. Licensed with MIT. Usage of this design system never grants you access or rights to dooph intellectual property including but not limited to the trade name "dooph." or any variation therein, brand names of dooph. products, wordmarks and logomarks associated with any and all dooph. intellectual property, and anything else reasonably attributed to the company or brand.**

## Installation

```bash
npm install @dooph-software/design-system
```

```tsx
import { Button } from "@dooph-software/design-system";
import "@dooph-software/design-system/styles.css";
```

## React Server Components (Next.js App Router)

RSC support is built in. Interactive components ship a per-module `"use client"`
directive that is preserved into the published bundle, so you can import directly
from a **Server Component** — no local `"use client"` re-export wrapper barrel is
needed:

```tsx
// app/page.tsx — a Server Component (note: no "use client")
import { Button, Tooltip, DropdownMenu } from "@dooph-software/design-system";

export default function Page() {
  return <Button>Works in an RSC build</Button>;
}
```

`next build` runs with no `createContext is not a function` error. Pure,
presentational exports (text, icons, shapes, variant enums, the `cn` helper) stay
server-safe and render in the RSC layer; everything interactive is a client
boundary automatically. Non-Next frameworks (Vite, Storybook, plain
Rollup/webpack) are unaffected — the directive is inert outside an RSC bundler.

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

`styles.css` is **compiled** Tailwind. It contains the design-system tokens plus
the exact utility classes the dooph components use internally — but your own
Tailwind build has no knowledge of the dooph token namespace. So when you write
`p-md`, `gap-sm`, `rounded-standard`, or `font-label` in **your** code, your
Tailwind never generates them, and same-named Tailwind defaults (`font-sans`,
the numeric spacing scale, etc.) silently win.

If your app runs its own Tailwind v4 build, import the shipped **theme preset**
so your Tailwind learns every `--ui-*` token. Order matters — Tailwind first,
then the package styles, then the preset:

```css
@import "tailwindcss";
@import "@dooph-software/design-system/styles.css";
@import "@dooph-software/design-system/theme.css";
```

That single import makes every dooph utility (`bg-primary`, `text-text`,
`rounded-soft`, `p-md`, `gap-sm`, `font-label`, …) generate in your build and
overrides colliding defaults. Token **values** still resolve from `styles.css`
at runtime, so overriding `--ui-*` in your own CSS keeps working. No manual
`@theme inline` remap is needed.

Apps that do **not** use Tailwind can ignore `theme.css` and just import
`styles.css`.

Keep branded values in `--ui-*` overrides, not in one-off component classes or
inline styles.

## License

MIT — see [LICENSE](./LICENSE) for the full text.  
The "dooph" name and logo are not covered by the MIT license and remain trademarks of dooph software.
