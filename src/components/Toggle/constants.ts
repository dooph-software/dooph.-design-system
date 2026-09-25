// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible toggle (Figma Toggle Switch) variant and size constants.
 * Usage: <ToggleSwitch variant={ToggleVariant.ghost} size={ToggleSize.iconSm} />
 *
 * primary — selected option is filled primary
 * ghost   — selected option is ghost-active
 *
 * BREAKING (major): `secondary` was renamed `ghost` to match Figma.
 */
export const ToggleVariant = {
  primary: "primary",
  ghost: "ghost",
} as const;
export type ToggleVariant = (typeof ToggleVariant)[keyof typeof ToggleVariant];

/**
 * Named after the Figma Toggle Switch sizes.
 * default 38 · sm 34 · icon 38×38 · iconSm = Figma "Icon Small", the 28×28
 * MICRO icon option (not the 34×34 one).
 */
export const ToggleSize = {
  default: "default",
  sm: "sm",
  icon: "icon",
  iconSm: "icon-sm",
} as const;
export type ToggleSize = (typeof ToggleSize)[keyof typeof ToggleSize];
