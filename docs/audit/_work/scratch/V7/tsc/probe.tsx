import {
  CopyButton, type CopyButtonProps,
  ModalContent, SheetContent, TooltipContent, PopoverContent, DropdownMenuContent,
  Modal, Sheet, Tooltip, Popover, DropdownMenu, TooltipProvider,
  DropdownMenuSub,
} from "@dooph-software/design-system";

type IsAny<T> = 0 extends 1 & T ? "any" : "not-any";

// ---- M54 / U4-F2
const a1: IsAny<CopyButtonProps["onClick"]> = "not-any";           // expect error if any
const a2: IsAny<CopyButtonProps["style"]> = "not-any";             // expect error if any
export const c1 = <CopyButton value="x" foo={1} />;               // compiles if props are any
export const c2 = <CopyButton value="x" href="/nope" />;
export const c3 = <CopyButton value="x" onClick={(n: number) => n} />;
export const c4 = <CopyButton />;                                  // value required? expect error

// ---- M48 / U8-F4
export const m1 = <Modal><ModalContent portal={false}>x</ModalContent></Modal>;
export const m2 = <Modal><ModalContent portalProps={{ container: null }}>x</ModalContent></Modal>;
export const s1 = <Sheet><SheetContent portal={false}>x</SheetContent></Sheet>;
export const s2 = <Sheet><SheetContent portalProps={{ container: null }}>x</SheetContent></Sheet>;
export const t1 = <TooltipProvider><Tooltip><TooltipContent portal={false}>x</TooltipContent></Tooltip></TooltipProvider>;
export const p1 = <Popover><PopoverContent portal={false}>x</PopoverContent></Popover>;
export const d1 = <DropdownMenu><DropdownMenuContent portal={false}>x</DropdownMenuContent></DropdownMenu>;
export const d2 = <DropdownMenuSub>x</DropdownMenuSub>;
