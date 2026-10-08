import { MorphRotationShape, CloverShape, PuffShape, MorphRotationShapeMode } from "@dooph-software/design-system";
export const A = () => <MorphRotationShape mode={MorphRotationShapeMode.autoplay} shapes={[CloverShape, PuffShape]} />;
// @ts-expect-error — mode omitted with shapes present
export const B = () => <MorphRotationShape shapes={[CloverShape, PuffShape]} />;
