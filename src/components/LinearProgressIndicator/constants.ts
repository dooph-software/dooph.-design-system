// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

export const LinearProgressVariant = {
  brand: 'brand',
  primary: 'primary',
} as const;
export type LinearProgressVariant =
  (typeof LinearProgressVariant)[keyof typeof LinearProgressVariant];
