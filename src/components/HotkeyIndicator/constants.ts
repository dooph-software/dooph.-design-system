// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so this dot-accessible enum can be read from React Server Components.

/**
 * Dot-accessible HotkeyIndicator variant constant.
 * `default` sits on the page surface; `menu` is the chip on a menu row
 * (DropdownMenuSearch).
 * Usage: <HotkeyIndicator keys={["Esc"]} variant={HotkeyIndicatorVariant.menu} />
 */
export const HotkeyIndicatorVariant = {
  default: "default",
  menu: "menu",
} as const;
export type HotkeyIndicatorVariant =
  (typeof HotkeyIndicatorVariant)[keyof typeof HotkeyIndicatorVariant];
