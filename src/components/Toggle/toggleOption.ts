/*
 * toggleOptionVariants — the Figma "Toggle Option" (826:1723), shared by
 * TabsTrigger (Radix Tabs) and ToggleSwitchItem (Radix ToggleGroup).
 *
 * ## behavior
 * - `selected:` / `unselected:` (index.css @custom-variant) match both
 *   data-state=active (tabs) and data-state=on (toggle group).
 * - The unselected look is ONE look shared by every variant: the base with no
 *   `selected:` rule applied — transparent, no border, text-text, with
 *   ghost-hover / ghost-active on hover/press. Figma `State=Default/Hover/
 *   Active` are the SELECTED states: primary = filled primary (with its own
 *   hover/press), ghost = ghost-active.
 * - `variant: "unselected"` renders that shared look whatever the Radix state:
 *   no selected fill even when the option is the chosen one, hover/press
 *   un-gated. It is for an option that must never read as selected.
 * - Disabled drops any fill; opacity comes from ds-disabled-state.
 * - No typography here: TabsTrigger and ToggleSwitchItem render through
 *   ButtonText (`as` the Radix part), which sets the button role.
 *
 * ## constraints
 * - Neutral module (no "use client"): consumed by client components only, but
 *   holds no client API.
 * - Never prefix a package class (h-button, size-*, ds-*) with a variant.
 * - Never put a `text-style-*` class in this recipe. Text is set by a Text
 *   component, so a consumer applying `tabTriggerVariants` to their own
 *   element renders it through ButtonText too.
 */
import { cva, type VariantProps } from "class-variance-authority";

export const toggleOptionVariants = cva(
  [
    "inline-flex items-center justify-center gap-sm whitespace-nowrap",
    "border border-transparent",
    "text-text cursor-pointer select-none",
    "ds-motion-state",
    "ds-focus-visible-ring focus-visible:border-input-border-focus",
    "ds-disabled-state",
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
        /** The shared unselected look, applied regardless of Radix state. */
        unselected: "enabled:hover:bg-ghost-hover enabled:active:bg-ghost-active",
      },
      size: {
        /** 38px — Figma Standard. */
        standard: "h-button rounded-tight px-rg",
        /** 34px — Figma Small. */
        sm: "h-button-sm rounded-tight px-rg",
        /** 28px — Figma Micro, radius-mini. */
        micro: "h-button-micro rounded-mini px-rg",
        /** Follows the parent's height (nested segmented rows). */
        fill: "h-full rounded-tight px-rg",
        /** 38×38 icon-only. */
        icon: "size-button p-0 rounded-tight",
        /** 34×34 icon-only. */
        "icon-sm": "size-button-sm p-0 rounded-tight",
        /** 28×28 icon-only — Figma Micro icon. */
        "icon-micro": "size-button-micro p-0 rounded-mini",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "standard",
    },
  },
);

export type ToggleOptionVariantProps = VariantProps<typeof toggleOptionVariants>;
export type ToggleOptionSize = NonNullable<ToggleOptionVariantProps["size"]>;
