// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible size constant for TextDropdownTrigger.
 * Usage: <TextDropdownTrigger size={TextDropdownSize.sm} />
 */
export const TextDropdownSize = {
  standard: "standard",
  sm: "sm",
} as const;
export type TextDropdownSize =
  (typeof TextDropdownSize)[keyof typeof TextDropdownSize];
