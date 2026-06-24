// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

export const ToastTypes = {
  standard: "standard",
  brand: "brand",
  error: "error",
  action: "action",
} as const;
export type ToastTypes = (typeof ToastTypes)[keyof typeof ToastTypes];
