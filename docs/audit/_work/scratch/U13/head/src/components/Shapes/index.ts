export * from "./ArrowShape";
export * from "./BaseShape";
export * from "./CapsuleShape";
export * from "./CloverShape";
export * from "./CookieShape";
export * from "./DiamondShape";
export * from "./DoubleShape";
export * from "./PentagonShape";
export * from "./PixircleShape";
export * from "./PuffShape";
export * from "./SquircleShape";
export * from "./StarShape";
export * from "./TripleShape";

export const Shapes = {
  arrow: "arrow",
  capsule: "capsule",
  clover: "clover",
  cookie: "cookie",
  diamond: "diamond",
  double: "double",
  pentagon: "pentagon",
  pixircle: "pixircle",
  puff: "puff",
  squircle: "squircle",
  star: "star",
  triple: "triple",
} as const;
export type Shapes = (typeof Shapes)[keyof typeof Shapes];
