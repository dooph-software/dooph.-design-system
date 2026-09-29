// Server-safe constants — no "use client" so RSC code can read them.

export const MorphRotationShapeMode = {
  /** Steps on its own every --ui-shape-morph-interval, with passive spinning. The loader. */
  autoplay: "autoplay",
  /** Steps when `activeIndex` changes; always forward, directly to the new shape. */
  controlled: "controlled",
  /** Steps when an ancestor's CSS sets --ds-shape-morph-target (e.g. on data-state=open). */
  embedded: "embedded",
} as const;
export type MorphRotationShapeMode = (typeof MorphRotationShapeMode)[keyof typeof MorphRotationShapeMode];
