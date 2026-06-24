// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible tab size constant.
 * Usage: <TabsTrigger size={TabSize.icon} />
 */
export const TabSize = {
  default: "default",
  icon: "icon",
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
