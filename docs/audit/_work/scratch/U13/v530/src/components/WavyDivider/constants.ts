// Server-safe constants — no "use client" so React Server Components can read
// these values. Re-exported via the barrel; WavyDivider.tsx imports them.

export const WavyDividerVariant = {
  /** Tight wave — 20px period (Figma "High Frequency"). */
  high: "high",
  /** Broad wave — 40px period (Figma "Low Frequency"). */
  low: "low",
} as const;
export type WavyDividerVariant =
  (typeof WavyDividerVariant)[keyof typeof WavyDividerVariant];
