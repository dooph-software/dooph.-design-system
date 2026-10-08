/*
 * fancyToggleOptionVariants / fancyToggleIndicatorVariants — the Figma Toggle
 * Option `Fancy` / `Fancy+Icon` variants (907:3048…907:3252), used only by
 * FancyToggleSwitchItem. Deliberately separate from toggleOption.ts: that
 * module's "one shared unselected look" does not hold here (2px grey border,
 * indicator ring), so the fancy look must not be folded into it.
 *
 * ## behavior
 * - 54px pill (h-button-big, shared with Button big), 2px border: grey
 *   (secondary-border) unselected, prominent selected. Prominent colour only.
 * - Leading 50px square slot (full inner height) holding a 28px indicator
 *   circle. `check` = stroke-only grey ring that fills prominent and shows the
 *   DS CheckIcon when selected; `icon` = filled grey circle with a dark icon,
 *   filled prominent with a white icon when selected.
 * - Hover / press washes (ghost-hover / ghost-active) apply to UNSELECTED
 *   options only: a selected option is not interactive (the row is single
 *   select and never cleared), so it has no hover or pressed look and gets the
 *   default cursor.
 * - Disabled is ds-disabled-state (whole option at the disabled opacity);
 *   a disabled selected option keeps its selected paint.
 * - State changes run on ds-motion-state (motion scale `fast`, `standard`).
 *
 * ## constraints
 * - Neutral module (no "use client"): no client API here.
 * - The 2px borders are a hardcoded `border-2` by maintainer decision
 *   (2026-10-03); don't swap them for a token or for toggleOption's 1px border.
 * - The label is a Text component (FancyToggleSwitchItem's BaseText), never
 *   a span with a `text-style-*` class, and its colour lives on the option,
 *   not on the label: a role class that cn's tailwind-merge doesn't register
 *   (hero-button wasn't, 2026-10-03) is erased by a colour class in the same
 *   cn() call.
 * - Indicator rules key off the named group `group/fancy-option`, never a bare
 *   `group`, so an outer consumer `.group` with data-state=on can't paint
 *   unselected indicators as selected.
 * - Never prefix a package class (h-button-big, size-button-micro, ds-*) with a
 *   variant.
 */
import { cva } from "class-variance-authority";

export const fancyToggleOptionVariants = cva(
  [
    "group/fancy-option inline-flex h-button-big shrink-0 items-center whitespace-nowrap",
    "rounded-full border-2 border-secondary-border pr-lg",
    "text-text cursor-pointer select-none",
    "ds-motion-state",
    "ds-focus-visible-ring",
    "ds-disabled-state",
    "selected:border-prominent",
    "unselected:enabled:hover:bg-ghost-hover unselected:enabled:active:bg-ghost-active",
    // The chosen option can't be clicked off, so it doesn't read as clickable.
    "selected:enabled:cursor-default",
  ],
);

/** The 50×50 square slot: full inner height of the 54px pill, indicator centred. */
export const fancyToggleIndicatorSlot =
  "flex aspect-square h-full shrink-0 items-center justify-center";

export const fancyToggleIndicatorVariants = cva(
  [
    "flex size-button-micro shrink-0 items-center justify-center rounded-full",
    "ds-motion-state",
    "group-selected/fancy-option:bg-prominent group-selected/fancy-option:text-prominent-fg",
  ],
  {
    variants: {
      indicator: {
        /** No item icon: stroke-only ring, filled + DS check when selected. */
        check:
          "border-2 border-secondary-border group-selected/fancy-option:border-prominent",
        /** Item icon: always a filled circle. */
        icon: "bg-secondary-border text-secondary-fg",
      },
    },
    defaultVariants: {
      indicator: "check",
    },
  },
);

/** The DS check inside a `check` indicator: visible only while selected. */
export const fancyToggleCheckClass =
  "ds-motion-state group-unselected/fancy-option:opacity-0";
