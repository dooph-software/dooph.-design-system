// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

export const SegmentedVariant = {
  ghost: 'ghost',
  ghostSmall: 'ghost-small',
  secondary: 'secondary',
  secondarySmall: 'secondary-small',
  primary: 'primary',
  primarySmall: 'primary-small',
} as const;
export type SegmentedVariant =
  (typeof SegmentedVariant)[keyof typeof SegmentedVariant];
