"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";
import { BaseText, TextVariant, type BaseTextProps } from "../Text";

// TooltipTypes (+ its type) lives in ./constants (server-safe), re-exported via
// index.ts; imported here for internal variant resolution.
import { TooltipTypes } from "./constants";

const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const tooltipThemeClass = {
  inverse: "ds-tooltip-inverse-theme",
  matching: "ds-tooltip-matching-theme",
} as const;

const TooltipProvider = ({
  delayDuration = 250,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
);

export interface TooltipContentProps extends ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> {
  variant?: TooltipTypes;
  themeInverse?: boolean;
  portal?: boolean;
  portalProps?: ComponentPropsWithoutRef<typeof TooltipPrimitive.Portal>;
}

const TooltipContent = forwardRef<
  ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      variant = TooltipTypes.simple,
      themeInverse = true,
      portal = true,
      portalProps,
      sideOffset = 6,
      ...props
    },
    ref,
  ) => {
    const content = (
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 shadow-menu outline-none",
          "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=delayed-open]:duration-100",
          "data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0 data-[state=instant-open]:zoom-in-95 data-[state=instant-open]:duration-100",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150",
          "motion-reduce:data-[state=delayed-open]:duration-0 motion-reduce:data-[state=instant-open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
          tooltipThemeClass[themeInverse ? "inverse" : "matching"],
          variant === TooltipTypes.simple &&
            "inline-flex h-button-sm items-center whitespace-nowrap rounded-tight border border-solid px-md text-style-body",
          variant === TooltipTypes.rich &&
            "flex max-w-[175px] flex-col gap-xs rounded-tight border border-solid px-3 py-sm wrap-break-word",
          variant === TooltipTypes.complex &&
            "min-w-[242px] rounded-standard border border-solid",
          className,
        )}
        {...props}
      />
    );

    if (!portal) {
      return content;
    }

    return (
      <TooltipPrimitive.Portal {...portalProps}>
        {content}
      </TooltipPrimitive.Portal>
    );
  },
);
TooltipContent.displayName = "TooltipContent";

export type TooltipTitleProps = Omit<BaseTextProps, "variant">;
const TooltipTitle = forwardRef<HTMLElement, TooltipTitleProps>(
  (props, ref) => (
    <BaseText ref={ref} variant={TextVariant.label} {...props} />
  ),
);
TooltipTitle.displayName = "TooltipTitle";

export type TooltipBodyProps = Omit<BaseTextProps, "variant">;
const TooltipBody = forwardRef<HTMLElement, TooltipBodyProps>(
  ({ className, ...props }, ref) => (
    <BaseText
      ref={ref}
      variant={TextVariant.body}
      className={className}
      {...props}
    />
  ),
);
TooltipBody.displayName = "TooltipBody";

export {
  Tooltip,
  TooltipBody,
  TooltipContent,
  TooltipProvider,
  TooltipTitle,
  TooltipTrigger,
};
