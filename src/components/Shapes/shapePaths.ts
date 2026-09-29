import type { ComponentType } from "react";
import { ARROW_SHAPE_PATH, ArrowShape } from "./ArrowShape";
import type { ShapeProps } from "./BaseShape";
import { CAPSULE_SHAPE_PATH, CapsuleShape } from "./CapsuleShape";
import { CLOVER_SHAPE_PATH, CloverShape } from "./CloverShape";
import { COOKIE_SHAPE_PATH, CookieShape } from "./CookieShape";
import { DIAMOND_SHAPE_PATH, DiamondShape } from "./DiamondShape";
import { DOUBLE_SHAPE_PATH, DoubleShape } from "./DoubleShape";
import { PENTAGON_SHAPE_PATH, PentagonShape } from "./PentagonShape";
import { PIXIRCLE_SHAPE_PATH, PixircleShape } from "./PixircleShape";
import { PUFF_SHAPE_PATH, PuffShape } from "./PuffShape";
import { SQUIRCLE_SHAPE_PATH, SquircleShape } from "./SquircleShape";
import { STAR_SHAPE_PATH, StarShape } from "./StarShape";
import { TRIPLE_SHAPE_PATH, TripleShape } from "./TripleShape";

/** Component -> its outline in the 24-unit viewBox. Lets MorphRotationShape
 * take components without rendering them. */
const SHAPE_PATHS = new Map<ComponentType<ShapeProps>, string>([
  [ArrowShape, ARROW_SHAPE_PATH],
  [CapsuleShape, CAPSULE_SHAPE_PATH],
  [CloverShape, CLOVER_SHAPE_PATH],
  [CookieShape, COOKIE_SHAPE_PATH],
  [DiamondShape, DIAMOND_SHAPE_PATH],
  [DoubleShape, DOUBLE_SHAPE_PATH],
  [PentagonShape, PENTAGON_SHAPE_PATH],
  [PixircleShape, PIXIRCLE_SHAPE_PATH],
  [PuffShape, PUFF_SHAPE_PATH],
  [SquircleShape, SQUIRCLE_SHAPE_PATH],
  [StarShape, STAR_SHAPE_PATH],
  [TripleShape, TRIPLE_SHAPE_PATH],
]);

export function getShapePath(Component: ComponentType<ShapeProps>): string {
  const d = SHAPE_PATHS.get(Component);
  if (!d) {
    throw new Error(
      `${Component.displayName || Component.name || "component"} is not a DS shape; pass a component from Shapes/.`,
    );
  }
  return d;
}
