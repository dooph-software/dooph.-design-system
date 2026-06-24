// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

import type { Shapes } from "../Shapes";

/**
 * Dot-accessible shape constants.
 * Usage: <ShapeButton shape={ShapeButtons.gem} />
 */
export const ShapeButtons = {
  arrow: "arrow",
  clover: "clover",
  cookie: "cookie",
  gem: "gem",
  pentagon: "pentagon",
  puff: "puff",
} as const satisfies Record<string, Shapes>;
