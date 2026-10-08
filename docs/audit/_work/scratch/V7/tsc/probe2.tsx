import { CopyButton, type CopyButtonProps } from "@dooph-software/design-system";
import type { ComponentProps } from "react";
type IsAny<T> = 0 extends 1 & T ? "any" : "not-any";
const v1: IsAny<CopyButtonProps["value"]> = "any";                      // expect error: value is string
const v2: IsAny<ComponentProps<typeof CopyButton>["value"]> = "not-any"; // error => any at JSX level
export const e1 = <CopyButton value={123} variant="bogus" onCopied={42} />;
export const e2 = <CopyButton />;
type K = keyof ComponentProps<typeof CopyButton>;
const k: K = "zzz";
export { v1, v2, k };
