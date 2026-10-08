---
name: dooph-design-system-v5-migration
description: Use when upgrading a consuming project from @dooph-software/design-system v4.x to v5.x, after the new version is installed. Symptoms that signal it: a red danger button that no longer looks red, a bar-chart icon that changed shape on its own, SiloIcon failing to resolve, or theme overrides on --ui-color-danger-* that stopped having any effect. A one-time breaking upgrade. No longer applies once the codemod exits 0.
metadata:
  short-description: Upgrade a consuming app from dooph DS v4 to v5
---

# Upgrading @dooph-software/design-system v4 → v5

Three breaking changes. Two are renames the codemod applies; one is a redesign
it deliberately refuses to guess at.

**Two of the three fail silently** — no build error, no console warning, just the
wrong colour or the wrong glyph on screen. Run the codemod even if the app
compiles.

## Run the codemod first

```bash
node node_modules/@dooph-software/design-system/skills/dooph-design-system-v5-migration/codemod.mjs ./src
```

Dry run by default; add `--write` to apply the renames. It exits `1` while any
danger-palette usage remains, so it works as a CI gate.

## 1. Icon renames — auto-applied

| v4 | v5 | Why |
|---|---|---|
| `SiloIcon` | `DiscPlatterDBIcon` | Pure rename, identical glyph. Fails to resolve if left. |
| `BarChartIcon` | `BarChartAxesIcon` | **v5 reused the name for a different icon.** |

`BarChartIcon` is the dangerous one: it still exists in v5, still compiles, and
now renders an axis-less chart instead of the v4 one with axes. Nothing tells
you. The codemod points it at `BarChartAxesIcon`, which is the v4 glyph.

If you actually want v5's new axis-less chart somewhere, put `BarChartIcon`
back at that call site afterwards.

## 2. The danger palette — needs a decision, not a rename

All nine `--ui-color-danger*` tokens are gone, along with the Tailwind classes
they generated (`bg-danger`, `text-danger-fg`, `border-danger-border`, and the
`-hover` / `-active` / `-disabled` variants).

Both failure modes are silent: overriding a token that no longer exists does
nothing, and a class with no rule behind it produces no styling.

`ButtonVariant.danger` still exists and still works — it was **redesigned**.
v4 was a solid red button. v5 is a secondary surface carrying error-coloured
text, which fills with error colour on hover and active. So the old tokens have
no one-to-one replacement, and the codemod reports every occurrence with
`file:line` rather than mapping them.

Retune the button through these instead:

| Token | Role in v5's danger button |
|---|---|
| `--ui-color-error-primary` | resting text colour, and the active fill |
| `--ui-color-error-secondary` | the hover fill |
| `--ui-color-secondary*` | the surface and border it sits on |

For your own markup, the nearest utilities are `bg-error-primary`,
`text-error-primary`, `border-error-primary`. There is no equivalent for
`*-danger-fg`, `*-danger-disabled` or the `*-danger-border-*` trio — decide
those against the two-colour model rather than mapping them across.

## 3. Verify

```bash
node .../codemod.mjs ./src          # must exit 0
npx tsc --noEmit                    # must pass
```

Then look at one danger button and one bar-chart icon in a browser. Both
failures in this migration are visual, so the build passing proves nothing about
them.

## New in v5 — additive, no migration action

`Popover`, `Calendar`, `DatePicker`, `VerificationCodeInput`,
`SidebarWithHoverIcon`, `RollingDigitsText`, `MonoText` and `SubheadingText`,
plus a `tabular` prop on `BaseText`. Nothing existing changed to accommodate
them; adopt them when you want them.

`package.json` `exports`, `files` and peer dependencies are unchanged from v4 —
your import paths and the `styles.css` / `theme.css` setup carry over as-is.
