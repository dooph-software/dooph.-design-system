import type { FunctionComponent } from "react";
import { BaseShape, type DsShapeComponent, type ShapeProps } from "./BaseShape";

/** The one render for every DS shape: a single `<path d>` in the 24-unit
 *  viewBox. The path carries no `fill`; it inherits BaseIcon's
 *  `<svg style="fill: …">`, so `fillColor` always applies. Call it once per
 *  shape at module level: getShapePath keys on the returned identity. */
export const createShape = (d: string, displayName: string): DsShapeComponent => {
  const Shape: FunctionComponent<ShapeProps> = ({ fillColor = "currentColor", ...props }) => (
    <BaseShape {...props} fillColor={fillColor}>
      <path d={d} />
    </BaseShape>
  );
  Shape.displayName = displayName;
  return Shape as DsShapeComponent;
};
