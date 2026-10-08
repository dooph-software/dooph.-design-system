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

> Coming from v4 and landing on **5.4 or later**? Do this migration first, then
> the 5.4 token renames — `--ui-color-brand*` → `--ui-color-prominent*`,
> `--ui-color-error*` → `--ui-color-danger*`, `--ui-color-page-background` →
> `--ui-color-surface-page`, `--ui-radius-standard` → `--ui-radius-normal`, and
> `--ui-color-border-focus` / `--ui-color-trigger-border-*` →
> `--ui-color-input-border-*` — plus `ButtonVariant.brand` → `.prominent`.

## Run the codemod first

```bash
node node_modules/@dooph-software/design-system/skills/dooph-design-system-v5-migration/codemod.mjs ./src
```

Dry run by default; add `--write` to apply the renames. It works as a CI gate;
the danger-palette list it prints is advisory (see §2).

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

## 2. The danger palette — a redesign, not a rename

> **Landing on 5.4 or later? Read this as a design note, not a rename task.**
> v5 deleted all nine `--ui-color-danger*` tokens; **5.4 brought the entire
> family back under the same v4 names**, so your overrides once again land in
> real slots. The codemod still lists every occurrence, but only so you can
> eyeball them — it no longer fails the run.

`ButtonVariant.danger` was **redesigned** between v4 and v5 and has stayed that
way. v4 was a solid red button. Today it is a secondary surface carrying
danger-coloured text, which fills with danger colour on hover and active.

The tokens survived that change in name only — what moved is what they default
to:

| Token | Default in 5.4 | Role in the danger button |
|---|---|---|
| `--ui-color-danger` / `-border` / `-disabled` / `-border-disabled` | alias the **secondary** family | the surface and border it rests on |
| `--ui-color-danger-hover` / `-border-hover` | alias `--ui-color-danger-secondary` | the hover fill |
| `--ui-color-danger-active` / `-border-active` / `-foreground` | alias `--ui-color-danger-primary` | the active fill, and the resting text colour |
| `--ui-color-danger-foreground-active` | aliases `--ui-color-secondary-foreground` | the label once the button is filled |

So a v4 override still applies — but it is pinning one step of a design that no
longer looks the way it did. Go through each one, decide whether you still want
it, then look at the result.

To move every danger-tinted surface at once, override the two raw paints
(`--ui-color-danger-primary`, `--ui-color-danger-secondary`) instead; the state
family follows. For your own markup the full utility set is back: `bg-danger`,
`text-danger-fg`, `border-danger-border` and the `-hover` / `-active` /
`-disabled` variants, alongside `bg-danger-primary` / `text-danger-primary`.

## 3. Verify

```bash
node .../codemod.mjs ./src          # must exit 0
npx tsc --noEmit                    # must pass
```

On 5.4+ the codemod exits 0 once the icon renames are applied; the danger list
it prints is advisory.

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
