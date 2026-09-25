/*
 * toggleOptionVariants — the Figma "Toggle Option" (826:1723), shared by
 * TabsTrigger (Radix Tabs) and ToggleSwitchItem (Radix ToggleGroup).
 *
 * ## behavior
 * - `selected:` / `unselected:` (index.css @custom-variant) match both
 *   data-state=active (tabs) and data-state=on (toggle group).
 * - Both variants rest transparent in text-text; unselected hover/press use
 *   ghost-hover / ghost-active. Selected: primary = filled primary (with its
 *   own hover/press), ghost = ghost-active.
 * - Disabled drops any fill; opacity comes from ds-disabled-control.
 *
 * ## constraints
 * - Neutral module (no "use client"): consumed by client components only, but
 *   holds no client API.
 * - Never prefix a package class (h-button, size-*, ds-*) with a variant.
 */
import { cva, type VariantProps } from "class-variance-authority";

export const toggleOptionVariants = cva(
  [
    "inline-flex items-center justify-center gap-xs whitespace-nowrap",
    "border border-transparent",
    "text-style-button text-text cursor-pointer select-none",
    "transition-all duration-150 ease-out",
    "ds-focus-visible-ring focus-visible:border-input-border-focus",
    "ds-disabled-control",
    "unselected:enabled:hover:bg-ghost-hover unselected:enabled:active:bg-ghost-active",
    "selected:disabled:bg-transparent selected:disabled:border-transparent selected:disabled:text-text",
  ],
  {
    variants: {
      variant: {
        primary: [
          "selected:bg-primary selected:border-primary selected:text-primary-fg",
          "selected:enabled:hover:bg-primary-hover selected:enabled:hover:border-primary-border-hover",
          "selected:enabled:active:bg-primary-active selected:enabled:active:border-primary-border-active",
        ],
        ghost: "selected:bg-ghost-active",
      },
      size: {
        /** 38px — Figma Standard. */
        default: "h-button rounded-tight px-sm",
        /** 34px — Figma Small. */
        sm: "h-button-sm rounded-tight px-sm",
        /** 28px — Figma Micro, radius-mini. */
        micro: "h-tab-micro rounded-mini px-sm",
        /** Follows the parent's height (nested segmented rows). */
        fill: "h-full rounded-tight px-sm",
        /** 38×38 icon-only. */
        icon: "size-button p-0 rounded-tight",
        /** 34×34 icon-only. */
        "icon-sm": "size-button-sm p-0 rounded-tight",
        /** 28×28 icon-only — Figma Micro icon. */
        "icon-micro": "size-tab-micro p-0 rounded-mini",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  },
);

export type ToggleOptionVariantProps = VariantProps<typeof toggleOptionVariants>;
export type ToggleOptionSize = NonNullable<ToggleOptionVariantProps["size"]>;
