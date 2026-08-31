// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so this dot-accessible enum can be read from React Server Components.

/**
 * Which edge the sidebar rail sits on.
 * Usage: <SidebarWithHoverIcon side={SidebarIconSide.left} />
 */
export const SidebarIconSide = {
  left: "left",
  right: "right",
} as const;
export type SidebarIconSide =
  (typeof SidebarIconSide)[keyof typeof SidebarIconSide];
