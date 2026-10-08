/*
 * SidebarWithHoverIcon — a sidebar rail that traverses its frame and pulls out
 * into a chevron on hover.
 *
 * ## behavior
 * - The rail is a single cubic. Collinear control points draw a straight line;
 *   pulling them apart bows it into a rounded chevron pointing at the far edge
 *   — where the panel goes when the control is clicked.
 * - `side` moves the rail ACROSS the frame. `hovered` bows it. Both are
 *   continuous and both can run at once, which is the case that matters: the
 *   control is clicked while hovered, so the chevron must cross the frame and
 *   arrive pointing the other way. It flattens on the way over, because at the
 *   midpoint `dir` is 0 — see below. No special case handles this.
 * - At `hovered` = 1 the geometry is exactly SidebarLeftHoverIcon /
 *   SidebarRightHoverIcon. Those two are the pose of record; if PULL or BULGE
 *   changes here, change them there too or the set drifts apart.
 *
 * ## constraints
 * - `hovered` is CONTROLLED. The component must not go looking for an
 *   interactive ancestor to attach listeners to — a previous version called
 *   `closest("button, a, [role=button]")` and bound six handlers to a node it
 *   did not own. Consumers wire onPointerEnter/onPointerLeave on their own
 *   button; the stories show it.
 * - Motion belongs to CSS, geometry belongs here. Durations and easing are
 *   tokens on `.ds-sidebar-rail`, including the reduced-motion case. Nothing in
 *   this file may hold a duration or an easing curve.
 * - `d` is written imperatively because SVG path data is not animatable in
 *   every engine. It is in JSX only for the FIRST render (so SSR output is
 *   right); after that React must never touch it, or a re-render mid-tween
 *   snaps the rail.
 * - One `getComputedStyle` pair per frame per icon. Fine for a toggle; do not
 *   render hundreds of these animating at once.
 *
 * ## updating
 * The sampling loop is self-terminating: it stops as soon as both properties
 * reach their targets. That is also the whole degradation story — where
 * `@property` is unsupported the values jump, the loop writes the final path on
 * its first frame and stops, and the icon simply changes instantly.
 */
"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { BaseIcon, type IconProps } from "../Icons/BaseIcon";
import { SidebarIconSide } from "./constants";

/** Rail x at rest, per side, in the 24-unit viewBox. */
const REST_LEFT = 9;
const REST_RIGHT = 15;
/** How far the rail's ends pull toward the frame edge at full hover. */
const PULL = 1;
/** How far the control points push into the panel at full hover. */
const BULGE = 2.5;
/** Below this the transitioned value has effectively landed. */
const EPSILON = 0.001;

export interface SidebarWithHoverIconProps extends IconProps {
  /** Which edge the rail sits on. */
  side?: SidebarIconSide;
  /**
   * Whether the control holding this icon is hovered or keyboard-focused.
   * Controlled: the icon has no interactive surface of its own to detect it.
   */
  hovered?: boolean;
}

/**
 * The rail as a function of two scalars.
 *
 * `dir` is the outward direction, and it is INTERPOLATED rather than branched
 * on: at s = 0.5 it is 0, which collapses both the pull and the bulge to zero
 * and leaves a straight rail at the centre of the frame. That is what makes a
 * side change during hover read as the chevron flattening as it crosses and
 * re-forming mirrored on the far side.
 */
function railPath(s: number, h: number) {
  const dir = -1 + 2 * s;
  const end = REST_LEFT + (REST_RIGHT - REST_LEFT) * s + dir * PULL * h;
  const ctrl = end - dir * BULGE * h;
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return `M${r(end)} 8C${r(ctrl)} 10.5 ${r(ctrl)} 13.5 ${r(end)} 16`;
}

export const SidebarWithHoverIcon = ({
  side = SidebarIconSide.left,
  hovered = false,
  ...iconProps
}: SidebarWithHoverIconProps) => {
  const pathRef = useRef<SVGPathElement>(null);
  const rafRef = useRef(0);

  const targetS = side === SidebarIconSide.right ? 1 : 0;
  const targetH = hovered ? 1 : 0;

  /* Rendered once and never again, so React has no `d` to re-commit over a
   * value the sampling loop is mid-way through writing. */
  const initialD = useRef<string | null>(null);
  if (initialD.current === null) initialD.current = railPath(targetS, targetH);

  /* Layout effect, not effect: the inline custom properties were just
   * committed, so this samples and writes before the browser paints the frame
   * in which the transition starts. */
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const frame = () => {
      /* One style resolution per frame, not one per property: each call is a
       * forced recalc, and the two values must come from the same instant
       * anyway or a side change during hover samples them a frame apart. */
      const cs = getComputedStyle(path);
      const s =
        Number.parseFloat(cs.getPropertyValue("--ds-sidebar-rail-s")) || 0;
      const h =
        Number.parseFloat(cs.getPropertyValue("--ds-sidebar-rail-h")) || 0;
      path.setAttribute("d", railPath(s, h));
      if (Math.abs(s - targetS) < EPSILON && Math.abs(h - targetH) < EPSILON) {
        rafRef.current = 0;
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    frame();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [targetS, targetH]);

  return (
    <BaseIcon {...iconProps}>
      <rect width="18" height="18" x="3" y="3" rx="5" />
      <path
        ref={pathRef}
        className="ds-sidebar-rail"
        d={initialD.current}
        style={
          {
            "--ds-sidebar-rail-s": targetS,
            "--ds-sidebar-rail-h": targetH,
          } as CSSProperties
        }
      />
    </BaseIcon>
  );
};

export default SidebarWithHoverIcon;
