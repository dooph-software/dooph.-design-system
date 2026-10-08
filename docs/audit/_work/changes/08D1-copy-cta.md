### CopyButton zoom swap, `CTAText` role, CTAButton hover tilt (skipped)

#### CopyButton icon swap is now a zoom swap
- files: `src/styles/dooph-component-tokens.css` (the `.ds-copy-icon-*` helper only)
- what changed: the outgoing icon scales 1 -> 0.6 and fades out on the `exit`
  curve; the incoming icon scales 0.6 -> 1 and fades in on the `enter` curve,
  both at `--ui-motion-duration-fast`. Before, the check icon rested at scale
  0.5 and the fade used the `standard` curve. Swap mechanism (`[data-copied]`,
  the 2s revert timer) and reduced motion (global rule) are unchanged. No JS added.
- consumer impact: slightly different icon animation on CopyButton.
- breaking: no
- verified: `npm run lint` exit 0; scoreboard unchanged.
- docs owed: none (CHANGELOG optional: "CopyButton icon swap now zooms").

#### `TextVariant.cta` and `CTAText`
- files: `src/components/Text/constants.ts`, `BaseText.tsx`, `index.ts`,
  `BaseText.stories.tsx`; `src/components/CTAButton/CTAButton.tsx`
- what changed: new `TextVariant.cta` (class `text-style-cta`, button-role axes)
  and `CTAText` / `CTATextProps` role components, exported through the Text
  barrel and `src/index.ts`. CTAButton's label uses `CTAText` instead of
  `BaseText unstyled` + the raw class. CTAButton header line updated to name it.
- consumer impact: new exports; CTAButton output unchanged.
- breaking: no
- verified: esbuild server render of CTAButton (standard/big x primary/secondary)
  before vs after is byte-identical. `npm run lint` exit 0; scoreboard unchanged.
- docs owed: CHANGELOG `[Unreleased]` -> Added: `TextVariant.cta`, `CTAText`.
  `skills/**` text-roles list and `.agents/skills` Text role list: add `CTAText`.

#### CTAButton hover tilt: NOT DONE (header contract conflict)
- CTAButton.tsx header constraint: "The shape is chosen by `size`, never by a
  prop and never animated. That is the maintainer's decision (2026-10-03); a
  shape prop or a hover morph is a design change, not a refactor." The behavior
  block also says the mark "is static".
- next-plan says the earlier "static on hover" answer is superseded, but the
  constraint still stands in the file. Removing it is its own commit with the
  reasoning stated, so it was not edited around.
- to proceed: remove the constraint and the "static" line in a separate commit,
  then add one helper (e.g. `.ds-cta-shape-tilt`) in dooph-component-tokens.css
  that rotates the shape wrapper on `.group:hover` / `:focus-visible` by the
  `--ui-shape-morph-nudge` fraction of a step, on the motion scale.

## DONE
