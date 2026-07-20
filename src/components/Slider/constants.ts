// SliderVariant lives in its own server-safe module (no "use client") so RSC
// code can read the enum values. Re-exported via index.ts.

export const SliderVariant = { brand: 'brand', primary: 'primary' } as const;
export type SliderVariant = (typeof SliderVariant)[keyof typeof SliderVariant];
