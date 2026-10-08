// WI-C7-54 type probe (F-089 items 2 and 4). Retarget the two dist paths in tsconfig.54.json to a scratch-worktree build.
// Today: TS2578 on the LinearProgressIndicator line, and TS2322 on the two ComponentRef lines.
import { useRef, type ComponentRef } from "react";
import { CopyButton, CTAButton, LinearProgressIndicator, SliderStepped } from "@dooph-software/design-system";
export function Probe() {
  const b = useRef<HTMLButtonElement>(null);
  const a = useRef<HTMLAnchorElement>(null);
  return (
    <>
      <LinearProgressIndicator value={40} />
      <LinearProgressIndicator />
      {/* @ts-expect-error null (Radix's indeterminate state) is not supported: it rendered an empty determinate bar */}
      <LinearProgressIndicator value={null} />
      <SliderStepped defaultValue={[50]} min={0} max={100} step={10} />
      <CopyButton ref={b} value="x" />
      <CTAButton ref={a} text="Go" icon={null} href="#" />
    </>
  );
}
// CopyButton always renders a <button>: its ref type says so.
export const copyRef: ComponentRef<typeof CopyButton> = {} as HTMLButtonElement;
export const copyRefIsButton: ComponentRef<typeof CopyButton> extends HTMLButtonElement ? true : false = true;
// CTAButton asChild can render any element (its own story uses a <button>): its ref type admits that.
export const ctaRef: ComponentRef<typeof CTAButton> = {} as HTMLButtonElement;
