import { IconSize } from "../../../../../../dooph-ds-audit-build/dist/index.js";
type T = IconSize;
const a: "x" = null as unknown as T;
const b: "x" = IconSize.md;
type Open = (typeof IconSize)[keyof typeof IconSize] | (string & {});
const c: "x" = null as unknown as Open;
