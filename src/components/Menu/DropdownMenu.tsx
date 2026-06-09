import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from "react";
import { cn } from "../../utils/cn";

/** Non-modal by default so page UI stays interactable while a menu is open. Pass modal={true} for dialog-like focus trapping. */
function DropdownMenuRoot({
  modal = false,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root modal={modal} {...props} />;
}

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuContent = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
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
      focusOnOpen = true,
      matchTriggerWidth = true,
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

    const content = (
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        {...(handleOpenAutoFocus
          ? ({ onOpenAutoFocus: handleOpenAutoFocus } as ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>)
          : {})}
        className={cn(
          "z-50 overflow-hidden rounded-soft border border-solid border-border-strong bg-surface",
          "ds-min-w-menu ds-py-ui-xs",
          "shadow-menu",
          "ds-radix-dropdown-content-origin",
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

const itemBase =
  "relative flex h-button w-full cursor-pointer select-none items-center rounded-tight ds-pl-ui-rg ds-pr-ui-sm ds-radix-data-disabled gap-[10px] text-style-body text-ghost-fg-active outline-none transition-colors duration-100";

const DropdownMenuItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      itemBase,
      "hover:bg-ghost-hover hover:text-ghost-fg-active",
      "data-[highlighted]:bg-ghost-hover data-[highlighted]:text-ghost-fg-active",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M2.5 7L5.5 10L11.5 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DropdownMenuCheckboxItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    checked={checked}
    className={cn(
      itemBase,
      "hover:bg-ghost-hover hover:text-ghost-fg-active",
      "data-[highlighted]:bg-ghost-hover data-[highlighted]:text-ghost-fg-active",
      className,
    )}
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
      "flex h-[30px] items-center",
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
    className={cn("ds-my-ui-xs h-px bg-border-strong", className)}
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
