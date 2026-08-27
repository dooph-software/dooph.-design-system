// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible dropdown menu width variants (Figma `dropdownWidths`).
 *
 * Set once on the `DropdownMenu` root; `DropdownMenuContent` reads it from
 * context and applies the matching min-width floor, so items inherit the width
 * without per-item props.
 *
 * Usage: <DropdownMenu variant={DropdownMenuVariant.complex}>
 */
export const DropdownMenuVariant = {
  /** 160px floor — the default menu. */
  standard: "standard",
  /** 144px floor — compact action/context menus. */
  action: "action",
  /** 324px floor — wide popovers with rich content. */
  complex: "complex",
} as const;
export type DropdownMenuVariant =
  (typeof DropdownMenuVariant)[keyof typeof DropdownMenuVariant];

/**
 * Dot-accessible menu item tone.
 * Usage: <DropdownMenuItem variant={DropdownMenuItemVariant.danger}>
 */
export const DropdownMenuItemVariant = {
  default: "default",
  danger: "danger",
} as const;
export type DropdownMenuItemVariant =
  (typeof DropdownMenuItemVariant)[keyof typeof DropdownMenuItemVariant];
