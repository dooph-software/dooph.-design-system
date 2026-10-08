import { Button, SheetContent, ButtonVariant } from "../../../../../../dooph-ds-audit-build/dist/index.js";
export const a = <Button variant={null} size={null}>x</Button>;
export const b = <SheetContent side={null}>x</SheetContent>;
export const c = <Button variant={Math.random() > 0.5 ? ButtonVariant.primary : null}>x</Button>;
// @ts-expect-error control: a non-member string must fail
export const d = <Button variant="nope">x</Button>;
