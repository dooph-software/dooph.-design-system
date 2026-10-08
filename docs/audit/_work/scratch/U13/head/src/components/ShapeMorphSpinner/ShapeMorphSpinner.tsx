/*
 * ShapeMorphSpinner — the indeterminate loader: MorphRotationShape in
 * `autoplay` mode with role="progressbar", the spinner size scale, and the
 * spinner colour aliases. Sizes render from --ui-size-spinner-* (never a JS
 * size table), so overriding those tokens resizes it.
 */
import type { ComponentPropsWithoutRef, ComponentType } from "react";
import { cn } from "../../utils/cn";
import { LoadingSpinnerColor, LoadingSpinnerSize } from "../LoadingSpinner/constants";
import { MorphRotationShape } from "../MorphRotationShape/MorphRotationShape";
import { MorphRotationShapeMode } from "../MorphRotationShape/constants";
import type { MorphRotationShapeAutoplayTiming } from "../MorphRotationShape/timing";
import type { ShapeProps } from "../Shapes/BaseShape";
import {
  CapsuleShape,
  CloverShape,
  CookieShape,
  PentagonShape,
  PuffShape,
  SquircleShape,
} from "../Shapes";

/** Default loader sequence. */
export const SHAPE_MORPH_SPINNER_SHAPES: ComponentType<ShapeProps>[] = [
  CookieShape,
  CloverShape,
  PuffShape,
  SquircleShape,
  PentagonShape,
  CapsuleShape,
];

const COLOR_TOKENS: Record<LoadingSpinnerColor, string> = {
  primary: "var(--ui-color-primary)",
  prominent: "var(--ui-color-prominent)",
};

export type ShapeMorphSpinnerProps = Omit<ComponentPropsWithoutRef<"span">, "children" | "color"> & {
  size?: LoadingSpinnerSize;
  /** Preset alias or any CSS colour. */
  color?: LoadingSpinnerColor | (string & {});
  /** DS shape components, at least two. */
  shapes?: ComponentType<ShapeProps>[];
  timing?: MorphRotationShapeAutoplayTiming;
};

export const ShapeMorphSpinner = ({
  size = LoadingSpinnerSize.md,
  color = LoadingSpinnerColor.primary,
  shapes = SHAPE_MORPH_SPINNER_SHAPES,
  timing,
  className,
  style,
  "aria-label": ariaLabel = "Loading",
  ...rest
}: ShapeMorphSpinnerProps) => (
  <MorphRotationShape
    mode={MorphRotationShapeMode.autoplay}
    shapes={shapes}
    timing={timing}
    role="progressbar"
    aria-label={ariaLabel}
    className={cn("inline-block shrink-0", className)}
    style={{
      width: `var(--ui-size-spinner-${size})`,
      height: `var(--ui-size-spinner-${size})`,
      color: COLOR_TOKENS[color as LoadingSpinnerColor] ?? color,
      ...style,
    }}
    {...rest}
  />
);
