// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

export const ToastTypes = {
  simple: "simple",
  brand: "brand",
  error: "error",
  complex: "complex",
} as const;
export type ToastTypes = (typeof ToastTypes)[keyof typeof ToastTypes];
