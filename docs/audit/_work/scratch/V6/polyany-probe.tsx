import type { ElementType, PropsWithoutRef } from "react";
import type { ButtonProps } from "../../../../../src/components/Button/Button";
import type { OutlineButtonProps } from "../../../../../src/components/OutlineButton/OutlineButton";
declare const b: PropsWithoutRef<ButtonProps<ElementType>>;
declare const o: PropsWithoutRef<OutlineButtonProps<ElementType>>;
const { varaint } = b;            // typo
const { themeInverseRenamed } = o; // stale name
const n: number = b.variant;       // wrong type
declare const c: PropsWithoutRef<ButtonProps<"button">>;
// @ts-expect-error control: concrete element must reject a typo
const { varaint2 } = c;
export { varaint, themeInverseRenamed, n, varaint2 };
