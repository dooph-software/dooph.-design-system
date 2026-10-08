// D2 type probe (WI-065 + WI-108). Every @ts-expect-error must be needed; everything else must compile.
import { useRef } from "react";
import {
  CheckIcon, CloverShape, PuffShape, SidebarWithHoverIcon, BaseIcon, IconSize,
  MorphRotationShape, MorphRotationShapeMode, type IconProps, type ShapeProps,
} from "@dooph-software/design-system";

// WI-065: IconSize is the literal union, not string.
// @ts-expect-error — '"var(--ui-icon-sm)" | …' is not assignable to '"x"'
export const a: "x" = null as unknown as IconSize;
// @ts-expect-error — an arbitrary string is no longer an IconSize
export const s: IconSize = "2rem";
export const okSize: IconSize = IconSize.md;
// …but `size` still takes any CSS length or a number.
export const p1: IconProps = { size: "2rem" };
export const p2: IconProps = { size: 20 };
export const p3: IconProps = { size: IconSize.lg };

// WI-108: element access (mirrors W7c access-probe lines 17-19).
export function Probe() {
  const svg = useRef<SVGSVGElement>(null);
  const f = () => {};
  return (
    <>
      <CheckIcon aria-label="Done" role="img" onClick={f} ref={svg} style={{ opacity: 0.5 }} />
      <SidebarWithHoverIcon ref={svg} onClick={f} />
      <CloverShape size={24} className="text-primary" ref={svg} />
      <BaseIcon ref={svg} id="i" data-x="1"><path d="M0 0" /></BaseIcon>
      <MorphRotationShape mode={MorphRotationShapeMode.autoplay} shapes={[CloverShape, PuffShape]} />
      {/* @ts-expect-error — shapes size by `size`, not the icon's strokeWidth */}
      <CloverShape size={24} strokeWidth={2} />
      {/* @ts-expect-error — a span ref is not an svg ref */}
      <CheckIcon ref={useRef<HTMLSpanElement>(null)} />
    </>
  );
}
export const sp: ShapeProps = { size: 24, "aria-label": "x", id: "s" };
