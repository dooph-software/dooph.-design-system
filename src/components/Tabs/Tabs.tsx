import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";

const TabsRoot = TabsPrimitive.Root;

const TabsList = forwardRef<
  ComponentRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("inline-flex items-center gap-1", className)}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const tabTriggerVariants = cva(
  [
    "inline-flex items-center justify-center gap-0 whitespace-nowrap",
    "rounded-tight border border-transparent",
    "text-style-button cursor-pointer select-none",
    "transition-all duration-150 ease-out",
    "ds-focus-visible-ring focus-visible:border-border-focus",
    "ds-disabled-control",
  ],
  {
    variants: {
      variant: {
        /**
         * Ghost â€” transparent background, subtle hover/active.
         * Default style for most tab lists.
         */
        ghost: [
          "text-ghost-fg",
          "hover:bg-ghost-hover hover:text-ghost-fg-active",
          "data-[state=active]:bg-ghost-active data-[state=active]:text-ghost-fg-active",
        ],
        /**
         * Primary â€” dark filled background on hover and when active.
         * White text in active/hover state; dark text at rest.
         */
        primary: [
          "text-text",
          "[&:not(:disabled):not([aria-disabled=true]):not([data-state=active])]:hover:bg-ghost-hover [&:not(:disabled):not([aria-disabled=true]):not([data-state=active])]:hover:text-ghost-fg-active",
          "[&:not(:disabled):not([aria-disabled=true]):not([data-state=active])]:active:bg-ghost-active [&:not(:disabled):not([aria-disabled=true]):not([data-state=active])]:active:text-ghost-fg-active",
          "data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:text-primary-fg",
          "disabled:bg-primary-disabled disabled:border-primary-disabled",
        ],
      },
      size: {
        default: "h-button px-4",
        /** Standard icon-only tab (38Ã—38) */
        icon: "size-button p-0",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  },
);

/**
 * Dot-accessible tab size constant.
 * Usage: <TabsTrigger size={TabSize.icon} />
 */
export const TabSize = {
  default: "default",
  icon: "icon",
} as const;
export type TabSize = (typeof TabSize)[keyof typeof TabSize];

/**
 * Dot-accessible tab variant constant.
 * Usage: <TabsTrigger variant={TabVariant.primary} />
 */
export const TabVariant = {
  ghost: "ghost",
  primary: "primary",
} as const;
export type TabVariant = (typeof TabVariant)[keyof typeof TabVariant];

export interface TabsTriggerProps
  extends
    ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabTriggerVariants> {}

const TabsTrigger = forwardRef<
  ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, size, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabTriggerVariants({ size, variant }), className)}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = forwardRef<
  ComponentRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("focus-visible:outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { TabsRoot as Tabs, TabsContent, TabsList, TabsTrigger, tabTriggerVariants };
