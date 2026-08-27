/*
 * Text constants — server-safe (intentionally NO "use client") so React Server
 * Components can read these values, matching the other constants modules.
 *
 * Every value here is the CSS `var()` reference itself, not a lookup key. That
 * is deliberate:
 *   - resolution is a no-op, so a prop can never be silently mis-mapped;
 *   - a consuming project that retunes --ui-weight-medium to 450 gets 450,
 *     because the component emits the var, not a snapshotted number;
 *   - devtools shows `font-weight: var(--ui-weight-medium)`, which reads as
 *     intent rather than a magic constant;
 *   - a raw CSS value needs no escape hatch — anything not from these objects
 *     is already a valid value and passes straight through.
 */

/** Text role. Selects the default family/size/weight/tracking/axis bundle. */
export const TextVariant = {
  button: 'button',
  heading: 'heading',
  subheading: 'subheading',
  hero: 'hero',
  title: 'title',
  body: 'body',
  label: 'label',
} as const;
export type TextVariant = (typeof TextVariant)[keyof typeof TextVariant];

/**
 * Roll direction for RollChangeText / RollHoverText.
 *
 * `down` reads as content travelling downward (new content settles in from
 * above); `up` reads as content travelling upward (new content rises in from
 * below). Both RollChangeText and RollHoverText default to `down`, preserving
 * their original motion when the prop is omitted.
 */
export const RollDirection = {
  up: 'up',
  down: 'down',
} as const;
export type RollDirection = (typeof RollDirection)[keyof typeof RollDirection];

/** Font family per role. Each --ui-font-* stack is independently overridable. */
export const Fonts = {
  body: 'var(--ui-font-body)',
  button: 'var(--ui-font-button)',
  heading: 'var(--ui-font-heading)',
  label: 'var(--ui-font-label)',
  title: 'var(--ui-font-title)',
  hero: 'var(--ui-font-hero)',
} as const;
export type Font = (typeof Fonts)[keyof typeof Fonts];

/** Font size per role. */
export const FontSizes = {
  label: 'var(--ui-text-label)',
  body: 'var(--ui-text-body)',
  subheading: 'var(--ui-text-subheading)',
  heading: 'var(--ui-text-heading)',
  title: 'var(--ui-text-title)',
  hero: 'var(--ui-text-hero)',
} as const;
export type FontSize = (typeof FontSizes)[keyof typeof FontSizes];

/** Standard weights. Pass a raw number for anything off this scale (e.g. 450). */
export const FontWeights = {
  regular: 'var(--ui-weight-regular)',
  medium: 'var(--ui-weight-medium)',
  semibold: 'var(--ui-weight-semibold)',
  bold: 'var(--ui-weight-bold)',
} as const;
export type FontWeight = (typeof FontWeights)[keyof typeof FontWeights];

/** Letter-spacing tokens. Only these three roles ship a tracking token. */
export const Tracking = {
  body: 'var(--ui-tracking-body)',
  label: 'var(--ui-tracking-label)',
  hero: 'var(--ui-tracking-hero)',
} as const;
export type TrackingValue = (typeof Tracking)[keyof typeof Tracking];

/**
 * Variable-font axis tags, for the `axes` prop.
 *
 * Only some fonts implement any given axis — Google Sans Flex has all of these,
 * Bricolage Grotesque has opsz/wght, Host Grotesk has wght. Setting an axis a
 * font does not implement is a harmless no-op: the font engine ignores unknown
 * axes, there is no fallback or error. So it is safe to set them broadly, and
 * pointless to set them on a face that lacks them.
 *
 * `weight` is listed for completeness but prefer the `fontWeight` prop —
 * font-variation-settings OUTRANKS font-weight, so passing wght here silently
 * disables that prop.
 */
export const FontAxes = {
  weight: 'wght',
  width: 'wdth',
  slant: 'slnt',
  italic: 'ital',
  opticalSize: 'opsz',
  grade: 'GRAD',
  roundness: 'ROND',
} as const;
export type FontAxis = (typeof FontAxes)[keyof typeof FontAxes];

/**
 * Roles that ship a --ui-font-var-* token, mirroring tokens.css.
 *
 * Kept as data because the `axes` prop merges by APPENDING to the role's list
 * (later duplicate axes win), and `font-variation-settings: var(--undefined), …`
 * invalidates the whole declaration — so a role with no token must emit its
 * axes standalone. If you add a --ui-font-var-* token, add it here too.
 */
export const ROLE_AXIS_TOKEN: Partial<Record<TextVariant, string>> = {
  button: 'var(--ui-font-var-button)',
  body: 'var(--ui-font-var-body)',
  heading: 'var(--ui-font-var-heading)',
  subheading: 'var(--ui-font-var-heading)',
};

/** Role → the class carrying its defaults (see index.css, `components` layer). */
export const TEXT_VARIANT_CLASS: Record<TextVariant, string> = {
  button: 'text-style-button',
  heading: 'text-style-heading',
  subheading: 'text-style-subheading',
  hero: 'text-style-hero',
  title: 'text-style-title',
  body: 'text-style-body',
  label: 'text-style-label',
};

/* Prop value types. The `(string & {})` arm keeps the token values in
 * autocomplete while still accepting any CSS value. */

/** `Fonts.*` or any CSS font-family list. */
export type FontValue = Font | (string & {});
/** `FontSizes.*`, any CSS length, or a number (px). */
export type FontSizeValue = FontSize | (string & {}) | number;
/** `FontWeights.*`, any CSS weight, or a number (e.g. 450). */
export type FontWeightValue = FontWeight | (string & {}) | number;
/** Any CSS line-height, or a number (unitless ratio — 1.5, not 1.5px). */
export type LineHeightValue = (string & {}) | number;
/** `Tracking.*`, any CSS length, or a number (px). */
export type LetterSpacingValue = TrackingValue | (string & {}) | number;
/** Axis tag → value, e.g. `{ [FontAxes.grade]: 20, ROND: 100 }`. */
export type FontAxesValue = Partial<
  Record<FontAxis | (string & {}), number | string>
>;
