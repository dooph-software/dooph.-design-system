import type { Cubic } from "./engine/cubic";
import type { RoundedPolygon } from "./engine/polygon";

/** Loader shape size inside its box — Compose's 38dp indicator in a 48dp container. */
export const ACTIVE_INDICATOR_SCALE = 38 / 48;

export interface Segment {
  segment: number;
  t: number;
  atRest: boolean;
}

/**
 * Which stop-to-stop morph a transitioned value belongs to. `lo..hi` is every
 * stop the current motion has touched; clamping into it keeps overshoot past
 * the far stop (and undershoot below the near one) on the segment it belongs
 * to instead of the next one over.
 */
export function segmentAt(v: number, lo: number, hi: number): Segment {
  if (hi <= lo) return { segment: lo, t: 0, atRest: true };
  const segment = Math.min(Math.max(Math.floor(v), lo), hi - 1);
  return { segment, t: v - segment, atRest: false };
}

/**
 * The whole stops a motion spans, for segmentAt. Targets may be fractional
 * (a hover nudge rests at 0.15 or 1.15), so the range is the floor/ceil of
 * every value seen, and it only ever widens until the motion lands.
 */
export function widenRange(lo: number, hi: number, settled: number, target: number): [number, number] {
  return [
    Math.min(lo, Math.floor(settled), Math.floor(target)),
    Math.max(hi, Math.ceil(settled), Math.ceil(target)),
  ];
}

/** Compose LoadingIndicator calculateScaleFactor: fit every shape at any rotation. */
export function rotationSafeScale(polygons: RoundedPolygon[]): number {
  let scale = 1;
  for (const p of polygons) {
    const b = p.calculateBounds();
    const m = p.calculateMaxBounds();
    scale = Math.min(scale, Math.max((b[2] - b[0]) / (m[2] - m[0]), (b[3] - b[1]) / (m[3] - m[1])));
  }
  return scale;
}

function boundsCentre(cubics: Cubic[]): [number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const c of cubics) {
    const b = c.calculateBounds(true);
    minX = Math.min(minX, b[0]);
    minY = Math.min(minY, b[1]);
    maxX = Math.max(maxX, b[2]);
    maxY = Math.max(maxY, b[3]);
  }
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

/**
 * SVG transform for a path written in 0..100 units (toPathD size 100) inside a
 * 100-unit viewBox. `loaderScale` null = frame fit: fixed centre, no scaling.
 * Otherwise loader fit: scale down and re-centre on this frame's bounds.
 */
export function frameTransform(cubics: Cubic[], angle: number, loaderScale: number | null): string {
  if (loaderScale === null) return `rotate(${angle} 50 50)`;
  const s = 100 * loaderScale * ACTIVE_INDICATOR_SCALE;
  const [cx, cy] = boundsCentre(cubics);
  return `rotate(${angle} 50 50) translate(${50 - cx * s} ${50 - cy * s}) scale(${s / 100})`;
}
