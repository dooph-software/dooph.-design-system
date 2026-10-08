"use client";

import { Slot } from "@radix-ui/react-slot";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ComponentType,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
} from "react";
import { cn } from "../../utils/cn";
import {
  ArrowShape,
  CloverShape,
  CookieShape,
  GemShape,
  PuffShape,
  StarShape,
} from "../Shapes";
import { ShapeButtons } from "./constants";

// ShapeButtons lives in ./constants — kept server-safe (no "use client") so RSC
// code can read the enum values. Re-exported via index.ts.

type ShapeButtonOwnProps = {
  shape?: ShapeButtons;
  asChild?: boolean;
};

type ShapeComponentProps = {
  size: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWeight?: number | string;
};

const shapeComponents = {
  arrow: ArrowShape,
  clover: CloverShape,
  cookie: CookieShape,
  gem: GemShape,
  puff: PuffShape,
  star: StarShape,
} satisfies Record<ShapeButtons, ComponentType<ShapeComponentProps>>;

export type ShapeButtonProps<TElement extends ElementType = "button"> =
  ShapeButtonOwnProps &
    Omit<ComponentPropsWithoutRef<TElement>, keyof ShapeButtonOwnProps>;

type ShapeButtonComponent = <TElement extends ElementType = "button">(
  props: ShapeButtonProps<TElement> & {
    ref?: ComponentPropsWithRef<TElement>["ref"];
  },
) => ReactElement | null;

/**
 * An icon button with an organic SVG shape background.
 * The shape fill and stroke follow secondary-button token states.
 * Pentagon remains in `Shapes/` but is not offered on ShapeButton.
 *
 * @example
 * <ShapeButton shape={ShapeButtons.gem}>
 *   <StarIcon className="size-4" />
 * </ShapeButton>
 */
const ShapeButtonBase = forwardRef<HTMLElement, ShapeButtonProps<ElementType>>(
  (
    { className, shape = ShapeButtons.clover, asChild = false, children, ...props },
    ref,
  ) => {
    const Comp = (asChild ? Slot : "button") as ElementType;
    const Shape = shapeComponents[shape as ShapeButtons];

    return (
      <Comp
        ref={ref as ForwardedRef<HTMLElement>}
        className={cn(
          "group relative inline-flex items-center justify-center",
          "size-[46px] cursor-pointer select-none",
          "outline-none ds-shape-button-focus-visible",
          "ds-disabled-state",
          className,
        )}
        {...props}
      >
        {/* Shape background SVG — styled with secondary button tokens */}
        <span
          className={cn(
            "ds-shape-button-shadow absolute inset-0 flex items-center justify-center text-secondary",
            "group-hover:text-secondary-hover",
            "group-active:text-secondary-active",
            "group-disabled:text-secondary-disabled",
          )}
          aria-hidden
        >
          <Shape
            size={46}
            strokeColor="transparent"
            fillColor="currentColor"
          />
        </span>

        {/* Icon slot — centered within the shape */}
        <span className="relative z-10 inline-flex items-center justify-center">
          {children}
        </span>
      </Comp>
    );
  },
);

ShapeButtonBase.displayName = "ShapeButton";

const ShapeButton = ShapeButtonBase as ShapeButtonComponent;

export { ShapeButton };
