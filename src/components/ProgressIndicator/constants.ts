// Server-safe constants — no "use client" so React Server Components can read
// these values. Re-exported via the barrel; ProgressIndicator.tsx imports them.
//
// Color and size are shared with LoadingSpinner — the same const objects, not
// copies. They are exported from LoadingSpinner/constants.ts, and the package
// barrel surfaces them, so there is no re-export here.

export const ProgressIndicatorVariants = {
  /** Smooth circular arc — discrete arcs with M3 gap behaviour and CSS transitions. */
  flat: "flat",
  /**
   * Polar sine-wave arc — indicator follows a wavy path generated from `progress`.
   * CSS path transitions are not applied (point count changes); drive `progress`
   * gradually from a spring/animation loop for smooth motion.
   */
  wavy: "wavy",
} as const;
export type ProgressIndicatorVariant =
  (typeof ProgressIndicatorVariants)[keyof typeof ProgressIndicatorVariants];
