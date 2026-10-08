import type { ComponentPropsWithoutRef } from "react";
import { Button, type CopyButtonProps } from "@dooph-software/design-system";
type IsAny<T> = 0 extends 1 & T ? "any" : "not-any";
type BtnProps = ComponentPropsWithoutRef<typeof Button>;
const x1: IsAny<CopyButtonProps["onClick"]> = "not-any";
const x2: IsAny<CopyButtonProps["foo" & keyof CopyButtonProps]> = "not-any";
const x3: IsAny<BtnProps["href"]> = "not-any";
const x4: keyof CopyButtonProps = "zzz-not-a-prop";
export { x1, x2, x3, x4 };
