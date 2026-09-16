// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Roll direction for RollChangeText / RollHoverText.
 *
 * `down` reads as content falling away (new content drops in from above); `up`
 * reads as content travelling upward (new content rises in from below). Both
 * RollChangeText and RollHoverText default to `down`, preserving their original
 * motion when the prop is omitted.
 */
export const RollDirection = {
  up: 'up',
  down: 'down',
} as const;
export type RollDirection = (typeof RollDirection)[keyof typeof RollDirection];

/**
 * Reveal direction for RevealChangeText — the edge the content travels toward
 * as the slot opens.
 *
 * `left` (the default) pins the content's RIGHT edge, so it reveals out to the
 * left and collapses by tucking back under whatever sits to its right — the
 * breadcrumb-stem case, where the stem hides under the separator. `right` pins
 * the LEFT edge, so the content grows rightward into the space after it.
 */
export const RevealDirection = {
  left: 'left',
  right: 'right',
} as const;
export type RevealDirection =
  (typeof RevealDirection)[keyof typeof RevealDirection];
