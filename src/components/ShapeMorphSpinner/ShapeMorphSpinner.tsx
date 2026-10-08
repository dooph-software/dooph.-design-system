/*
 * ShapeMorphSpinner — the indeterminate loader: MorphRotationShape in
 * `autoplay` mode with role="progressbar", the spinner size scale, and the
 * shared DS colour names (resolveDsColor). Sizes render from
 * --ui-size-spinner-* (never a JS size table), so overriding those tokens
 * resizes it.
 */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../utils/cn";
import { resolveDsColor, type DsColor } from "../../utils/color";
import { LoadingSpinnerColor, LoadingSpinnerSize } from "../LoadingSpinner/constants";
import { MorphRotationShape } from "../MorphRotationShape/MorphRotationShape";
import { MorphRotationShapeMode } from "../MorphRotationShape/constants";
import type { MorphRotationShapeAutoplayTiming } from "../MorphRotationShape/timing";
import { Shapes } from "../Shapes";
import type { DsShapeComponent } from "../Shapes/BaseShape";
import { getShapeComponent, type ShapeInput } from "../Shapes/shapePaths";

/** Default loader sequence as `Shapes` keys: serialisable, so this module stays
 *  neutral (no "use client") and still renders from a Server Component. */
const DEFAULT_SHAPE_KEYS: readonly Shapes[] = [
  Shapes.cookie,
  Shapes.clover,
  Shapes.puff,
  Shapes.squircle,
  Shapes.pentagon,
  Shapes.capsule,
];

/** Default loader sequence. */
export const SHAPE_MORPH_SPINNER_SHAPES: readonly DsShapeComponent[] = DEFAULT_SHAPE_KEYS.map(getShapeComponent);

export type ShapeMorphSpinnerProps = Omit<ComponentPropsWithoutRef<"span">, "children" | "color"> & {
  size?: LoadingSpinnerSize;
  /** A DS colour name (DS_COLOR_TOKENS key) or any CSS colour. */
  color?: DsColor;
  /** DS shapes (components or `Shapes` keys), at least two. Keys are the form a
   *  Server Component can pass. */
  shapes?: readonly ShapeInput[];
  timing?: MorphRotationShapeAutoplayTiming;
};

export const ShapeMorphSpinner = forwardRef<HTMLSpanElement, ShapeMorphSpinnerProps>(
  (
    {
      size = LoadingSpinnerSize.rg,
      color = LoadingSpinnerColor.primary,
      shapes = DEFAULT_SHAPE_KEYS,
      timing,
      className,
      style,
      "aria-label": ariaLabel = "Loading",
      ...rest
    },
    ref,
  ) => (
    <MorphRotationShape
      ref={ref}
      mode={MorphRotationShapeMode.autoplay}
      shapes={shapes}
      timing={timing}
      role="progressbar"
      aria-label={ariaLabel}
      className={cn("inline-block shrink-0", className)}
      style={{
        width: `var(--ui-size-spinner-${size})`,
        height: `var(--ui-size-spinner-${size})`,
        color: resolveDsColor(color, "var(--ui-color-primary)"),
        ...style,
      }}
      {...rest}
    />
  ),
);
ShapeMorphSpinner.displayName = "ShapeMorphSpinner";
