import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";
import { ButtonText } from "../Text";
import { toggleOptionVariants } from "../Toggle/toggleOption";
import type { TabSize, TabVariant } from "./constants";

const TabsRoot = TabsPrimitive.Root;

const TabsList = forwardRef<
  ComponentRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("inline-flex items-center gap-xxs", className)}
    {...props}
  />
));
TabsList.displayName = "TabsList";

/** Kept under its historical name: TabsTrigger IS the Figma Toggle Option. */
const tabTriggerVariants = toggleOptionVariants;

// TabSize / TabVariant (+ their types) live in ./constants — kept server-safe
// (no "use client") so RSC code can read the enum values. Re-exported via index.ts.

/* `size` / `variant` are typed from the `TabSize` / `TabVariant` consts, not
 * cva's `VariantProps`: that admits `null`, which cva reads as "no variant"
 * (an unsized or unfilled tab). */
export interface TabsTriggerProps
  extends ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** Defaults to `standard`. */
  size?: TabSize;
  /** Defaults to `ghost`. */
  variant?: TabVariant;
}

const TabsTrigger = forwardRef<
  ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, size, variant, ...props }, ref) => (
  <ButtonText
    as={TabsPrimitive.Trigger}
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
    className={cn("ds-focus-visible-ring", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { TabsRoot as Tabs, TabsContent, TabsList, TabsTrigger, tabTriggerVariants };
