// WI-C7-53 type probe (F-089 item 1). Retarget the two dist paths in tsconfig.53.json to a scratch-worktree build.
// Today: tsc reports TS2578 "Unused '@ts-expect-error' directive" on the two `bad` lines (the wide type accepts them).
import { memo, type ComponentType } from "react";
import {
  CloverShape, PuffShape, MorphRotationShape, MorphRotationShapeMode, ShapeMorphSpinner, type ShapeProps,
} from "@dooph-software/design-system";
export const ok1 = <MorphRotationShape mode={MorphRotationShapeMode.autoplay} shapes={[CloverShape, PuffShape]} />;
export const ok2 = <ShapeMorphSpinner shapes={[CloverShape, PuffShape]} />;
export const ok3: ComponentType<ShapeProps> = CloverShape;
export const ok4 = <CloverShape size={24} fillColor="red" />;
// @ts-expect-error a memo wrapper is not a DS shape (throws "is not a DS shape" at render)
export const bad1 = <MorphRotationShape mode={MorphRotationShapeMode.autoplay} shapes={[memo(CloverShape), PuffShape]} />;
// @ts-expect-error a hand-written component is not a DS shape
export const bad2 = <ShapeMorphSpinner shapes={[(p: ShapeProps) => null, PuffShape]} />;
