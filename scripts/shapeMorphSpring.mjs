/*
 * The shape-morph spring. The ONLY place its constants live (architecture
 * Rule 6): generate-shape-morph-ease.mjs bakes it into the
 * --ui-shape-morph-duration / --ui-shape-morph-ease tokens, and no component
 * reads these values.
 *
 * Ports Jetpack Compose SpringSimulation.updateValues (analytic position) and
 * estimateAnimationDurationMillis (when Animatable declares a spring done and
 * snaps to target). Compose's snap from ~1.09 back to 1 in a single frame read
 * as a harsh backspin; settleValue replaces it by carrying the spring's
 * position AND velocity at the cut-off smoothly to rest (cubic Hermite).
 */

/** Tuned in prototypes/shape-morph-loader on 2026-09-27. Compose M3 values. */
export const SPRING = Object.freeze({ dampingRatio: 0.6, stiffness: 200, visibilityThreshold: 0.1 });
/** Hermite settle after the Compose cut-off. 0 reproduces Compose's hard snap. */
export const SETTLE_MS = 200;
/** linear() stops across the whole curve. */
export const EASE_SAMPLES = 64;

/** 0 -> 1 spring position at tMs (zero initial velocity). May exceed 1. */
export function springValue({ dampingRatio: z, stiffness }, tMs) {
  const w = Math.sqrt(stiffness);
  const t = tMs / 1000;
  const x0 = -1;
  if (z < 1) {
    const r = -z * w;
    const wd = w * Math.sqrt(1 - z * z);
    return 1 + Math.exp(r * t) * (x0 * Math.cos(wd * t) + ((-r * x0) / wd) * Math.sin(wd * t));
  }
  if (z === 1) return 1 + (x0 + w * x0 * t) * Math.exp(-w * t);
  const s = w * Math.sqrt(z * z - 1);
  const gp = -z * w + s;
  const gm = -z * w - s;
  const cb = (gm * x0) / (gm - gp);
  return 1 + (x0 - cb) * Math.exp(gm * t) + cb * Math.exp(gp * t);
}

/** Velocity in progress units per ms. */
export function springVelocity(spring, tMs) {
  const h = 0.01;
  return (springValue(spring, tMs + h) - springValue(spring, tMs - h)) / (2 * h);
}

/** Compose FloatSpringSpec.getDurationNanos, in ms. Under-damped is closed form. */
export function springDurationMs(spring) {
  const { dampingRatio: z, stiffness, visibilityThreshold } = spring;
  const w = Math.sqrt(stiffness);
  if (z < 1) {
    const r = -z * w;
    const wi = w * Math.sqrt(1 - z * z);
    const c1 = -1 / visibilityThreshold;
    const c2 = (0 - r * c1) / wi;
    return (Math.log(1 / Math.hypot(c1, c2)) / r) * 1000;
  }
  for (let t = 0; t < 10_000; t += 1) {
    if (Math.abs(springValue(spring, t) - 1) < visibilityThreshold) return t;
  }
  return 10_000;
}

/** Position during the settle, localMs in [cutMs, cutMs + settleMs]. */
export function settleValue(spring, cutMs, settleMs, localMs) {
  const u = Math.min(1, Math.max(0, (localMs - cutMs) / settleMs));
  const p0 = springValue(spring, cutMs) - 1;
  const m0 = springVelocity(spring, cutMs) * settleMs;
  return 1 + p0 * (2 * u ** 3 - 3 * u ** 2 + 1) + m0 * (u ** 3 - 2 * u ** 2 + u);
}

/** The whole curve (spring to cut-off, then settle) as a CSS linear() easing. */
export function buildEase(spring = SPRING, settleMs = SETTLE_MS, samples = EASE_SAMPLES) {
  const cut = springDurationMs(spring);
  const total = cut + settleMs;
  const stops = [];
  for (let i = 0; i <= samples; i++) {
    if (i === 0) {
      stops.push("0");
      continue;
    }
    if (i === samples) {
      stops.push("1 100%");
      continue;
    }
    const t = (i / samples) * total;
    const v = t < cut ? springValue(spring, t) : settleValue(spring, cut, settleMs, t);
    stops.push(`${v.toFixed(4)} ${((t / total) * 100).toFixed(2)}%`);
  }
  return { durationMs: Math.round(total), ease: `linear(${stops.join(", ")})` };
}
