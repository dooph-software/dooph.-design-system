// WI-C7-53 mechanism model: the type-only DS-shape brand, standalone (react types only).
import { memo, type ComponentType, type FunctionComponent } from "react";
interface ShapeProps { size: number; strokeColor?: string; fillColor?: string; strokeWeight?: number | string }
const BaseShape = (p: ShapeProps & { children?: React.ReactNode }) => <svg>{p.children}</svg>;
// --- BaseShape.tsx addition
declare const dsShape: unique symbol;
export type DsShapeComponent = FunctionComponent<ShapeProps> & { readonly [dsShape]: true };
// --- createShape.tsx
export const createShape = (d: string, displayName: string): DsShapeComponent => {
  const Shape: FunctionComponent<ShapeProps> = ({ fillColor = "currentColor", ...props }) => (
    <BaseShape {...props} fillColor={fillColor}><path d={d} /></BaseShape>
  );
  Shape.displayName = displayName;
  return Shape as DsShapeComponent;
};
export const CloverShape = createShape("M0 0Z", "CloverShape");
export const PuffShape = createShape("M0 0Z", "PuffShape");
// --- consumers
type ShapeInput = DsShapeComponent | "clover" | "puff";
declare function Morph(p: { shapes: ShapeInput[] }): null;
const ok1 = <Morph shapes={[CloverShape, PuffShape]} />;
const ok2 = <Morph shapes={["clover", PuffShape]} />;
const ok3: ComponentType<ShapeProps> = CloverShape;            // still a plain component type
const ok4 = <CloverShape size={24} fillColor="red" />;          // still renders as JSX
// @ts-expect-error a memo wrapper is not a DS shape
const bad1 = <Morph shapes={[memo(CloverShape), PuffShape]} />;
// @ts-expect-error a hand-written component is not a DS shape
const bad2 = <Morph shapes={[(p: ShapeProps) => null, PuffShape]} />;
export { ok1, ok2, ok3, ok4, bad1, bad2 };
