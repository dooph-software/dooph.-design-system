import { createRef } from "react";
import { RollingDigitsText, LabelText, BaseText, FadeChangeText } from "../../../../../../dooph-ds-audit-build/dist/index.js";
const r = createRef<HTMLSpanElement>();
export const a = <RollingDigitsText ref={r}>{"$1.00"}</RollingDigitsText>;
export const b = <RollingDigitsText smallDecimals smallDecimalsComponent={LabelText}>{"$1.00"}</RollingDigitsText>;
// @ts-expect-error smallDecimals without component must fail
export const c = <RollingDigitsText smallDecimals>{"$1.00"}</RollingDigitsText>;
export const d = <BaseText as="label" htmlFor="x">x</BaseText>;
export const e = <FadeChangeText style={{ color: "red" }}>x</FadeChangeText>;
