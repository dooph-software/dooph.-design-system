import { ARROW_SHAPE_PATH, ArrowShape } from "./ArrowShape";
import type { DsShapeComponent } from "./BaseShape";
import { CAPSULE_SHAPE_PATH, CapsuleShape } from "./CapsuleShape";
import { CLOVER_SHAPE_PATH, CloverShape } from "./CloverShape";
import { Shapes } from "./constants";
import { COOKIE_SHAPE_PATH, CookieShape } from "./CookieShape";
import { DIAMOND_SHAPE_PATH, DiamondShape } from "./DiamondShape";
import { DOUBLE_SHAPE_PATH, DoubleShape } from "./DoubleShape";
import {
  EIGHT_LEAF_CLOVER_SHAPE_PATH,
  EightLeafCloverShape,
} from "./EightLeafCloverShape";
import { PENTAGON_SHAPE_PATH, PentagonShape } from "./PentagonShape";
import { PIXIRCLE_SHAPE_PATH, PixircleShape } from "./PixircleShape";
import { PUFF_SHAPE_PATH, PuffShape } from "./PuffShape";
import { SQUIRCLE_SHAPE_PATH, SquircleShape } from "./SquircleShape";
import { STAR_SHAPE_PATH, StarShape } from "./StarShape";
import { TRIPLE_SHAPE_PATH, TripleShape } from "./TripleShape";

/** A DS shape as MorphRotationShape accepts it: the component, or its `Shapes`
 * key (the serialisable form a Server Component can pass to the client
 * MorphRotationShape). */
export type ShapeInput = DsShapeComponent | Shapes;

/** `Shapes` key -> component and outline in the 24-unit viewBox, one entry per
 * DS shape (`satisfies` makes a missing key a compile error). Lets
 * MorphRotationShape take components or keys without rendering them. */
const SHAPE_TABLE = {
  [Shapes.arrow]: [ArrowShape, ARROW_SHAPE_PATH],
  [Shapes.capsule]: [CapsuleShape, CAPSULE_SHAPE_PATH],
  [Shapes.clover]: [CloverShape, CLOVER_SHAPE_PATH],
  [Shapes.cookie]: [CookieShape, COOKIE_SHAPE_PATH],
  [Shapes.diamond]: [DiamondShape, DIAMOND_SHAPE_PATH],
  [Shapes.double]: [DoubleShape, DOUBLE_SHAPE_PATH],
  [Shapes.eightLeafClover]: [EightLeafCloverShape, EIGHT_LEAF_CLOVER_SHAPE_PATH],
  [Shapes.pentagon]: [PentagonShape, PENTAGON_SHAPE_PATH],
  [Shapes.pixircle]: [PixircleShape, PIXIRCLE_SHAPE_PATH],
  [Shapes.puff]: [PuffShape, PUFF_SHAPE_PATH],
  [Shapes.squircle]: [SquircleShape, SQUIRCLE_SHAPE_PATH],
  [Shapes.star]: [StarShape, STAR_SHAPE_PATH],
  [Shapes.triple]: [TripleShape, TRIPLE_SHAPE_PATH],
} satisfies Record<Shapes, readonly [DsShapeComponent, string]>;

const ENTRIES = Object.entries(SHAPE_TABLE) as [Shapes, readonly [DsShapeComponent, string]][];
const PATH_BY_COMPONENT = new Map<DsShapeComponent, string>(ENTRIES.map(([, [component, d]]) => [component, d]));
const PATH_BY_NAME = new Map<string, string>(ENTRIES.map(([name, [, d]]) => [name, d]));
const COMPONENT_BY_NAME = new Map<string, DsShapeComponent>(ENTRIES.map(([name, [component]]) => [name, component]));

/** The outline of a DS shape, from its component or its `Shapes` key. Throws
 * for anything else: a JS caller or an `as` cast can still pass a wrapper. */
export function getShapePath(shape: ShapeInput): string {
  const d = typeof shape === "string" ? PATH_BY_NAME.get(shape) : PATH_BY_COMPONENT.get(shape);
  if (!d) {
    const label = typeof shape === "string" ? `"${shape}"` : shape.displayName || shape.name || "component";
    throw new Error(`${label} is not a DS shape; pass a component from Shapes/ or a Shapes key.`);
  }
  return d;
}

/** The component for a `Shapes` key (lets one key list also serve as a component list). */
export function getShapeComponent(name: Shapes): DsShapeComponent {
  const component = COMPONENT_BY_NAME.get(name);
  if (!component) throw new Error(`"${name}" is not a DS shape name.`);
  return component;
}
