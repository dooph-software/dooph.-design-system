import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";
import { BaseText, TextVariant, type BaseTextProps } from "../Text";

// TooltipVariant (+ its type) lives in ./constants (server-safe), re-exported via
// index.ts; imported here for internal variant resolution.
import { TooltipVariant } from "./constants";

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
  variant?: TooltipVariant;
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
      variant = TooltipVariant.simple,
      themeInverse = true,
      portal = true,
      portalProps,
      sideOffset = 6,
      children,
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
          "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
          "data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0 data-[state=instant-open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "ds-motion-overlay",
          tooltipThemeClass[themeInverse ? "inverse" : "matching"],
          variant === TooltipVariant.simple &&
            "inline-flex h-button-sm items-center whitespace-nowrap rounded-tight border border-solid px-lg",
          variant === TooltipVariant.rich &&
            "flex ds-width-tooltip-rich flex-col gap-sm rounded-tight border border-solid px-md py-rg wrap-break-word",
          variant === TooltipVariant.complex &&
            "ds-min-w-tooltip-complex rounded-normal border border-solid",
          className,
        )}
        {...props}
      >
        {variant === TooltipVariant.simple ? (
          <BaseText variant={TextVariant.body}>{children}</BaseText>
        ) : (
          children
        )}
      </TooltipPrimitive.Content>
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
const TooltipBody = forwardRef<HTMLElement, TooltipBodyProps>((props, ref) => (
  <BaseText ref={ref} variant={TextVariant.body} {...props} />
));
TooltipBody.displayName = "TooltipBody";

export {
  Tooltip,
  TooltipBody,
  TooltipContent,
  TooltipProvider,
  TooltipTitle,
  TooltipTrigger,
};
