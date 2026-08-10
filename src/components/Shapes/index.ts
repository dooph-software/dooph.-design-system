export * from "./ArrowShape";
export * from "./BaseShape";
export * from "./CloverShape";
export * from "./CookieShape";
export * from "./GemShape";
export * from "./PentagonShape";
export * from "./PuffShape";
export * from "./StarShape";

export const Shapes = {
  arrow: "arrow",
  clover: "clover",
  puff: "puff",
  gem: "gem",
  pentagon: "pentagon",
  cookie: "cookie",
  star: "star",
} as const;
export type Shapes = (typeof Shapes)[keyof typeof Shapes];
