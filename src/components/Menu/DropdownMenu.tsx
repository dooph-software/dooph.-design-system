"use client";

/*
 * DropdownMenu — Radix menu primitives with width variants and composable
 * sections. Complex menus stay free-form: search is an optional sibling
 * (`DropdownMenuSearch`), never baked into content.
 *
 * ## behavior
 * - Root `variant` sets `--ds-menu-min-w` via context; content can override.
 * - Items use ghost button surfaces (`ghost-hover` / `ghost-active`). Content
 *   is always `ghost-fg-active` (primary), never the faded `ghost-fg` rest
 *   tone — except `DropdownMenuItemVariant.danger`, which paints
 *   error-secondary on hover and error-primary on active.
 * - Default `modal={false}`; portals on by default with an escape hatch.
 *
 * ## constraints
 * - Do not hardcode a search field into `DropdownMenuContent`.
 * - Style open/disabled/highlighted via Radix data attributes only.
 */

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from "react";
import { cn } from "../../utils/cn";
import CheckIcon from "../Icons/CheckIcon";
// DropdownMenuVariant / DropdownMenuItemVariant live in ./constants — kept
// server-safe (no "use client") so RSC code can read the enum values.
import {
  DropdownMenuItemVariant,
  DropdownMenuVariant,
} from "./constants";

/**
 * Width variant set on the root and consumed by DropdownMenuContent, mirroring
 * the TwoWayToggle / SegmentedTabSelect context pattern: declare presentation
 * once at the top of the composition instead of threading it through children.
 */
const DropdownMenuPresentationContext = createContext<{
  variant: DropdownMenuVariant;
}>({ variant: DropdownMenuVariant.standard });

const menuWidthClass: Record<DropdownMenuVariant, string> = {
  standard: "ds-menu-w-standard",
  action: "ds-menu-w-action",
  complex: "ds-menu-w-complex",
};

/** Non-modal by default so page UI stays interactable while a menu is open. Pass modal={true} for dialog-like focus trapping. */
function DropdownMenuRoot({
  modal = false,
  variant = DropdownMenuVariant.standard,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> & {
  /** Width variant every DropdownMenuContent in this menu adopts. Default standard. */
  variant?: DropdownMenuVariant;
}) {
  return (
    <DropdownMenuPresentationContext.Provider value={{ variant }}>
      <DropdownMenuPrimitive.Root modal={modal} {...props} />
    </DropdownMenuPresentationContext.Provider>
  );
}

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuContent = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    /** When true, the menu closes when focus leaves the browser window (devtools, screenshot tools, alt-tab). Default false. */
    dismissOnFocusLoss?: boolean;
    /** When false, menu open does not move focus into the panel (required for TypeableDropdownTrigger). Default true. */
    focusOnOpen?: boolean;
    matchTriggerWidth?: boolean;
    onOpenAutoFocus?: (event: Event) => void;
    portal?: boolean;
    portalProps?: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Portal>;
    /** Overrides the root's width variant for this panel only. */
    variant?: DropdownMenuVariant;
  }
>(
  (
    {
      className,
      dismissOnFocusLoss = false,
      focusOnOpen = true,
      matchTriggerWidth = true,
      onFocusOutside,
      onInteractOutside,
      onOpenAutoFocus,
      sideOffset = 6,
      portal = true,
      portalProps,
      variant,
      ...props
    },
    ref,
  ) => {
    const presentation = useContext(DropdownMenuPresentationContext);
    const resolvedVariant = variant ?? presentation.variant;

    const handleOpenAutoFocus = focusOnOpen
      ? onOpenAutoFocus
      : (event: Event) => {
          event.preventDefault();
          onOpenAutoFocus?.(event);
        };

    // Radix dismisses on any outside-interaction signal, including focus moving
    // to devtools, a screenshot tool, or another OS window. Those are the only
    // cases where the document itself has lost focus, so they are separable
    // from a genuine click elsewhere on the page.
    const handleFocusOutside: typeof onFocusOutside = (event) => {
      onFocusOutside?.(event);
      if (!dismissOnFocusLoss && !document.hasFocus()) {
        event.preventDefault();
      }
    };

    const handleInteractOutside: typeof onInteractOutside = (event) => {
      onInteractOutside?.(event);
      const target = event.target as Node | null;
      if (!dismissOnFocusLoss && (!target || !document.contains(target))) {
        event.preventDefault();
      }
    };

    const content = (
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        onFocusOutside={handleFocusOutside}
        onInteractOutside={handleInteractOutside}
        {...(handleOpenAutoFocus
          ? ({
              onOpenAutoFocus: handleOpenAutoFocus,
            } as ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>)
          : {})}
        className={cn(
          "z-50 overflow-hidden rounded-soft border border-solid border-border-popovers bg-surface-primary",
          "ds-py-ui-xs",
          "shadow-menu",
          "ds-radix-dropdown-content-origin",
          // The variant class only sets --ds-menu-min-w; the width helper below
          // reads it, so the floor applies in both width modes.
          menuWidthClass[resolvedVariant],
          // Both helpers set min-width; apply only one so neither clobbers the
          // other in the cascade. The match helper already bakes in the
          // floor via max(), so it fully replaces ds-min-w-menu.
          matchTriggerWidth
            ? "ds-radix-dropdown-match-trigger-width"
            : "ds-min-w-menu",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-100",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1.5 data-[state=closed]:duration-150",
          "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
          className,
        )}
        {...props}
      />
    );

    if (!portal) {
      return content;
    }

    return (
      <DropdownMenuPrimitive.Portal {...portalProps}>
        {content}
      </DropdownMenuPrimitive.Portal>
    );
  },
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const itemBase =
  "relative flex h-button w-full cursor-pointer select-none items-center rounded-tight ds-pl-ui-rg ds-pr-ui-sm ds-radix-data-disabled gap-[10px] text-style-body text-ghost-fg-active outline-none transition-colors duration-100 hover:bg-ghost-hover data-highlighted:bg-ghost-hover active:bg-ghost-active data-highlighted:active:bg-ghost-active";

const DropdownMenuItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    variant?: DropdownMenuItemVariant;
  }
>(({ className, variant = DropdownMenuItemVariant.default, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      itemBase,
      variant === DropdownMenuItemVariant.danger && [
        "hover:text-error-secondary data-highlighted:text-error-secondary",
        "active:text-error-primary data-highlighted:active:text-error-primary",
      ],
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuCheckboxItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    checked={checked}
    className={cn(itemBase, className)}
    {...props}
  >
    <span className="flex flex-1">{children}</span>
    <DropdownMenuPrimitive.ItemIndicator>
      <CheckIcon />
    </DropdownMenuPrimitive.ItemIndicator>
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuLabel = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "flex h-[30px] items-center px-sm",
      "text-style-label text-ghost-fg",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("ds-my-ui-xs h-px bg-border-popovers", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

/** Padded group for menu items and labels. Content has no horizontal padding so separators span full width. */
function DropdownMenuSection({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col ds-px-ui-xs", className)} {...props} />
  );
}

export {
  DropdownMenuRoot as DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuTrigger,
};
