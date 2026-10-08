// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible button variant and size constants.
 * Usage: <Button variant={ButtonVariant.primary} size={ButtonSize.sm} />
 */
export const ButtonVariant = {
  primary: "primary",
  secondary: "secondary",
  brand: "brand",
  danger: "danger",
  ghost: "ghost",
  text: "text",
} as const;
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

export const ButtonSize = {
  default: "default",
  sm: "sm",
  icon: "icon",
  iconSm: "icon-sm",
  iconMicro: "icon-micro",
} as const;
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];
