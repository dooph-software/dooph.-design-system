// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible toggle variant and size constants.
 * Usage: <TwoWayToggleItem variant={ToggleVariant.primary} size={ToggleSize.sm} />
 *
 * primary — selected item gets primary (dark) button fill; resting text is dark (text-text)
 * secondary — selected item gets ghost-active fill; resting text is ghost-fg
 */
export const ToggleVariant = {
  primary: "primary",
  secondary: "secondary",
} as const;
export type ToggleVariant = (typeof ToggleVariant)[keyof typeof ToggleVariant];

export const ToggleSize = {
  default: "default",
  sm: "sm",
} as const;
export type ToggleSize = (typeof ToggleSize)[keyof typeof ToggleSize];
