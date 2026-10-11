// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Figma Tab Select — variant × size.
 * Usage: <SegmentedTabSelect variant={SegmentedVariant.ghost} size={SegmentedSize.containerIcon} />
 *
 * Variant and size are separate props: combine them (there are no combined
 * keys such as ghostSmall). With neither prop the tab select is primary +
 * container.
 */
export const SegmentedVariant = {
  primary: 'primary',
  ghost: 'ghost',
} as const;
export type SegmentedVariant =
  (typeof SegmentedVariant)[keyof typeof SegmentedVariant];

/**
 * container      — bordered shell, 28px micro text items (38px overall)
 * standard       — no shell, 38px text items
 * containerIcon  — bordered shell, 28×28 micro icon items
 * icon           — no shell, 38×38 icon items
 */
export const SegmentedSize = {
  container: 'container',
  standard: 'standard',
  containerIcon: 'container-icon',
  icon: 'icon',
} as const;
export type SegmentedSize = (typeof SegmentedSize)[keyof typeof SegmentedSize];
