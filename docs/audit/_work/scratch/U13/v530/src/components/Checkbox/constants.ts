// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

export const CheckboxChecked = {
  checked: true,
  unchecked: false,
  indeterminate: "indeterminate",
} as const;
export type CheckboxChecked =
  (typeof CheckboxChecked)[keyof typeof CheckboxChecked];

export const CheckboxVariant = {
  brand: "brand",
  primary: "primary",
} as const;
export type CheckboxVariant =
  (typeof CheckboxVariant)[keyof typeof CheckboxVariant];
