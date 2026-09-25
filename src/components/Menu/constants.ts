// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible menu selection mode, set once on the DropdownMenu root.
 * Usage: <DropdownMenu selectType={DropdownMenuSelectType.multi}>
 *
 * single — every item closes the menu on select (also covers action menus).
 * multi  — DropdownMenuMultiSelectItem keeps the menu open; plain items still
 *          close. Triggers receive it as data-select-type.
 *
 * BREAKING (major): DropdownMenuVariant (standard/action/complex) was removed.
 * Items hold the 160px floor; set DropdownMenuSection `width` for wider menus.
 */
export const DropdownMenuSelectType = {
  single: "single",
  multi: "multi",
} as const;
export type DropdownMenuSelectType =
  (typeof DropdownMenuSelectType)[keyof typeof DropdownMenuSelectType];

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

/**
 * Figma Menu Segment — full-width break between sections.
 * Usage: <DropdownMenuSegment variant={DropdownMenuSegmentVariant.labeled}>Filter by</DropdownMenuSegment>
 */
export const DropdownMenuSegmentVariant = {
  divider: "divider",
  labeled: "labeled",
} as const;
export type DropdownMenuSegmentVariant =
  (typeof DropdownMenuSegmentVariant)[keyof typeof DropdownMenuSegmentVariant];
