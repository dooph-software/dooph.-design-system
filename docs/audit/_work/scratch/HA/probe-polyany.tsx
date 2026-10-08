import type { ElementType, PropsWithoutRef } from "react";
import type { ButtonProps } from "../../../../../src/components/Button/Button";
import type { BaseTextProps } from "../../../../../src/components/Text/BaseText";
import type { ShapeButtonProps } from "../../../../../src/components/ShapeButton/ShapeButton";

// forwardRef<HTMLElement, P<ElementType>> hands its render fn PropsWithoutRef<P<ElementType>>:
declare const b: PropsWithoutRef<ButtonProps<ElementType>>;
declare const t: PropsWithoutRef<BaseTextProps<ElementType>>;
declare const s: PropsWithoutRef<ShapeButtonProps<ElementType>>;
const { varaint } = b;          // misspelled prop: compiles => collapsed to any
const n1: number = b.variant;   // enum prop assigned to number: compiles
const n2: number = t.fontSize;
const n3: Date = s.shape;
// control: concrete element keeps the types
declare const bb: PropsWithoutRef<ButtonProps<"button">>;
const c1: number = bb.variant;  // MUST error (and is the only error)
export { varaint, n1, n2, n3, c1 };
