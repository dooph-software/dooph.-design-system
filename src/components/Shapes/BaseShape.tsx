import type { FunctionComponent, ReactNode } from "react";
import { BaseIcon, type IconProps } from "../Icons";

/** Shape props plus the icon's `<svg>` passthrough (`className`, `aria-*`,
 *  `id`, handlers, `style`, `ref`). Shapes size by `size` and paint by
 *  fill/stroke, so the icon's `size`/`strokeWidth`/`color` are replaced, not
 *  inherited. */
export interface ShapeProps
  extends Omit<IconProps, "size" | "strokeWidth" | "color" | "children"> {
  /** px number, or any CSS length — e.g. a `var(--ui-size-*)` token. */
  size: number | string;
  strokeColor?: string;
  fillColor?: string;
  strokeWeight?: number | string;
}

declare const dsShape: unique symbol;

/** One of the DS shapes, as built by createShape. The brand is type-only (no
 *  runtime marker). It lets `shapes` props reject components getShapePath
 *  cannot map, such as `memo(CloverShape)` or a hand-written shape, at compile
 *  time instead of throwing during render. */
export type DsShapeComponent = FunctionComponent<ShapeProps> & {
  readonly [dsShape]: true;
};

type BaseShapeProps = ShapeProps & {
  children?: ReactNode;
};

export const SHAPE_VIEWBOX_SIZE = 24;

type ShapeClipPathProps = {
  id: string;
  fillColor?: string;
};

export const ShapeClipPath = ({
  id,
  fillColor = "currentColor",
}: ShapeClipPathProps) => (
  <clipPath id={id}>
    <rect
      width={SHAPE_VIEWBOX_SIZE}
      height={SHAPE_VIEWBOX_SIZE}
      fill={fillColor}
    />
  </clipPath>
);

const getStrokeInsetTransform = (strokeWeight: number | string) => {
  const parsedStrokeWeight =
    typeof strokeWeight === "number"
      ? strokeWeight
      : Number.parseFloat(strokeWeight);

  if (!Number.isFinite(parsedStrokeWeight) || parsedStrokeWeight <= 0) {
    return undefined;
  }

  const inset = parsedStrokeWeight / 2;
  const scale = (SHAPE_VIEWBOX_SIZE - inset * 2) / SHAPE_VIEWBOX_SIZE;

  return `translate(${inset} ${inset}) scale(${scale})`;
};

export const BaseShape = ({
  size,
  strokeColor,
  fillColor,
  strokeWeight = "1px",
  children,
  ...rest
}: BaseShapeProps) => {
  return (
    <BaseIcon
      // First, so the shape's own size, stroke and fill below still win.
      {...rest}
      size={size}
      strokeColor={strokeColor}
      fillColor={fillColor}
      strokeWidth={strokeWeight}
    >
      <g transform={getStrokeInsetTransform(strokeWeight)}>{children}</g>
    </BaseIcon>
  );
};
