/**
 * Shared geometry constants and helpers for LoadingSpinner and ProgressIndicator.
 *
 * Two size spaces, deliberately separate:
 *   - USER UNITS (`diameter` and everything derived from it) — the viewBox
 *     coordinate space the drawing is authored in.
 *   - RENDERED SIZE (`cssSize`) — `var(--ui-size-spinner-*)`, applied as CSS.
 *
 * Keeping them apart is what makes the tokens real: the SVG scales to the token
 * and every proportion inside it survives.
 *
 * Geometry only. No duration or easing belongs here: the spinner's clock is the
 * --ui-spinner-* tokens, read by the .ds-spinner-* CSS helpers (Rule 6).
 */
import { ACTIVE_INDICATOR_SCALE } from "../MorphRotationShape/geometry";

/**
 * Reference diameter in USER UNITS for each size — the coordinate space every
 * other number here is expressed in, and what goes into the `viewBox`.
 *
 * This is NOT the rendered size. The rendered size comes from
 * `SPINNER_SIZE_VARS` below, i.e. straight from the --ui-size-spinner-* tokens,
 * and the SVG scales itself to it. The two agree at the defaults, and they are
 * allowed to diverge: overriding a token resizes the spinner and every part of
 * it — stroke, wave amplitude, arc gaps — scales with it, because they are all
 * fractions of the same user-unit space.
 *
 * An earlier version rendered width/height from this table directly, which made
 * the tokens dead: they existed, they were documented as the contract, and
 * overriding one did nothing.
 */
export const SPINNER_DIAMETERS = { sm: 16, rg: 22, md: 32, xl: 40 } as const;

/**
 * Rendered size per size key, as the token reference itself rather than a
 * snapshot of its value — the same technique `Fonts`/`IconSize` use, so a
 * consumer override resolves at paint time instead of being baked in here.
 */
export const SPINNER_SIZE_VARS = {
  sm: "var(--ui-size-spinner-sm)",
  rg: "var(--ui-size-spinner-rg)",
  md: "var(--ui-size-spinner-md)",
  xl: "var(--ui-size-spinner-xl)",
} as const;

/**
 * Stroke width per size, in viewBox user units — the rendered size comes from
 * the --ui-size-spinner-* token and the stroke scales with it.
 */
export const SPINNER_STROKE_WIDTHS = { sm: 2, rg: 2.5, md: 3, xl: 3 } as const;

/** Starting angle in radians — 12 o'clock position. */
export const SPINNER_START_ANGLE = -Math.PI / 2;

/**
 * Minimum sweep fraction for the flat indeterminate arc: Material's starting
 * dash (1 unit of its ≈126.9-unit circle), so each cycle starts from a dot.
 */
export const SPINNER_MIN_SWEEP = 0.008;

/**
 * Maximum sweep fraction for the flat spinner (72 % of a full rotation).
 * Material's own is ≈79 %, but this spinner also draws a track a gap clear of
 * each end, and at `sm` 79 % leaves that track ≈3 % of a turn — a dot. 72 %
 * keeps it a visible arc at every size.
 */
export const SPINNER_MAX_SWEEP = 0.72;

/**
 * Per-size factor on the spokes/star turn duration (--ui-spinner-spokes-duration,
 * which is the `rg` turn). A square-root power law rather than a linear scale —
 * linear over-corrects (small too fast, large too slow); power 0.5 gives the
 * right perceptual compression:
 *
 *   turn(size) = --ui-spinner-spokes-duration × (diameter / diameter_rg)^0.5
 *
 * The factor is geometry (a ratio of sizes); the duration it scales is a token,
 * so the clock itself never lives in JS.
 */
export const SPINNER_SPIN_EXPONENT = 0.5;

/**
 * Star variant fit. `STAR_SHAPE_PATH` is drawn in a 24-unit box and its
 * bounds are x 1.5–22.4936, y 1.5064–22.4937: an extent of ~21 units centred
 * on (12, 12). The star is scaled about that centre so its bounds are
 * ACTIVE_INDICATOR_SCALE (38/48) of the spinner box — the same shape-to-box
 * ratio ShapeMorphSpinner draws its shapes at. The star's farthest points
 * from its centre are its four tips, which also set its bounds, so it needs
 * no further rotation-safe reduction: it stays inside the box at any angle.
 */
export const STAR_VIEWBOX = 24;
const STAR_EXTENT = 22.4936 - 1.5;
export const STAR_FIT_SCALE =
  (ACTIVE_INDICATOR_SCALE * STAR_VIEWBOX) / STAR_EXTENT;
/** SVG transform that applies STAR_FIT_SCALE about the box centre. */
export const STAR_FIT_TRANSFORM = `translate(${STAR_VIEWBOX / 2} ${STAR_VIEWBOX / 2}) scale(${STAR_FIT_SCALE}) translate(${-STAR_VIEWBOX / 2} ${-STAR_VIEWBOX / 2})`;

export type SpinnerSizeKey = keyof typeof SPINNER_DIAMETERS;

export interface SpinnerGeometry {
  /** Reference diameter in user units — the viewBox space, not the rendered size. */
  diameter: number;
  /**
   * Rendered size: `var(--ui-size-spinner-*)`. Apply it as a CSS width/height
   * (never as an SVG attribute — attributes cannot resolve `var()`), leaving the
   * numeric `diameter` to the viewBox so the drawing scales to whatever the
   * token says.
   */
  cssSize: string;
  strokeWidth: number;
  cx: number;
  cy: number;
  /** Track (background ring) radius. Stroke centred here; defines the SVG boundary. */
  trackRadius: number;
  /** Flat indicator arc radius — same as trackRadius. Used by flat variant only. */
  indicatorRadius: number;
  /** Full circumference (2π × indicatorRadius). */
  circumference: number;
  /**
   * Mathematical gap in path-length units between the indicator arc's endpoints
   * and the track arc's endpoints.
   *
   * Set to 2 × strokeWidth so that after round linecaps (each cap extends
   * strokeWidth/2 into the gap from both sides) the *visual* gap equals one
   * stroke width — matching the M3 spec (gap = track width at 48 px reference).
   */
  gapLength: number;
  /**
   * Per-size factor on --ui-spinner-spokes-duration for the spokes and star
   * turns: (diameter / diameter_rg)^SPINNER_SPIN_EXPONENT. 1 at `rg`.
   */
  spinTimeScale: number;
}

/** Compute all geometry values needed to render a spinner at the given size. */
export function getSpinnerGeometry(size: SpinnerSizeKey): SpinnerGeometry {
  const diameter = SPINNER_DIAMETERS[size];
  const strokeWidth = SPINNER_STROKE_WIDTHS[size];
  const cx = diameter / 2;
  const cy = diameter / 2;
  const trackRadius = (diameter - strokeWidth) / 2;
  const indicatorRadius = trackRadius;
  const circumference = 2 * Math.PI * indicatorRadius;

  // Mathematical gap = 2 × strokeWidth → visual gap ≈ strokeWidth with round caps.
  const gapLength = strokeWidth * 2;

  // Square-root power law keeps perceived turn speed consistent across sizes
  // without over-correcting (see SPINNER_SPIN_EXPONENT).
  const spinTimeScale = Math.pow(
    diameter / SPINNER_DIAMETERS.rg,
    SPINNER_SPIN_EXPONENT,
  );

  return {
    diameter,
    cssSize: SPINNER_SIZE_VARS[size],
    strokeWidth,
    cx,
    cy,
    trackRadius,
    indicatorRadius,
    circumference,
    gapLength,
    spinTimeScale,
  };
}
