import { MorphRotationShape, MorphRotationShapeMode, CTAButton, CTAButtonVariant, CTAButtonSize, CloverShape, PuffShape } from "@dooph-software/design-system";
export const A = () => <MorphRotationShape mode={MorphRotationShapeMode.autoplay} />;
export const B = () => <CTAButton variant={CTAButtonVariant.primary} size={CTAButtonSize.big}>Label</CTAButton>;
export const C = () => <MorphRotationShape mode={MorphRotationShapeMode.autoplay} shapes={[CloverShape, PuffShape]} />;
export const D = () => <CTAButton text="Label" icon={<span />} />;
