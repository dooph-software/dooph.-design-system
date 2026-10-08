// Server-safe constants — no "use client" so React Server Components can read
// these values. Re-exported via the barrel; ProgressIndicator.tsx imports them.
//
// Color and size are shared with LoadingSpinner — the same const objects, not
// copies. They are exported from LoadingSpinner/constants.ts, and the package
// barrel surfaces them, so there is no re-export here.

export const ProgressIndicatorVariant = {
  /** Smooth circular arc — discrete arcs with M3 gap behaviour and CSS transitions. */
  flat: "flat",
  /**
   * Material 3 wavy arc — one stable rounded-star path for the whole circle,
   * revealed up to `progress` by a normalized stroke dash. The dash is not
   * transitioned, so drive `progress` gradually (e.g. from a spring loop) for
   * smooth motion.
   */
  wavy: "wavy",
} as const;
export type ProgressIndicatorVariant =
  (typeof ProgressIndicatorVariant)[keyof typeof ProgressIndicatorVariant];
