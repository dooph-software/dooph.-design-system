/*
 * ShapeButton — icon button whose background is an organic SVG shape.
 *
 * ## behavior
 * - `shape` picks a primitive from `Shapes/`; `variant` picks a color family.
 * - The shape SVG is painted by `currentColor` on its own wrapper span, so the
 *   bg/hover/active states are plain `text-*` utilities on that span rather
 *   than fills threaded through the SVG as props.
 * - The icon slot carries the CONTENT color separately, because the shape span
 *   has already spent `currentColor` on the fill.
 *
 * ## constraints
 * - `shapeComponents` must stay keyed by `ShapeButtons`, which `satisfies
 *   Record<string, Shapes>` — the shape rendered here is the same primitive
 *   `Shapes/` exports, never a re-drawn copy of it. Figma's ShapeButton
 *   variants embed their own flattened SVGs; those are not the source of truth.
 */
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
  CloverShape,
  CookieShape,
  DiamondShape,
  PuffShape,
  SquircleShape,
} from "../Shapes";
import { ShapeButtons, ShapeButtonVariant } from "./constants";

// ShapeButtons / ShapeButtonVariant live in ./constants — kept server-safe (no
// "use client") so RSC code can read the enum values. Re-exported via index.ts.

type ShapeButtonOwnProps = {
  shape?: ShapeButtons;
  variant?: ShapeButtonVariant;
  asChild?: boolean;
};

type ShapeComponentProps = {
  size: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWeight?: number | string;
};

const shapeComponents = {
  clover: CloverShape,
  cookie: CookieShape,
  diamond: DiamondShape,
  puff: PuffShape,
  squircle: SquircleShape,
} satisfies Record<ShapeButtons, ComponentType<ShapeComponentProps>>;

const SHAPE_SIZE = 46;

/** Fill colors for the shape span — `currentColor` is the shape's paint. */
const shapeFillClasses = {
  prominent: [
    "text-prominent",
    "group-hover:text-prominent-hover",
    "group-active:text-prominent-active",
  ],
  primary: [
    "text-primary",
    "group-hover:text-primary-hover",
    "group-active:text-primary-active",
  ],
} satisfies Record<ShapeButtonVariant, string[]>;

/** Content color for the icon slot, applied to the root so children inherit. */
const contentClasses = {
  prominent: "text-prominent-fg",
  primary: "text-primary-fg",
} satisfies Record<ShapeButtonVariant, string>;

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
 *
 * @example
 * <ShapeButton shape={ShapeButtons.squircle} variant={ShapeButtonVariant.prominent}>
 *   <SendIcon />
 * </ShapeButton>
 */
const ShapeButtonBase = forwardRef<HTMLElement, ShapeButtonProps<ElementType>>(
  (
    {
      className,
      shape = ShapeButtons.clover,
      variant = ShapeButtonVariant.prominent,
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = (asChild ? Slot : "button") as ElementType;
    const Shape = shapeComponents[shape as ShapeButtons];
    const resolvedVariant = variant as ShapeButtonVariant;

    return (
      <Comp
        ref={ref as ForwardedRef<HTMLElement>}
        className={cn(
          "group relative inline-flex items-center justify-center",
          "size-[46px] cursor-pointer select-none",
          "outline-none ds-shape-button-focus-visible",
          "ds-disabled-state",
          contentClasses[resolvedVariant],
          className,
        )}
        {...props}
      >
        {/* Shape background SVG — painted by currentColor on this span */}
        <span
          className={cn(
            "ds-shape-button-shadow absolute inset-0 flex items-center justify-center",
            shapeFillClasses[resolvedVariant],
            "group-disabled:text-secondary-disabled",
          )}
          aria-hidden
        >
          <Shape
            size={SHAPE_SIZE}
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
