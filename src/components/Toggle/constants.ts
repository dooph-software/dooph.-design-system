// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible toggle (Figma Toggle Switch) variant and size constants.
 * Usage: <ToggleSwitch variant={ToggleVariant.ghost} size={ToggleSize.iconMicro} />
 *
 * primary    — selected option is filled primary
 * ghost      — selected option is ghost-active
 * unselected — always the shared unselected look, even when selected; set it
 *              per item (<ToggleSwitchItem variant={ToggleVariant.unselected}>)
 *              for an option that must never read as chosen
 *
 * BREAKING (major): `secondary` was renamed `ghost` to match Figma.
 */
export const ToggleVariant = {
  primary: "primary",
  ghost: "ghost",
  unselected: "unselected",
} as const;
export type ToggleVariant = (typeof ToggleVariant)[keyof typeof ToggleVariant];

/**
 * Named after the Figma Toggle Switch sizes.
 * default 38 · sm 34 · icon 38×38 · iconSm = Figma "Icon Small", the 28×28
 * MICRO icon option (not the 34×34 one).
 */
export const ToggleSize = {
  standard: "standard",
  sm: "sm",
  icon: "icon",
  iconMicro: "icon-micro",
} as const;
export type ToggleSize = (typeof ToggleSize)[keyof typeof ToggleSize];
