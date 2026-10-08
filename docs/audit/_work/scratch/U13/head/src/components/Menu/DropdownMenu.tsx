"use client";

/*
 * DropdownMenu — Radix menu primitives with a selectType mode (single | multi)
 * and composable sections. Complex menus stay free-form: search is an optional sibling
 * (`DropdownMenuSearch`), never baked into content.
 *
 * ## behavior
 * - Root selectType (single|multi) flows to items via context and to triggers
 *   as a Slot-merged data-select-type prop.
 * - Items hold the 160px width floor; sections and the panel hug.
 * - Items use ghost button surfaces (`ghost-hover` / `ghost-active`). Content
 *   is always `ghost-fg-active` (primary), never the faded `ghost-fg` rest
 *   tone — except `DropdownMenuItemVariant.danger`, which paints
 *   danger-primary on hover and active.
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
import { Checkbox } from "../Checkbox/Checkbox";
import { CheckboxVariant } from "../Checkbox/constants";
import CheckIcon from "../Icons/CheckIcon";
// DropdownMenuSelectType / DropdownMenuItemVariant live in ./constants — kept
// server-safe (no "use client") so RSC code can read the enum values.
import {
  DropdownMenuItemVariant,
  DropdownMenuSegmentVariant,
  DropdownMenuSelectType,
} from "./constants";

/**
 * Root presentation, read by items (MultiSelectItem keep-open) and by
 * DropdownMenuTrigger (forwards data-select-type). Mirrors the ToggleSwitch /
 * SegmentedTabSelect context pattern.
 */
const DropdownMenuPresentationContext = createContext<{
  selectType: DropdownMenuSelectType;
}>({ selectType: DropdownMenuSelectType.single });

/** Non-modal by default so page UI stays interactable while a menu is open. Pass modal={true} for dialog-like focus trapping. */
function DropdownMenuRoot({
  modal = false,
  selectType = DropdownMenuSelectType.single,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> & {
  /** Selection mode for the whole menu. Default single. */
  selectType?: DropdownMenuSelectType;
}) {
  return (
    <DropdownMenuPresentationContext.Provider value={{ selectType }}>
      <DropdownMenuPrimitive.Root modal={modal} {...props} />
    </DropdownMenuPresentationContext.Provider>
  );
}

/**
 * Forwards the root's selectType as data-select-type. With asChild, Radix's
 * Slot merges it onto the consumer's trigger exactly as it merges data-state,
 * so trigger components read it as a plain prop — no context of their own.
 */
const DropdownMenuTrigger = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>((props, ref) => {
  const { selectType } = useContext(DropdownMenuPresentationContext);
  return (
    <DropdownMenuPrimitive.Trigger
      ref={ref}
      data-select-type={selectType}
      {...props}
    />
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

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
      ...props
    },
    ref,
  ) => {
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
          "z-50 flex flex-col gap-xs overflow-hidden rounded-normal border border-solid border-border-popovers bg-modal-surface",
          "ds-py-ui-xs",
          "shadow-menu",
          "ds-radix-dropdown-content-origin",
          // Items carry the 160px floor and the panel hugs them; matching the
          // trigger only ever widens it.
          matchTriggerWidth && "ds-radix-dropdown-match-trigger-width",
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

/**
 * Shared menu-item styling (Figma Menu Item). Exported so surfaces that cannot
 * host a Radix `DropdownMenu.Item` — such as the calendar presets rail inside a
 * Popover — render visually identical items. Carries NO width floor: the
 * presets rail is 144px wide. Internal: not re-exported from src/index.ts.
 */
export const menuItemClassName =
  "relative flex min-h-button w-full cursor-pointer select-none items-center gap-sm rounded-tight px-xs ds-radix-data-disabled text-style-body text-ghost-fg-active outline-none transition-colors duration-100 hover:bg-ghost-hover data-highlighted:bg-ghost-hover active:bg-ghost-active data-highlighted:active:bg-ghost-active data-disabled:hover:bg-transparent data-disabled:active:bg-transparent";

/** Dropdown items also hold the menu's 160px floor; sections and the panel hug them. */
const itemBase = cn(menuItemClassName, "ds-min-w-menu");

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
        "hover:text-danger-primary data-highlighted:text-danger-primary",
        "active:text-danger-primary",
      ],
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

/**
 * Figma "Custom Content Plain" — item geometry with NO interactive states.
 * Not a Radix Item, so it avoids nesting interactives inside a menuitem —
 * but interactive children (e.g. a ToggleSwitch) are pointer-only inside a
 * Radix menu: Radix's roving focus skips this plain div, Tab is prevented by
 * the menu content, arrow keys are only handled when the content itself is
 * the target, and letter keys start typeahead instead of reaching the child.
 * Consumers must provide a keyboard-reachable equivalent (e.g. radio-select
 * items, or a control outside the menu).
 */
const DropdownMenuPlainItem = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex min-h-button w-full items-center gap-sm rounded-tight pl-xs ds-min-w-menu",
      "text-style-body text-ghost-fg-active",
      className,
    )}
    {...props}
  />
));
DropdownMenuPlainItem.displayName = "DropdownMenuPlainItem";

/** Figma Single Select Menu Item — use inside DropdownMenuRadioGroup. Selected: ghost-active + trailing check. */
const DropdownMenuRadioSelectItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      itemBase,
      "data-[state=checked]:bg-ghost-active data-[state=checked]:hover:bg-ghost-active data-[state=checked]:data-highlighted:bg-ghost-active",
      // A disabled item that is also the checked value keeps its selected
      // fill in every pointer state — it still communicates the current
      // value. These out-specificity the data-disabled:hover/active
      // transparent rules from menuItemClassName (0,4,0 > 0,3,0).
      "data-[state=checked]:data-disabled:hover:bg-ghost-active data-[state=checked]:data-disabled:active:bg-ghost-active",
      className,
    )}
    {...props}
  >
    <span className="flex flex-1 items-center gap-sm">{children}</span>
    <DropdownMenuPrimitive.ItemIndicator className="flex shrink-0">
      <CheckIcon />
    </DropdownMenuPrimitive.ItemIndicator>
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioSelectItem.displayName = "DropdownMenuRadioSelectItem";

/**
 * Figma Checkbox Menu Item. Renamed from DropdownMenuCheckboxItem
 * (BREAKING, major).
 *
 * The leading checkbox is the package's own Checkbox rendered INERT: it
 * mirrors the item's checked/disabled, is unfocusable and aria-hidden (the
 * item already announces as menuitemcheckbox), and pointer-events-none — an
 * element that never receives the pointer never gets :hover/:active, so the
 * item alone owns those states.
 *
 * Under selectType=multi the menu stays open: the consumer's onSelect runs
 * first, then preventDefault (Radix's public keep-open API) unless they
 * already prevented it.
 *
 * The inert Checkbox needs `data-disabled:opacity-100!` (Tailwind v4
 * important suffix): plain `opacity-100` loses the cascade to the Checkbox's
 * OWN `ds-radix-data-disabled` rule (Checkbox.tsx:46), which would multiply
 * with the item's opacity and double-fade the box under the already-faded
 * disabled item.
 */
const DropdownMenuMultiSelectItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, disabled, onSelect, ...props }, ref) => {
  const { selectType } = useContext(DropdownMenuPresentationContext);

  const handleSelect = (event: Event) => {
    onSelect?.(event);
    if (selectType === DropdownMenuSelectType.multi && !event.defaultPrevented) {
      event.preventDefault();
    }
  };

  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      checked={checked}
      disabled={disabled}
      onSelect={handleSelect}
      className={cn(itemBase, className)}
      {...props}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        variant={CheckboxVariant.primary}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none ml-xxxs data-disabled:opacity-100!"
      />
      <span className="flex flex-1 items-center gap-sm">{children}</span>
    </DropdownMenuPrimitive.CheckboxItem>
  );
});
DropdownMenuMultiSelectItem.displayName = "DropdownMenuMultiSelectItem";

const DropdownMenuLabel = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "flex h-[30px] items-center px-xs",
      "text-style-label text-text-secondary",
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
    className={cn("h-px bg-border-popovers", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export interface DropdownMenuSegmentProps extends HTMLAttributes<HTMLDivElement> {
  /** divider (default) or labeled — a labeled segment shows `children` as its label. */
  variant?: DropdownMenuSegmentVariant;
}

/** Figma Menu Segment — place directly in DropdownMenuContent, between sections. */
const DropdownMenuSegment = forwardRef<HTMLDivElement, DropdownMenuSegmentProps>(
  ({ className, variant = DropdownMenuSegmentVariant.divider, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex w-full flex-col gap-xs", className)} {...props}>
      <DropdownMenuSeparator />
      {variant === DropdownMenuSegmentVariant.labeled ? (
        <div className="flex ds-px-ui-xs">
          <DropdownMenuLabel>{children}</DropdownMenuLabel>
        </div>
      ) : null}
    </div>
  ),
);
DropdownMenuSegment.displayName = "DropdownMenuSegment";

export interface DropdownMenuSectionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Explicit width (a design value → inline style; numbers are px). Omit to
   * hug the widest item. Items stretch to fill it and never drop below their
   * own 160px floor.
   */
  width?: string | number;
}

/** Inset group for items and labels (Figma Menu Items Section). Content has no horizontal padding so separators and segments span full width. */
const DropdownMenuSection = forwardRef<HTMLDivElement, DropdownMenuSectionProps>(
  ({ className, width, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col ds-px-ui-xs", className)}
      style={width === undefined ? style : { ...style, width }}
      {...props}
    />
  ),
);
DropdownMenuSection.displayName = "DropdownMenuSection";

export {
  DropdownMenuRoot as DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuMultiSelectItem,
  DropdownMenuPlainItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioSelectItem,
  DropdownMenuSection,
  DropdownMenuSegment,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuTrigger,
};
