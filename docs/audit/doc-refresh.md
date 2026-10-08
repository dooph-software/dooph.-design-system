# Doc refresh brief

The brief for the agent that rebuilds this repo's skills and docs from scratch
once the v6 code work is done. It records intent, tone and organisation. What
changed in the code lives in [CHANGES.md](CHANGES.md). Read both, plus the
claims register in [FINDINGS.md](FINDINGS.md) §4, which lists 158 stale or false
statements in the current docs, so you know what not to carry over.

Started 2026-10-02. Add to it whenever the maintainer says something about how
the docs should read, what they should hold, or a principle the code follows.

---

## The plan

- **Delete and restart, not edit.** At the end of v6 work, delete both skill sets:
  - the maintainer-facing authoring skills: `.agents/skills/dooph-ds-*`, the
    `file-header-contracts` copy, and their `.claude/skills` / `.agent/skills`
    mirrors;
  - the shipped consumer skills under `skills/`: usage, theming,
    token-contract, and the v3/v5 migration skills.
  Then write new, more focused ones that follow current skill-authoring
  guidance. Don't port the old text; re-derive each fact from the code at that
  HEAD.
- **Mirroring.** Ignore the current symlink / junction / copy mess. Choose one
  mechanism fresh when the new skills are written. It must work on a default
  Windows clone (`core.symlinks=false`), which is how this repo is developed.
- **The v6 migration skill** is written right before the maintainer cuts v6,
  from the `breaking: yes — v6` entries in CHANGES.md plus
  `git diff v5.3.0 HEAD`. The maintainer asks for it; nobody starts it early.
- **Also refresh:** CHANGELOG `[Unreleased]` (from CHANGES.md "docs owed"),
  README (dead utility names, font contract, licence lines), CONTRIBUTING and
  SECURITY (links 404), and `token-contract.md`, which is missing 65 tokens.
- **Already gone:**
  - the vendored third-party `radix-ui-design-system` skill, deleted
    2026-10-02 together with its `skills-lock.json` entry. The codebase skill
    still names it (folder tree, and "load radix-ui-design-system"); that dies
    with the codebase skill.
  - `figma-variable-jsons/`.

## Tone and form (maintainer's preferences)

- Plain words first. Say what a rule or thing IS; never lean on an opaque ID.
- Focused. One skill per job, short, and every rule paired with the failure it
  prevents. The current skills sprawl: the codebase skill alone holds 236
  checkable claims, and 18% of them were false at audit time.
- No history in present-tense docs. Contracts and skills describe the present;
  history lives in git, CHANGELOG and the migration skill.

## Principles the maintainer has stated (write these down as rules)

- **The DS doesn't own data or control.** Components present; the consuming
  project owns data fetching, state machines, timers and side effects. This is
  why `"use client"` is used as rarely as possible: the directive implies a
  component is reaching into data or control.
- **`"use client"` only when unavoidable.** Use it only when the module calls
  hooks, touches browser APIs, creates event-handler closures on a host element,
  or passes a function prop to a client component. Never use it as
  belt-and-braces on a thin Radix wrapper. A file that carries it turns every
  export into a client reference (so `fooVariants()` can't run in a Server
  Component). Non-RSC consumers (Vite, CRA, Remix) ignore it; Vite prints a
  harmless warning per stamped file.
- **The DS owns its size names inside a consumer's Tailwind build.** Importing
  `theme.css` deliberately makes `md` mean the DS's `md` everywhere, so
  `max-w-md` resolves to the DS spacing value, not Tailwind's 28rem container
  width. That is intended. Document it plainly so a team adopting the DS into an
  existing Tailwind app knows its existing `max-w-{xs…xl}`, `w-*`, `min-w-*`
  and `basis-*` classes will change meaning.
- **Motion is one cohesive language.** Every duration and curve comes from a
  small shared scale (`--ui-motion-*`). Changing one token retunes motion across
  the whole system. A component gets its own motion token only when its value
  genuinely can't sit on the scale.
- **Buttons have one content slot.** No icon+text / text+icon content variants:
  `children` with a default 8px gap, and the consumer places content.
- **Expression: signature by default, practical on request.** Expressive
  components (OutlineButton, CTA, shapes…) are opt-in by use. Expressive
  details inside practical components (the dropdown caret's shape and nudge
  first) are switched by `data-ds-expression="practical"`. Put the attribute on
  `<html>` in the root layout (Next.js `app/layout.tsx`, or `index.html` in
  Vite); nesting works but is discouraged. Authority is fixed by cascade layers,
  not by import order or specificity: your tokens.css > the expression preset >
  DS defaults.

## Rule text to carry into the new skills (decided 2026-10-02)

- **Discrete-option prop names.** `variant` and `size` are the defaults. Also
  sanctioned: `shape`, `side`, `selectType`, `mode`, `direction`,
  `sortDirection`, `state`. Each names a mode or direction orthogonal to the
  visual variant.
- **Value controls** use `value` / `defaultValue` / `onValueChange(value)`.
  The force-the-look booleans keep their own names (`active`, `hovered`,
  `glowing`, `pressed`), because they mean different things. The
  inverse-surface flag is `themeInverse`.
- **A const and its type share one name** (`ButtonVariant` / `ButtonVariant`).
  The open-value consts (`Fonts`, `FontSizes`, `FontWeights`, `Tracking`) are
  the stated exception, if they survive v6 in that shape. Check the code.
- **Size vocabulary.**
  - The base size key is `standard` everywhere.
  - Short keys: `sm`, never `small` (Avatar included).
  - Button, Tab and Toggle share one height ladder: `sm` = the button-height-small
    token (34px), `micro` = the button-height-micro token (28px), and the new
    medium and big heights.
- **Variant consts** are named `*Variant`, never `*Types` (Tooltip, Toast).
- **Colour props** route through one lookup (`resolveDsColor`). A token-NAME
  lookup is the sanctioned way for a `color` prop to accept a DS colour name.
- **Bad Calendar/DatePicker values** render nothing after a development
  warning, rather than throwing.
- **Write down the conventions that were never written down.** Each produced a
  bug.
  - Variants select classes through cva.
  - The consumer's `style` merges last and wins.
  - `className` lands on the element that owns the role. When that isn't the
    root, the props JSDoc says so.
  - Invariants live in a header `## constraints` block. Only those are
    protected by AGENTS.md; `//` notes and JSDoc are not.
- **Resolve these contradictions in the old contribution skill** rather than
  copying them:
  - The "layout wrapper must be `aria-hidden` and absolutely positioned" rule
    applies to decorative overlays only. A wrapper around a label can't be
    hidden.
  - Breaking changes are never noted as comments at the top of component files.
  - The radius checklist must list every `rounded-*` utility, or point at
    tokens.css.
  - `var()` in SVG presentation attributes (`fill`, `stroke`) works in
    Chromium. Only length/geometry attributes (`width`, `height`, `r`) fail. Ban
    only those.
- **Tests:** there are none. The only test file was deleted 2026-10-02, so
  don't document a test command.
