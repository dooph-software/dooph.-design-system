# Next plan — deferred from review round 1 (2026-10-04)

**Round 5 status (2026-10-07):**
- REVERTED: CTA hover tilt. The maintainer decided against it, so the CTAButton header is back to "never animated" and `.ds-cta-shape-tilt` is gone.
- DECIDED, keep: the caret's open-flip spring overshoot stays under practical. It is not an expression detail.
- DROPPED: VerificationCode backspace in place.
- MAINTAINER OWNS: every dark-theme item below. Edits assume the dark overhaul lands.
- DONE: Text-component sweep, measured by scoreboard m11 and m12 (76/11 audited → 42/12 after round 4 → 0/0). `buttonVariants` / `tabTriggerVariants` lost their typography (maintainer chose the v6 break). Agent rule 13; patch 11-text-components.
- OPEN: the contribution skill still says "Typography uses `text-style-*` composite utility classes", the opposite of the rule. Docs are deferred, so agent rule 13 overrides it for now.

**Round 4 status (2026-10-07):**
- DONE: expression system (token layers, practical preset, caret as first case, expression-check in the scoreboard); CTA hover tilt (contract reworded); progress ring below-1% rest look restored with the race fix kept; reduced motion made to win over consumer overrides.
- CANDIDATE: under practical, should the caret's open-flip spring overshoot also be neutralised?

**Round 2 status (2026-10-04):**
- DONE: Input fixed width + autoWidth + format on blur; blur roll text; CopyButton zoom swap; CTAText; chat parts secondary; CTA min widths confirmed at 330/350.
- BLOCKED by the CTA header contract ("never animated"): the CTA hover tilt. It needs the maintainer's OK to reword the contract.
- SUPERSEDED: the caret-shape token, by the "signature vs practical" expression proposal (see the chat answer, 2026-10-04).
- STILL OPEN: Popover look (elaborated, awaiting decision); VerificationCode backspace (optional); dark-theme items.

Items from the maintainer's first review that were deferred to save usage, with
the analysis done so far. Each needs either a maintainer decision (marked
**DECIDE**) or just a session to do it (marked **DO**). Pick up from here.

## Needs a decision first

### Input number variants: hug + centre (review #7, #8)
- **Today:** number variants HUG their value (a hidden mirror span sizes the
  box; header contract in `Input.tsx`) and `justify-center` the content. That is
  why deleting digits re-centres the text and icon, and why the box grows and
  shrinks.
- **Recommendation:** make fixed width the default. The field fills its
  container or a consumer width like the text variant, with content
  left-aligned. Keep hugging as an opt-in prop (e.g. `autoWidth`) for the
  inline/compact cases that want it. A dashboard never wants layout shifting
  under typing.
- **DECIDE:**
  - fixed by default + opt-in hug (recommended);
  - fixed only (delete the mirror span and its contract);
  - or keep today's hugging.
- Any change edits the header contract (AGENTS.md: the constraint is removed
  or reworded in its own commit).

### Number formatting with separators (review #9)
- **Standard practice:** the user never types separators. Store and emit the raw
  value; format only for display. Two accepted patterns:
  1. **Format on blur:** show raw while focused, formatted (`Intl.NumberFormat`)
     when not. Simple and robust.
  2. **Format as you type:** reformat on each change and restore the caret by
     counting digits before it. Nicer, but fiddly with paste, IME and RTL.
- **Recommendation:** an opt-in `format` prop (`true` | `Intl.NumberFormatOptions`)
  plus `locale`, default off. Pattern 1 first. `inputMode="decimal"`; strip
  separators on paste; `onValueChange` emits the raw numeric string.
- **DECIDE:** opt-in format on blur (recommended), or also as-you-type.

### Caret shape opt-out (review #16)
- A design token can carry a *value*, but it shouldn't switch component
  behaviour or structure. Hiding the morphing shape is a visual choice,
  though, so it can live in a token if the token is a visual value, not a
  flag.
- **Recommendation:** `--ui-dropdown-caret-shape-scale: 1`. The caret draws its
  shape at `scale(var(...))`; a consumer theme sets `0` for chevron-only carets.
  It's a pure theme lever, keeps the API unchanged, and follows the
  "theme lives in tokens" rule.
- **Alternative:** a `caretShape={false}` prop. That makes it per-instance
  rather than per-theme, which is more API surface.
- **DECIDE:** token (recommended) or prop.

### Popover look (WI-112; morning item 10)
- **WI-112 proposes:** PopoverContent takes the shared floating-panel look the
  menus use (popovers border, modal surface, menu shadow, 6px offset). Today
  Popover has its own lighter styling. That is a visible change to every
  Popover, including DatePicker's panel.
- **DECIDE:** after the elaboration the maintainer asked for. Take it up next
  turn.

### Hero CTA min width (morning item 2)
- It's already a token: `--ui-min-w-cta-content-standard` (330px) and
  `--ui-min-w-cta-content-big` (350px); consumers can override both. A design
  value like this belongs in a token, so that follows the rules.
- **Open:** big is 350 in code vs 330 in Figma.
- **DECIDE:** the value only.

## Just needs a session

### Blur roll text clipping (review #1) — DO
- **Cause:** the roll travels 0.9em with a 4px blur inside an `overflow`-clipped
  line box. The blur halo extends past the clip, so the glyph is visibly sliced
  at the clip edge mid-roll.
- **Sweet spot** (Apple / Vercel-style blur-in text):
  - blur scales with type, about 0.08–0.12em (≈1.5–2px at 16px), not a fixed 4px;
  - travel is shorter, about 0.5–0.6em;
  - the hard clip becomes a soft vertical mask, e.g.
    `mask-image: linear-gradient(transparent, #000 18%, #000 82%, transparent)`;
  - the clip box gets ~0.15em of vertical breathing room via padding plus
    negative margin, so layout is unchanged.
- **Tokens:** `--ui-roll-change-blur`, `--ui-roll-change-depth`. Make the blur
  em-based. Check FadeChangeText, which shares depth.

### Hero CTA shape tilt on hover (review #3) — DO, experiment
- Reuse DropdownCaret's hover nudge: rotate the shape by the
  `--ui-shape-morph-nudge` fraction on group hover, on the motion scale. The
  maintainer wants to see whether it's too much motion. Note the earlier answer
  "static on hover" is now superseded.

### CopyButton swap animation (review #4) — DO
- Zoom swap: the outgoing icon scales 1 → 0.6 and fades; the incoming icon
  scales 0.6 → 1 with a slight overshoot on the `enter` curve, at `fast`
  duration. Optionally add a 2px blur on the outgoing icon. Tokens via the
  existing CopyButton helper.

### CTA text component (morning item 3) — DO
- Add `TextVariant.cta` + a `CTAText` role component over the existing
  `.text-style-cta` (24/28px semibold), and use it in CTAButton.

### Chat parts: secondary text, primary on hover (morning item 9) — DO
- Non-live chat text (tool and thinking labels, turn summary, dividers) uses
  `text-secondary`; hoverable ones go to `text-primary` on hover. The unified
  ghost foreground stays for buttons and interactables. Its one non-obvious
  consumer is the chat "thinking" shimmer base: re-point the shimmer at
  text-secondary in the same change.

### VerificationCode backspace in place (review #14) — optional
- Today entry is strictly sequential (wave A, WI-110), so focus never sits past
  the first empty cell. Editing in place after Backspace conflicts with that
  rule. Possible: Backspace on a filled cell clears it and keeps focus, and
  typing there refills it, as long as no gap opens. The maintainer said to skip
  it if hard.

### Dark-theme inconsistencies (morning item 7) — for the dark overhaul
- **WI-061:** 28 alias tokens are defined in `:root` only, so inside a nested
  `.dark` region they resolve to light values. Fix by re-declaring them in
  `.dark`.
- **WI-073:** four mode-invariant size/radius tokens are needlessly re-declared
  in `.dark`.
- **WI-077:** the danger focus shadow is not a token (sync-theme has a COMPUTED
  escape hatch).
- **D-07:** the dark danger Sticker is invisible (both colours `#ffffff`).
- **New:** `--ui-focus-ring-width(-sm)` (review round 1) has no `.dark` concern;
  listed so the overhaul knows it exists.

### Also pending
- The docs rebuild (brief: `doc-refresh.md`), then the v6 migration skill at
  release time.
- WI-072 HeartFillIcon and the icon-stroke token went to agent R1 in round 1;
  check its record before redoing them.

## Expression system: signature vs practical (proposed 2026-10-04, awaiting maintainer go)
- **Scope.** The expressive COMPONENTS (OutlineSection, OutlineButton, CTA,
  shapes, medium/big buttons) are opt-in by use and are never switched. Only
  expressive DETAILS inside practical components get a switch: caret shapes
  and caret nudge first, input decorations later.
- **Mechanism.** One token per detail, holding a value whose neutral setting
  turns the detail off (e.g. `--ui-caret-shape-scale: 1` → 0). `tokens.css`
  ships a preset, `[data-ds-expression="practical"] { …neutral values… }`.
- **Placement.** The attribute goes on the root element, as a product-level
  setting: Next.js `app/layout.tsx` `<html data-ds-expression="practical">`, or
  `index.html` in Vite. Root-only is the documented default; nesting is
  allowed but discouraged (see the cascade rule below).
- **Authority, without cascade surprises.** Use CSS cascade layers so
  precedence never depends on file order or selector specificity:
  `@layer ds.tokens, ds.expression;`. The DS defaults sit in `ds.tokens`, the
  presets in `ds.expression`, and a product's own `tokens.css` is UNLAYERED,
  so it always wins. The rule in one line: your tokens.css > the expression
  preset > DS defaults.
- **Cascade rule.**
  - Only the `data-ds-expression` attribute and a product's `tokens.css` set
    expression tokens.
  - Components only READ them, never set them inline or locally.
  - The only cascade effect left is "nearest ancestor attribute wins", and
    only if someone nests.
  - Debug by checking the token's computed value on the element.
- **Enforcement (against regressions).**
  1. Expression tokens carry a marker comment in `tokens.css`.
  2. A check script, next to the scoreboard, fails if any marked token is
     missing from the practical preset, if any component sets one inline, or
     if a component reads one outside a `ds-expr-*` helper.
  3. Each component with an expressive detail gets a header-contract line
     ("expressive detail X reads --ui-…; must stay neutralisable by the
     practical preset") and a "Practical" story.
  4. An agent-rules entry and a doc-refresh rule.
- **First case:** the DropdownCaret / TypeableDropdownTrigger caret shapes and
  hover nudge. Neutralised, they leave a plain chevron and no empty frame.
