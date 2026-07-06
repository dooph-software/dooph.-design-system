// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible sheet side constants — which edge the sheet slides in from.
 * Usage: <SheetContent side={SheetSide.right} />
 */
export const SheetSide = {
  left: "left",
  right: "right",
  top: "top",
  bottom: "bottom",
} as const;
export type SheetSide = (typeof SheetSide)[keyof typeof SheetSide];
