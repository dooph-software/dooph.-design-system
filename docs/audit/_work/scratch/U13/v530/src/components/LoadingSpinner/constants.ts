// Server-safe constants — no "use client" so React Server Components can read
// these values. Re-exported via the barrel; LoadingSpinner.tsx imports them.

export const LoadingSpinnerVariant = {
  /** Smooth circular arc — rAF-driven discrete arcs with M3 gap behaviour. */
  flat: "flat",
  /**
   * Icon spinner — the LoadingSpinnerIcon paths rotate at a constant linear
   * rate. Communicates "loading" via a familiar eight-spoke icon.
   */
  spokes: "spokes",
} as const;
export type LoadingSpinnerVariant =
  (typeof LoadingSpinnerVariant)[keyof typeof LoadingSpinnerVariant];

export const LoadingSpinnerColor = {
  primary: "primary",
  brand: "brand",
} as const;
export type LoadingSpinnerColor =
  (typeof LoadingSpinnerColor)[keyof typeof LoadingSpinnerColor];

export const LoadingSpinnerSize = {
  /** 16 px diameter — maps to --ui-size-spinner-sm */
  sm: "sm",
  /** 22 px diameter — maps to --ui-size-spinner-rg */
  rg: "rg",
  /** 32 px diameter — maps to --ui-size-spinner-md */
  md: "md",
  /** 40 px diameter — maps to --ui-size-spinner-xl */
  xl: "xl",
} as const;
export type LoadingSpinnerSize =
  (typeof LoadingSpinnerSize)[keyof typeof LoadingSpinnerSize];
