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
 */

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
 * snapshot of its value — the same technique `Fonts`/`IconSizes` use, so a
 * consumer override resolves at paint time instead of being baked in here.
 */
export const SPINNER_SIZE_VARS = {
  sm: "var(--ui-size-spinner-sm)",
  rg: "var(--ui-size-spinner-rg)",
  md: "var(--ui-size-spinner-md)",
  xl: "var(--ui-size-spinner-xl)",
} as const;

/** Stroke width in px for each size. Scales with diameter. */
export const SPINNER_STROKE_WIDTHS = { sm: 2, rg: 2.5, md: 3, xl: 3 } as const;

/** Starting angle in radians — 12 o'clock position. */
export const SPINNER_START_ANGLE = -Math.PI / 2;

/**
 * Duration in ms for one full animation cycle.
 * Matches Material Design's indeterminate circular progress timing (1.4 s).
 */
export const SPINNER_ANIM_DURATION = 1800;

/** Minimum sweep fraction (7 % of a full rotation) for the indeterminate arc. */
export const SPINNER_MIN_SWEEP = 0.07;

/** Maximum sweep fraction for the flat spinner (72 % of a full rotation). */
export const SPINNER_MAX_SWEEP = 0.72;

/**
 * Reference revolution duration in ms for the spokes spinner at the `rg` size.
 * Each size derives its own duration via `getSpinnerGeometry` using a square-root
 * power law rather than a linear scale — linear over-corrects (small too fast,
 * large too slow). Power 0.5 gives the right perceptual compression:
 *
 *   spokesDuration(size) = SPINNER_SPOKES_DURATION × (diameter / diameter_rg)^0.5
 *
 * At this reference the sizes come out approximately:
 *   sm → 1092 ms | rg → 1280 ms | md → 1544 ms | xl → 1726 ms
 */
export const SPINNER_SPOKES_DURATION = 1280;

/**
 * Wave amplitude as a fraction of stroke width.
 * M3 reference (48 px spinner): 1.6 px amplitude / 4 px stroke = 0.4.
 * Tying amplitude to stroke width (not to trackRadius) keeps the wave subtle
 * and consistent — a small texture, not a dominant shape feature.
 */
const WAVE_AMP_SCALE = 0.4;

/**
 * Per-size wave parameters.
 *
 * `frequency`: number of sine bumps per full circle (2π). Scales with diameter
 * so each bump stays roughly the same angular width regardless of size —
 * producing consistent visual density across sm→xl.
 *
 * `steps`: polyline sample count for a full circle. Each bump needs ≥ 8 samples
 * to look smooth; steps = frequency × 10 gives comfortable headroom.
 */
const WAVE_PARAMS = {
  sm: { frequency: 3, steps: 30 },
  rg: { frequency: 5, steps: 50 },
  md: { frequency: 6, steps: 60 },
  xl: { frequency: 9, steps: 90 },
} as const;

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
   * Wavy arc base radius — inset from trackRadius so the wave's outer peaks
   * reach exactly trackRadius without clipping the viewBox.
   * waveBaseRadius = trackRadius − waveAmplitude
   */
  waveBaseRadius: number;
  /**
   * Wave amplitude in px.
   * = strokeWidth × WAVE_AMP_SCALE (M3 ref: 1.6 px / 4 px stroke = 0.4).
   * Much smaller than the old trackRadius-derived value — the wave is a subtle
   * texture, not a dominant shape.
   */
  waveAmplitude: number;
  /** Sine bumps per full circle (2π). Size-dependent. */
  waveFrequency: number;
  /** Polyline sample count for a full circle. Proportional to waveFrequency. */
  waveSteps: number;
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
   * Revolution duration in ms for the spokes variant at this size.
   * Uses a square-root power law (exponent 0.5) so perceived speed stays
   * consistent without over-correcting: small sizes spin a little faster,
   * large sizes a little slower, but the range stays comfortable.
   *
   * = SPINNER_SPOKES_DURATION × (diameter / diameter_rg)^0.5
   */
  spokesDuration: number;
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

  // Wave geometry: amplitude is a fraction of strokeWidth (M3-derived).
  // Outer wave peaks reach trackRadius exactly → no viewBox clipping.
  const waveAmplitude = strokeWidth * WAVE_AMP_SCALE;
  const waveBaseRadius = trackRadius - waveAmplitude;

  const { frequency: waveFrequency, steps: waveSteps } = WAVE_PARAMS[size];

  // Mathematical gap = 2 × strokeWidth → visual gap ≈ strokeWidth with round caps.
  const gapLength = strokeWidth * 2;

  // Spokes duration: square-root power law keeps perceived speed consistent
  // without over-correcting. Linear scaling (exponent 1) makes small too fast
  // and large too slow; power 0.5 compresses the range to a comfortable spread.
  const spokesDuration = Math.round(
    SPINNER_SPOKES_DURATION * Math.pow(diameter / SPINNER_DIAMETERS.rg, 0.5),
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
    waveBaseRadius,
    waveAmplitude,
    waveFrequency,
    waveSteps,
    gapLength,
    spokesDuration,
  };
}
