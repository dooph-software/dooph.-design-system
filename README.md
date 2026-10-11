# @dooph-software/design-system

The dooph. design system: React components, the `--ui-*` design tokens they are
built on, and a Tailwind v4 preset that makes those tokens usable in your own
classes. It also ships agent skills that teach setup, usage and theming.

- Storybook: <https://dooph-software.github.io/dooph.-design-system/>
- npm: <https://www.npmjs.com/package/@dooph-software/design-system>

## Install

```sh
npm install @dooph-software/design-system
```

React 19 or later is a peer dependency (`react` and `react-dom`).

## Set up

**Styles.** If your app runs its own Tailwind v4 build, import these in your
CSS entry, in this order:

```css
@import "tailwindcss";
@import "@dooph-software/design-system/styles.css";
@import "@dooph-software/design-system/theme.css";
```

Without Tailwind, import only the stylesheet: from your JS entry
(`app/layout.tsx`, `src/main.tsx` or similar),

```ts
import "@dooph-software/design-system/styles.css";
```

or with `@import "@dooph-software/design-system/styles.css";` in your global CSS.

**The Tailwind preset takes over the size names.** `theme.css` registers the
design system's tokens in your Tailwind build, so classes such as `p-md` and
`bg-primary` resolve to them. It also registers the spacing names `xs`, `sm`,
`md`, `lg` and `xl`, which Tailwind reads before its container widths. In an
existing app, `max-w-md` becomes 12px instead of 28rem, and the same happens
to `w-*`, `min-w-*`, `basis-*`, `inline-*`, `min-inline-*` and `max-inline-*`
with those names. `font-mono` becomes the Google Sans Code stack. Check those
classes before you add the preset.

**Fonts.** The package loads no fonts; your app does. The default faces are
[Google Sans Flex](https://fonts.google.com/specimen/Google+Sans+Flex) (body,
button, heading), [Host Grotesk](https://fonts.google.com/specimen/Host+Grotesk)
(label), [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque)
(title, hero) and [Google Sans Code](https://fonts.google.com/specimen/Google+Sans+Code)
(mono). Load each face with its variable axes (Google Sans Flex: GRAD, ROND,
opsz, slnt, wdth, wght; Bricolage Grotesque: opsz; Google Sans Code: MONO, which `MonoText` sets to its
fixed-pitch cut); the setup skill has the details. Each role is a
`--ui-font-*` token you can override.

**Dark mode** follows a `dark` class on `<html>`, which your app sets. To turn
off the expressive details inside everyday components (such as the dropdown
caret's shape), put `data-ds-expression="practical"` on `<html>`.

```tsx
import { Button, ButtonVariant } from "@dooph-software/design-system";

<Button variant={ButtonVariant.primary}>Save</Button>;
```

The setup skill below covers the font axes, server components and how to check
your app.

## Agent skills

```sh
npx @dooph-software/design-system init-skills
```

This copies the package's skills into your project's `.agents/skills`,
`.claude/skills` and `.agent/skills`, asking about each directory first.
`--yes` installs into all three without asking. It changes no other files.

- [dooph-design-system-setup](skills/dooph-design-system-setup/SKILL.md): install,
  stylesheets, fonts, the Tailwind preset, server components.
- [dooph-design-system-usage](skills/dooph-design-system-usage/SKILL.md): building
  UI with the components, with a full component reference.
- [dooph-design-system-theming](skills/dooph-design-system-theming/SKILL.md):
  overriding tokens, dark mode, the expression preset, with the full token list.
- [dooph-design-system-v3-migration](skills/dooph-design-system-v3-migration/SKILL.md)
  and [dooph-design-system-v5-migration](skills/dooph-design-system-v5-migration/SKILL.md):
  upgrading across those major versions.

Release notes are in the [CHANGELOG](CHANGELOG.md).

## Licence

MIT. See [LICENSE.txt](LICENSE.txt). Third-party icon sources and bundled
dependencies are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The dooph. name and logo are not covered by the MIT licence and remain
trademarks of Dooph LLC.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Agents working in this repository
should read [AGENTS.md](AGENTS.md) first.
