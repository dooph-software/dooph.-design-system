// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible tab size constant.
 * Usage: <TabsTrigger size={TabSize.icon} />
 */
export const TabSize = {
  /** 38px — Figma `buttonSizes/buttonHeight`, `md` (16px) horizontal padding. */
  default: "default",
  /** 34px — Figma `buttonSizes/smallButtonHeight`, `rg` (12px) padding. */
  sm: "sm",
  /** 30px compact item — backs SegmentedVariant.micro (Figma "Micro"). */
  micro: "micro",
  /** 38×38 icon-only tab. */
  icon: "icon",
  /** 34×34 icon-only tab, pairing with the small variants. */
  iconSm: "icon-sm",
} as const;
export type TabSize = (typeof TabSize)[keyof typeof TabSize];

/**
 * Dot-accessible tab variant constant.
 * Usage: <TabsTrigger variant={TabVariant.primary} />
 */
export const TabVariant = {
  ghost: "ghost",
  primary: "primary",
} as const;
export type TabVariant = (typeof TabVariant)[keyof typeof TabVariant];
