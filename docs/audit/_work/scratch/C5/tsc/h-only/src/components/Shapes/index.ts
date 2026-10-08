// probe stub
type P = { size: number; strokeColor?: string; fillColor?: string; strokeWeight?: number | string };
export const CloverShape = (_p: P) => null;
export const CookieShape = (_p: P) => null;
export const DiamondShape = (_p: P) => null;
export const PuffShape = (_p: P) => null;
export const SquircleShape = (_p: P) => null;
export const Shapes = { clover: "clover", cookie: "cookie", diamond: "diamond", puff: "puff", squircle: "squircle" } as const;
export type Shapes = (typeof Shapes)[keyof typeof Shapes];
