// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

export const TooltipVariant = {
  simple: "simple",
  rich: "rich",
  complex: "complex",
} as const;
export type TooltipVariant = (typeof TooltipVariant)[keyof typeof TooltipVariant];
