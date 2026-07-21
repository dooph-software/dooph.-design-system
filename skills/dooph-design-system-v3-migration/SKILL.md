---
name: dooph-design-system-v3-migration
description: Use when upgrading a consuming project from @dooph-software/design-system v2.x to v3.x — after the new version is installed. A one-time, breaking token/API rename sweep: destructive→danger, the border/surface vocabulary split, brand-color/accent consolidation, plus new components. Once the project builds clean with no stale names, this migration is done and the skill no longer applies.
metadata:
  short-description: Upgrade a consuming app from dooph DS v2 to v3
---

# Upgrading @dooph-software/design-system v2 → v3

v3 is a **breaking release** with no back-compat aliases: old token names and the
`destructive` variant are **deleted**, not deprecated. This is a mechanical
rename sweep across three surfaces:

1. Your app's `--ui-*` token overrides (usually one `theme.css`).
2. dooph Tailwind utility classes you wrote in your own JSX.
3. `ButtonVariant.destructive` in your TSX.

Assume the new version is already installed. Nothing here modifies the package —
you're only updating your app's overrides and usages. Work top-to-bottom; the
verification grep at the end is the done-check.

## 0. Find the files that need editing

- **Token overrides:** your app's theme CSS that sets `--ui-*` values (commonly
  `app/theme.css`, `src/theme.css`, or a shared `packages/*/theme.css` in a
  monorepo). Edit every file that overrides `--ui-*`.
- **Usages:** any of your own components using dooph Tailwind classes or
  `ButtonVariant`.

No Tailwind config change is needed — the v3 preset (`theme.css`) regenerates the
new utilities automatically once you import it as before.

## 1. Rename token overrides (your theme.css)

Apply these renames to every `--ui-*` you override. A blanket
`destructive` → `danger` replace in your theme CSS covers the whole danger group
**except** the focus-ring, which is handled on its own row.

| v2 token (delete) | v3 token (use) |
| --- | --- |
| `--ui-color-destructive` | `--ui-color-danger` |
| `--ui-color-destructive-foreground` | `--ui-color-danger-foreground` |
| `--ui-color-destructive-hover` | `--ui-color-danger-hover` |
| `--ui-color-destructive-active` | `--ui-color-danger-active` |
| `--ui-color-destructive-disabled` | `--ui-color-danger-disabled` |
| `--ui-color-destructive-border` | `--ui-color-danger-border` |
| `--ui-color-destructive-border-hover` | `--ui-color-danger-border-hover` |
| `--ui-color-destructive-border-active` | `--ui-color-danger-border-active` |
| `--ui-color-destructive-border-disabled` | `--ui-color-danger-border-disabled` |
| `--ui-color-destructive-focus-ring` | `--ui-color-focus-ring-error` |
| `--ui-color-border` | `--ui-color-border-primary` |
| `--ui-color-surface` | `--ui-color-surface-primary` |
| `--ui-color-surface-page` | `--ui-color-page-background` |
| `--ui-color-focus-ring` | `--ui-color-focus-ring-brand` |
| `--ui-color-logo` | `--ui-brand-color` |
| `--ui-accent-color` | `--ui-brand-color-alt` |

**Removed with no direct replacement — delete these lines:**

- `--ui-color-logo-alt` — gone. The alternate brand slot is now
  `--ui-brand-color-alt` (repurposed from the old accent). If you had distinct
  logo-alt and accent values, you can only keep one; pick the one you need.
- `--ui-color-avatar-bg` — gone. `Avatar` now derives its look from
  `--ui-color-surface-secondary` (background), `--ui-color-border-secondary`
  (1px shell border), and `--ui-brand-color` (icon/content tint). If you had a
  custom avatar background, set `--ui-color-surface-secondary` to it (note that
  token is shared with other secondary surfaces) or accept the new derivation.

**Unchanged — do NOT rename (these already had v3 names in v2):** all
`--ui-color-primary*` / `--ui-color-secondary*` / `--ui-color-brand*` bg + border
tokens, `--ui-color-border-focus`, `--ui-color-trigger-border-hover`,
`--ui-color-border-popovers`, `--ui-color-modal-surface` / `-backdrop`,
`--ui-color-focus-ring-primary` (name unchanged; only its default value moved),
`--ui-color-ghost-*`, `--ui-color-text*`, and all font / spacing / radius /
sizing tokens.

**New tokens you MAY set (optional — sensible defaults ship):**
`--ui-color-border-secondary`, `--ui-color-trigger-border-error-focus` (defaults
to the danger border), the slider geometry tokens, and
`--ui-shimmer-base` / `--ui-shimmer-highlight`.

## 2. Rename dooph utility classes in your JSX

Sweep your own components (not `node_modules`) for these class renames:

| v2 class | v3 class |
| --- | --- |
| `bg-destructive` | `bg-danger` |
| `text-destructive-fg` | `text-danger-fg` |
| `border-destructive` | `border-danger` (or `border-danger-border` for the outline tone) |
| any other `*-destructive-*` | `*-danger-*` |
| `border-border` (bare) | `border-border-primary` |
| `bg-surface` (bare) | `bg-surface-primary` |
| `bg-surface-page` | `bg-page-background` |
| `text-logo` | `text-brand-color` |
| `shadow-focus-destructive` | `shadow-focus-error` |

Caution on two of them:
- `border-border` — rename only the **bare** class. Do **not** touch
  `border-border-primary`, `border-border-secondary`, or `border-border-popovers`
  (already correct). A word-boundary match avoids this: `border-border(?![-\w])`.
- `bg-surface` — same: leave `bg-surface-secondary` alone; rename only bare
  `bg-surface` and `bg-surface-page`.

## 3. Rename the component API (your TSX)

- `ButtonVariant.destructive` → `ButtonVariant.danger` (find/replace).

That is the only renamed export. `ButtonSize`, other variant enums, and every
component name are unchanged.

## 4. Visual changes to expect (not bugs)

- **Danger button text is now dark-on-red in light mode** (uses the primary text
  token; white in dark mode), matching Figma — v2 was white in both. If you want
  white, override `--ui-color-danger-foreground`.
- If you rely on **dooph default colors** (no overrides), the danger red shifted
  (~`#e93b3b` → `#ec5555`) and the standard border tone changed slightly. If you
  override these tokens, your values are unaffected — only the names changed.

## 5. New in v3 (opt-in, no migration action)

Available to import now: `TextLink`, `CopyButton`, the `Slider` suite
(`SliderContinuous` / `SliderStepped` / `SliderLabeled`), `LinearProgressIndicator`,
`StarShape`, `ShimmerText`, `RollChangeText`, plus `ButtonSize.iconMicro` and
`ShapeButtons.star`. See the `dooph-design-system-usage` skill for how to use
them. The new Radix deps (`@radix-ui/react-slider`, `@radix-ui/react-progress`)
ship inside the package — they install transitively, nothing to add.

## 6. Verify (the done-check)

Rebuild the app, then grep your source (exclude `node_modules`). Two passes,
because the bare `border`/`surface` tokens need a negative-lookahead that plain
ripgrep doesn't support:

**Pass A — unambiguous survivors (plain ripgrep):**

```
rg -n -e "destructive|surface-page|accent-color|--ui-color-logo|avatar-bg|text-logo|shadow-focus-destructive"
```

**Pass B — the bare border/surface tokens (needs PCRE2, the `-P` flag):**

```
rg -nP -e "--ui-color-border(?![-\w])|--ui-color-surface(?![-\w])|bg-surface(?![-\w])"
```

The `-e` is required because the pattern begins with `--`, which ripgrep would
otherwise read as a flag.

If your ripgrep has no `-P` support, grep plain `--ui-color-border` and
`bg-surface` instead and confirm by eye that every hit is an allowed longer name
(`-primary`, `-secondary`, `-popovers`, `-focus`; `bg-surface-secondary`) rather
than the bare token.

Zero hits from both passes + a clean build = migration complete. This skill no
longer applies to the project once that holds.
