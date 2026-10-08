import type { RoundedPolygon } from "./polygon";

const SAMPLES_PER_CUBIC = 16;

interface P {
  x: number;
  y: number;
}

function segmentDistance(x: number, y: number, a: P, b: P): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / len2));
  return Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy));
}

/**
 * Largest n (<= maxOrder) such that rotating the outline by 360/n about the
 * FRAME centre (0.5, 0.5) maps it onto itself within `tolerance` (0..1 units).
 * The frame centre, not the centroid, because that is what MorphRotationShape
 * rotates about in frame fit. Returns 1 for no symmetry.
 */
export function rotationalSymmetry(poly: RoundedPolygon, maxOrder = 12, tolerance = 0.01): number {
  const pts: P[] = [];
  for (const c of poly.cubics) {
    for (let i = 0; i < SAMPLES_PER_CUBIC; i++) {
      const p = c.pointOnCurve(i / SAMPLES_PER_CUBIC);
      pts.push({ x: p.x - 0.5, y: p.y - 0.5 });
    }
  }
  const distanceToOutline = (x: number, y: number) => {
    let best = Infinity;
    for (let i = 0; i < pts.length; i++) {
      best = Math.min(best, segmentDistance(x, y, pts[i], pts[(i + 1) % pts.length]));
    }
    return best;
  };
  for (let n = maxOrder; n >= 2; n--) {
    const a = (2 * Math.PI) / n;
    const c = Math.cos(a);
    const s = Math.sin(a);
    if (pts.every((p) => distanceToOutline(p.x * c - p.y * s, p.x * s + p.y * c) < tolerance)) return n;
  }
  return 1;
}

/**
 * Clockwise turn for one step that lands exactly on `restingAngle` modulo the
 * target shape's symmetry period, choosing the candidate nearest `nominal`.
 * Never 0: a step always turns.
 */
export function stepTurn(fromAngle: number, restingAngle: number, symmetry: number, nominal: number): number {
  const period = 360 / symmetry;
  const base = (((restingAngle - fromAngle) % period) + period) % period;
  const k = Math.max(0, Math.round((nominal - base) / period));
  const turn = base + k * period;
  return turn < 1e-6 ? period : turn;
}
