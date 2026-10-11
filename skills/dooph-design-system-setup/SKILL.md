---
name: dooph-design-system-setup
description: Use when installing or upgrading @dooph-software/design-system in an app; when wiring its styles.css or theme.css imports, its fonts or its Tailwind v4 preset; when max-w-*, w-* or basis-* sizes change after adding the preset; when placing "use client" around DS components in a Next.js App Router or other React Server Components app; when running init-skills; or before reporting that an app using the DS type-checks, builds or looks right.
---

# Setting up the dooph design system

The package ships React components, `styles.css` (its tokens plus the classes its own components use), an optional Tailwind v4 preset `theme.css`, and these skills. It loads no font and paints no page: both are the app's job.

**Not for:** token overrides, dark mode, islands, the practical preset (see dooph-design-system-theming); choosing and composing components, Text components (see dooph-design-system-usage).

## Quick reference

1. `npm install @dooph-software/design-system`. Peers: `react` and `react-dom` 19 or later.
2. CSS entry of a Tailwind v4 app (Next.js: `app/globals.css`):
   ```css
   @import "tailwindcss";
   @import "@dooph-software/design-system/styles.css";
   @import "@dooph-software/design-system/theme.css";
   ```
   No Tailwind: `import "@dooph-software/design-system/styles.css";` in the JS entry, and no `theme.css`.
3. Load the fonts and map them onto the role tokens: [references/fonts-and-preset.md](references/fonts-and-preset.md).
4. Paint the page: `@layer base { body { background-color: var(--ui-color-surface-page); color: var(--ui-color-text); font-family: var(--ui-font-body); } }`.
5. `npx @dooph-software/design-system init-skills` (add `--yes` to skip the prompts).

## Rules

1. **Import `theme.css` whenever app code writes DS utilities** (`p-md`, `gap-lg`, `bg-primary`, `text-text-secondary`). *Prevents:* utilities that generate nothing. `styles.css` holds only the classes the DS's own components use, so a DS name can seem to work without the preset only because a component happens to use it.
2. **Before adding `theme.css` to an existing Tailwind app, find the size names it takes over.** The DS spacing names `xs` (6px), `sm` (8px), `md` (12px), `lg` (16px) and `xl` (20px) replace Tailwind's container widths in `w-`, `min-w-`, `max-w-`, `basis-`, `inline-`, `min-inline-` and `max-inline-`. `max-w-md` becomes 12px, not 28rem. `font-mono` becomes the DS mono stack. `2xl` and above are unchanged. Run `grep -rnE --exclude-dir=node_modules --exclude-dir=.next "\b(w|min-w|max-w|basis|inline|min-inline|max-inline)-(xs|sm|md|lg|xl)\b" .`, then rewrite each hit with the container variable (`max-w-(--container-md)`) or the value (`max-w-[28rem]`). *Prevents:* columns collapsing to 12px, which no typecheck or build reports.
3. **Load every font yourself, with the axes the DS sets, and map them on `:root, .light`.** The DS declares its font defaults on both selectors and never on `.dark`. *Prevents:* text falling back to `system-ui`, Google Sans Flex rendering without its rounding (an axis the file lacks is ignored silently), and a `.light` element reverting to the DS default family names when the mapping sits on `:root` alone.
4. **The page and any data stay in Server Components. Put `"use client"` on the smallest leaf that needs it.** The package root is server-safe to import, and a Server Component can render any DS component with serialisable props. It cannot pass a function prop (a Server Action marked `"use server"` is the one exception): an `onClick`, an `onValueChange`, or shape components in `shapes` (pass `Shapes` keys instead). That includes server-safe components such as `Button`. Move that part into its own client file. *Prevents:* a whole page shipped as client code, and builds that fail with "Event handlers cannot be passed to Client Component props".
5. **Keep values a server file reads out of `"use client"` files.** A server import of a const from a client file receives a reference, not the value. It fails at render (`TypeError: … toUpperCase is not a function`). Put shared consts in a module without the directive, as the DS does: every exported const, variant function and util is server-safe. The client exports are listed in [references/client-references.md](references/client-references.md).
6. **Re-run `init-skills` after every upgrade.** It overwrites same-named files and never deletes, so first remove the old `dooph-design-system-*` folders from `.agents/skills`, `.claude/skills` and `.agent/skills`. *Prevents:* skills that describe the previous version.

## Verify

1. Run the app's own typecheck script, never raw `tsc`. For Next.js 15.5 or later run `next typegen && tsc --noEmit` (older Next has no `next typegen` or global `LayoutProps`: use `next build`). Raw `tsc` reporting `Cannot find name 'LayoutProps'` means typegen didn't run: run it and re-check.
2. Run the production build (`next build`), then `next start` and load every route you changed. The build renders only static (○) routes, so a server/client error on a dynamic (ƒ) route shows only on request. Typecheck passes these errors.
3. Check anything visual in a browser. Read `getComputedStyle(el).maxWidth` (or the property you changed) and `getPropertyValue('--ui-…')`, with `<html>` in light and in dark.
4. Report the whole command's exit status, not a filtered slice.
5. Before calling an error pre-existing, run the same command on the unchanged code (for example a `git worktree` of HEAD) and see it there.

## Rationalizations

| Agent said | Reality |
|---|---|
| "The layout error is pre-existing." | It came from running raw `tsc` and skipping `next typegen`. The app's `typecheck` script exits 0. |
| "No TypeScript errors in the pricing files." (after `\| grep pricing`) | Filtering hid a failing exit code. Report the whole run. |
| "A page at `app/settings/notifications/page.tsx` - client component with form state" | The page stays a Server Component and renders a client form leaf. |

**Red flags:** `"use client"` on a `page.tsx` or `layout.tsx`; a `max-w-{xs…xl}` you didn't check after adding the preset; "pre-existing" with no run on the unchanged code; "done" with no build and no browser check of a visual change.

## Related

dooph-design-system-usage (components, `references/components.md`), dooph-design-system-theming (token overrides, dark mode, `references/token-contract.md`).
