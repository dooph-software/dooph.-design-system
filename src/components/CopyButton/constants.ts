// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so this dot-accessible enum can be read from React Server Components.

/**
 * Dot-accessible CopyButton variant constant.
 * Usage: <CopyButton variant={CopyButtonVariant.secondary} value="npm install" />
 */
export const CopyButtonVariant = {
  ghost: "ghost",
  secondary: "secondary",
} as const;
export type CopyButtonVariant =
  (typeof CopyButtonVariant)[keyof typeof CopyButtonVariant];
