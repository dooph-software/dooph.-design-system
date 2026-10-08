// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

export const CTAButtonVariant = {
  primary: "primary",
  secondary: "secondary",
} as const;
export type CTAButtonVariant =
  (typeof CTAButtonVariant)[keyof typeof CTAButtonVariant];

export const CTAButtonSize = {
  standard: "standard",
  big: "big",
} as const;
export type CTAButtonSize = (typeof CTAButtonSize)[keyof typeof CTAButtonSize];
