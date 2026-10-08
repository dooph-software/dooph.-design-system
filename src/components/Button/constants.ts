// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible button variant and size constants.
 * Usage: <Button variant={ButtonVariant.primary} size={ButtonSize.sm} />
 */
export const ButtonVariant = {
  primary: "primary",
  secondary: "secondary",
  prominent: "prominent",
  danger: "danger",
  ghost: "ghost",
  text: "text",
} as const;
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

/**
 * `medium` (46px) and `big` (54px) are pill-shaped, use the hero button text
 * role (16px), and exist for `prominent`, `primary` and `secondary` only —
 * `<Button variant="danger" size="big">` does not compile. No icon-only
 * counterparts.
 */
export const ButtonSize = {
  big: "big",
  medium: "medium",
  standard: "standard",
  sm: "sm",
  icon: "icon",
  iconSm: "icon-sm",
  iconMicro: "icon-micro",
} as const;
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];
