# Responsive type — future idea

> **Not implemented. Not current behaviour.** This is the maintainer's design note for a possible future version. Today, typography is set with Text component props only; the DS has no responsive mechanism.

## The gap
Text roles have fixed sizes (hero 55px, title 40px, heading 20px). Text components set typography through props, which render as inline style, and inline style can't contain a media query. So no Text prop and no DS mechanism changes a size with the width. The one lever an app has today is redefining a role token (e.g. `--ui-text-title`) inside a media query in its own CSS. That moves every use of the role at once, never one instance, and it is not a documented responsive mechanism. To size one instance per breakpoint, an app must render two copies and hide one per breakpoint (double DOM: the text ships twice and the two copies must be kept in sync; a copy hidden with `display: none` is not read by screen readers), or read the window width in JS (client-only, and it flickers on first paint).

## What it needs to be effective
- **Stay on the role scale.** Responsiveness should switch between *roles*, never accept arbitrary sizes. Otherwise it reopens the off-scale typography the Text rule exists to prevent.
- **Pure CSS, server-safe.** No JS measuring, no hydration flicker, and no `"use client"`, so a Server Component can use it.
- **Breakpoints that match the app's layout.** Use the same widths the consumer's Tailwind uses (40/48/64/80rem), or consumer-overridable values, so type and layout change at the same width. Media queries can't read CSS variables, so the values are fixed in the DS's CSS or generated.
- **Container queries as an option.** In modern layouts a component's width, not the viewport's, often decides its type: a card in a sidebar versus a hero. A container-query variant matters as much as a viewport one.
- **Fluid sizing for display roles.** For hero and title, a `clamp()` size that scales smoothly between a min and a max often beats stepped breakpoints, and needs no API. It needs a min and max per role from design.
- **Accessible.** Use rem or clamp() so the user's font-size setting is respected at every width, and never drop body text below a readable size.
- **One prop, lintable.** A single, typed, discoverable API, which lint can keep consumers inside.

## Candidate shapes
1. **A breakpoint → role prop:** `<HeadingText at={{ md: TextVariant.title }}>`. The component emits `ds-text-<bp>-<role>` classes, generated for every role × breakpoint (and a `@container` set). It fits the role system best.
2. **Fluid role tokens:** `--ui-text-title: clamp(min, preferred, max)` on the display roles. Zero API; it changes the look at every width.
3. **Both:** fluid tokens for the display roles, plus the role prop for real role switches (e.g. a heading that becomes a title on wide screens).

Avoid per-breakpoint size props (`fontSize={{ base, md }}`): they invite off-scale sizes.
