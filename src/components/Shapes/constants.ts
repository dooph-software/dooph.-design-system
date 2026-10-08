// Server-safe constants — no "use client" so React Server Components can read
// these values. ShapeButton and MorphRotationShape read these keys; the folder
// index re-exports them.

export const Shapes = {
  arrow: "arrow",
  capsule: "capsule",
  clover: "clover",
  cookie: "cookie",
  diamond: "diamond",
  double: "double",
  eightLeafClover: "eightLeafClover",
  pentagon: "pentagon",
  pixircle: "pixircle",
  puff: "puff",
  squircle: "squircle",
  star: "star",
  triple: "triple",
} as const;
export type Shapes = (typeof Shapes)[keyof typeof Shapes];
