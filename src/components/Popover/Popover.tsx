"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverPortal = PopoverPrimitive.Portal;
const PopoverClose = PopoverPrimitive.Close;

export type PopoverContentProps = ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> & {
  /** Render into a portal. Default true; set false to keep the panel inline. */
  portal?: boolean;
  portalProps?: ComponentPropsWithoutRef<typeof PopoverPrimitive.Portal>;
};

const PopoverContent = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    {
      className,
      align = "start",
      sideOffset = 4,
      collisionPadding = 8,
      portal = true,
      portalProps,
      ...props
    },
    ref,
  ) => {
    const content = (
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-50 overflow-hidden rounded-standard",
          "border border-solid border-border-primary bg-surface-primary shadow-button",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "ds-radix-popover-content-origin",
          className,
        )}
        {...props}
      />
    );

    return portal ? (
      <PopoverPrimitive.Portal {...portalProps}>{content}</PopoverPrimitive.Portal>
    ) : (
      content
    );
  },
);
PopoverContent.displayName = "PopoverContent";

export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
};
