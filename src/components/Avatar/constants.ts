// Server-safe constants — no "use client" so React Server Components can read
// these values. Avatar.tsx imports them; the folder index re-exports them.

export const AvatarSize = {
  standard: "standard",
  sm: "sm",
} as const;
export type AvatarSize = (typeof AvatarSize)[keyof typeof AvatarSize];
