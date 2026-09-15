// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

import type { Shapes } from "../Shapes";

/**
 * Dot-accessible shape constants.
 * Usage: <ShapeButton shape={ShapeButtons.squircle} />
 *
 * This is deliberately a SUBSET of `Shapes`: the Figma ShapeButton component
 * offers these five, while `Shapes/` carries the full set for arbitrary use.
 * `satisfies Record<string, Shapes>` is what keeps the subset honest.
 */
export const ShapeButtons = {
  clover: "clover",
  cookie: "cookie",
  diamond: "diamond",
  puff: "puff",
  squircle: "squircle",
} as const satisfies Record<string, Shapes>;
export type ShapeButtons = (typeof ShapeButtons)[keyof typeof ShapeButtons];

/**
 * Dot-accessible color variants.
 * Usage: <ShapeButton variant={ShapeButtonVariant.primary} />
 */
export const ShapeButtonVariant = {
  brand: "brand",
  primary: "primary",
} as const;
export type ShapeButtonVariant =
  (typeof ShapeButtonVariant)[keyof typeof ShapeButtonVariant];
