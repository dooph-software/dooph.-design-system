/**
 * Polar sine wave path generator for the wavy indicator variant.
 *
 * The indicator traces a curve described by:
 *   r(θ) = baseRadius + amplitude × sin(frequency × θ)
 *
 * Converting to Cartesian:
 *   x(θ) = cx + r(θ) × cos(θ)
 *   y(θ) = cy + r(θ) × sin(θ)
 *
 * The function samples `steps` evenly spaced angles over the swept arc and
 * joins them into an SVG polyline path string (M + L commands). This is
 * intentionally simple — no cubic bezier fitting — so the wave frequency and
 * amplitude remain geometrically exact regardless of arc length.
 */

/**
 * Generate an SVG path for a wavy arc using a polar sine wave.
 *
 * @param cx            Centre x of the bounding circle (px)
 * @param cy            Centre y of the bounding circle (px)
 * @param baseRadius    Nominal radius of the arc (px)
 * @param sweepFraction Fraction of the full circle to trace [0, 1]
 * @param startAngle    Starting angle in radians (default −π/2 = 12 o'clock)
 * @param amplitude     Wave amplitude in px (radial perturbation)
 * @param frequency     Number of sine bumps per full circle (2π)
 * @param steps         Sample count for a full circle; actual count scales
 *                      linearly with sweepFraction (minimum 8)
 * @returns SVG path string, or empty string when sweepFraction ≤ 0
 */
export function generateWavyArcPath(
  cx: number,
  cy: number,
  baseRadius: number,
  sweepFraction: number,
  startAngle: number,
  amplitude: number,
  frequency: number,
  steps = 120,
): string {
  const clamped = Math.max(0, Math.min(1, sweepFraction));
  if (clamped <= 0) return '';

  const sweepRadians = clamped * 2 * Math.PI;
  // Proportionally fewer points for short arcs; always at least 8
  const actualSteps = Math.max(8, Math.round(steps * clamped));

  const parts: string[] = [];
  for (let i = 0; i <= actualSteps; i++) {
    const t = i / actualSteps;
    const angle = startAngle + t * sweepRadians;
    const r = baseRadius + amplitude * Math.sin(frequency * angle);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(3)},${y.toFixed(3)}`);
  }

  return parts.join(' ');
}
