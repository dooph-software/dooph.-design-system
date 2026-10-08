import type { ReactNode } from "react";
import { BaseIcon } from "../Icons";

export interface ShapeProps {
  size: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWeight?: number | string;
}

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
}: BaseShapeProps) => {
  return (
    <BaseIcon
      size={size}
      strokeColor={strokeColor ?? undefined}
      fillColor={fillColor}
      strokeWidth={strokeWeight}
    >
      <g transform={getStrokeInsetTransform(strokeWeight)}>{children}</g>
    </BaseIcon>
  );
};

export default BaseShape;
