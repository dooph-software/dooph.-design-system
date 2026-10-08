import { forwardRef, useRef, type ForwardedRef } from "react";
export const A1 = forwardRef<HTMLElement, { x?: 1 }>((_p, ref) => <a ref={ref} />);
export const A2 = forwardRef<HTMLElement, { x?: 1 }>((_p, ref) => <a ref={ref as ForwardedRef<HTMLAnchorElement>} />);
export function Use() {
  const a = useRef<HTMLAnchorElement>(null);
  const b = useRef<HTMLButtonElement>(null);
  const e = useRef<HTMLElement>(null);
  return <>{<A2 ref={a} />}{<A2 ref={b} />}{<A2 ref={e} />}</>;
}
// object-rest omit under noUnusedLocals
export function omit(rest: { a: number; type?: string }) {
  const { type: _slotType, ...triggerProps } = rest;
  return triggerProps;
}
// the exact WI-C7-58 form: the rest object has no `type` key in its declared type
export function omitCast(rest: { a: number; id?: string }) {
  const { type: _slotType, ...triggerProps } = rest as typeof rest & { type?: string };
  return triggerProps;
}
