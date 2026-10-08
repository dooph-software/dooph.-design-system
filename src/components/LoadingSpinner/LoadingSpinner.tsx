/*
 * LoadingSpinner — indeterminate circular loading indicator in three looks:
 * `flat` (M3 arc and track), `spokes` (eight-spoke icon) and `star` (the
 * StarShape outline).
 *
 * ## behavior
 * - Every variant is animated by CSS: the .ds-spinner-* helpers in index.css,
 *   on the --ui-spinner-* tokens. This file renders once and writes geometry
 *   only (SVG attributes plus numeric custom properties on the <svg>).
 * - flat: Material's circular indeterminate animation, an active arc plus a
 *   grey track arc drawn as two dashes on one path. The arc group turns at a
 *   constant rate (one turn per --ui-spinner-rotate-duration) while, once per
 *   --ui-spinner-duration, the arc grows from SPINNER_MIN_SWEEP (a dot) to
 *   SPINNER_MAX_SWEEP of a turn, then its tail chases its held head round
 *   until it is a dot again. The track is the complement, one stroke width
 *   of visual gap clear of each end.
 * - spokes / star: a constant linear turn of an inner group, one turn per
 *   --ui-spinner-spokes-duration scaled by the size's spinTimeScale.
 * - star: STAR_SHAPE_PATH filled with `color`, scaled to ShapeMorphSpinner's
 *   shape-to-box ratio (STAR_FIT_SCALE), so it stays inside the box at any
 *   angle.
 * - Every variant renders role="progressbar" (indeterminate: no
 *   aria-valuenow) with aria-label "Loading"; a consumer's props override both.
 * - Reduced motion: flat holds a static frame (longest arc, tail at
 *   12 o'clock); spokes and star stand still.
 * - `color` goes through resolveDsColor. The track is always
 *   --ui-color-border-primary, never the indicator colour.
 *
 * ## constraints
 * - No duration, easing, timer or animation loop in this file (Rule 6). The
 *   clock is the --ui-spinner-* tokens; the sweep range and the per-size
 *   factor are geometry and reach CSS as plain numbers.
 * - The flat arcs share one OPEN path that runs TWO laps of the circle from
 *   one gap before 12 o'clock. The arc's tail travels almost a full turn per
 *   cycle and the track runs on past the arc's tail, so on a one-lap path or
 *   a <circle> a dash would cross the path's seam: it is cut in two and its
 *   round caps flash. Do not shorten it to one lap or swap it for a <circle>;
 *   the CSS keeps both dashes strictly inside the two laps.
 * - 1 − SPINNER_MAX_SWEEP − 2 × gapLength / circumference must stay above 0 at
 *   every size. At 0 the track's dash has zero length, and a round cap still
 *   paints a zero-length dash as a dot.
 * - No "use client": nothing here needs the client. Adding a hook, a timer or
 *   a listener makes this module client-only again.
 */
import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type Ref } from "react";
import { cn } from "../../utils/cn";
import { resolveDsColor, type DsColor } from "../../utils/color";
import { STAR_SHAPE_PATH } from "../Shapes/StarShape";
import {
  LoadingSpinnerColor,
  LoadingSpinnerSize,
  LoadingSpinnerVariant,
} from "./constants";
import {
  getSpinnerGeometry,
  SPINNER_MAX_SWEEP,
  SPINNER_MIN_SWEEP,
  SPINNER_START_ANGLE,
  STAR_FIT_TRANSFORM,
  STAR_VIEWBOX,
  type SpinnerGeometry,
} from "./spinnerGeometry";

// ── Types ─────────────────────────────────────────────────────────────────────

export type LoadingSpinnerProps = {
  variant?: LoadingSpinnerVariant;
  /**
   * A DS colour name (`DS_COLOR_TOKENS` key, e.g. `"primary"`, `"danger"`,
   * `"text-secondary"`) or any CSS colour (e.g. `"#ff6b6b"`).
   * @default LoadingSpinnerColor.primary
   */
  color?: DsColor;
  size?: LoadingSpinnerSize;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"svg">, "children" | "className">;

// ── Internal: shared SVG props type ──────────────────────────────────────────

type InnerSvgProps = ComponentPropsWithoutRef<"svg"> & {
  ref?: Ref<SVGSVGElement>;
};

type VariantProps = {
  geo: SpinnerGeometry;
  color: string;
  svgProps: InnerSvgProps;
};

/** Numeric custom properties for the .ds-spinner-* helpers (never px-suffixed by React). */
type SpinnerVars = Record<`--ds-spinner-${string}`, number>;

// ── Internal: flat arc path ──────────────────────────────────────────────────

/**
 * Two full clockwise laps of a circle as one OPEN path (four half arcs, no
 * `Z`), starting `startAngle` radians round from 3 o'clock. Both flat arcs are
 * dashes on it; the second lap is what keeps them clear of the path's end.
 */
function twoLapCirclePathFrom(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
): string {
  const x0 = cx + r * Math.cos(startAngle);
  const y0 = cy + r * Math.sin(startAngle);
  const x1 = 2 * cx - x0;
  const y1 = 2 * cy - y0;
  const lap = `A ${r} ${r} 0 0 1 ${x1} ${y1} A ${r} ${r} 0 0 1 ${x0} ${y0}`;
  return `M ${x0} ${y0} ${lap} ${lap}`;
}

// ── Internal: flat spinner ────────────────────────────────────────────────────

/**
 * Flat indeterminate spinner (Material circular indeterminate). The <g> turns
 * and the two dashes move along the path, all in CSS; see .ds-spinner-flat in
 * index.css for the dash maths.
 */
function FlatSpinner({ geo, color, svgProps }: VariantProps) {
  const {
    diameter,
    cssSize,
    strokeWidth,
    cx,
    cy,
    trackRadius,
    circumference,
    gapLength,
  } = geo;
  const { className, style, ...rest } = svgProps;

  // Gap in radians: gapLength (arc length) ÷ radius = subtended angle. The path
  // starts one gap before 12 o'clock, so the arc's tail, which the CSS places
  // one gap along the path, starts the cycle at 12 o'clock.
  const d = twoLapCirclePathFrom(
    cx,
    cy,
    trackRadius,
    SPINNER_START_ANGLE - gapLength / trackRadius,
  );
  const vars: SpinnerVars = {
    "--ds-spinner-c": circumference,
    "--ds-spinner-gap": gapLength / circumference,
    "--ds-spinner-sweep-min": SPINNER_MIN_SWEEP,
    "--ds-spinner-sweep-max": SPINNER_MAX_SWEEP,
  };

  return (
    <svg
      {...rest}
      /* Numeric width/height stay as ATTRIBUTES so the drawing has an
       * intrinsic size before CSS lands; the token then overrides them via
       * style, because an SVG attribute cannot resolve var(). The viewBox
       * keeps the user-unit space, so the whole drawing scales to the token. */
      width={diameter}
      height={diameter}
      viewBox={`0 0 ${diameter} ${diameter}`}
      className={cn("ds-spinner-flat", className)}
      style={{ width: cssSize, height: cssSize, ...vars, ...style } as CSSProperties}
    >
      <g className="ds-spinner-flat-turn">
        {/* Track arc — the complement of the active arc */}
        <path
          className="ds-spinner-flat-arc ds-spinner-flat-track"
          d={d}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ stroke: "var(--ui-color-border-primary)" }}
        />
        {/* Active indicator arc */}
        <path
          className="ds-spinner-flat-arc ds-spinner-flat-indicator"
          d={d}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ stroke: color }}
        />
      </g>
    </svg>
  );
}

// ── Internal: spokes spinner ─────────────────────────────────────────────────

/**
 * Spokes (icon) spinner — the eight-spoke LoadingSpinnerIcon paths, turning at
 * a constant linear rate via .ds-spinner-spin.
 */
function SpokesSpinner({ geo, color, svgProps }: VariantProps) {
  const { diameter, cssSize, spinTimeScale } = geo;
  const { className, style, ...rest } = svgProps;
  const vars: SpinnerVars = { "--ds-spinner-time-scale": spinTimeScale };

  return (
    <svg
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
      /* Attribute = intrinsic size before CSS lands; the token below overrides
       * it, since an SVG attribute cannot resolve var(). This variant is drawn
       * in a fixed 24-unit space, so it scales with the rendered size. */
      width={diameter}
      height={diameter}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      style={
        {
          width: cssSize,
          height: cssSize,
          stroke: color,
          strokeWidth: "var(--ui-icon-stroke-width)",
          ...vars,
          ...style,
        } as CSSProperties
      }
    >
      <g className="ds-spinner-spin">
        <path d="M12 2v4" />
        <path d="m16.2 7.8 2.9-2.9" />
        <path d="M18 12h4" />
        <path d="m16.2 16.2 2.9 2.9" />
        <path d="M12 18v4" />
        <path d="m4.9 19.1 2.9-2.9" />
        <path d="M2 12h4" />
        <path d="m4.9 4.9 2.9 2.9" />
      </g>
    </svg>
  );
}

// ── Internal: star spinner ───────────────────────────────────────────────────

/**
 * Star spinner — the StarShape outline, filled, turning at a constant linear
 * rate via .ds-spinner-spin. Same turn rate as the spokes.
 */
function StarSpinner({ geo, color, svgProps }: VariantProps) {
  const { diameter, cssSize, spinTimeScale } = geo;
  const { className, style, ...rest } = svgProps;
  const vars: SpinnerVars = { "--ds-spinner-time-scale": spinTimeScale };

  return (
    <svg
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
      /* Attribute = intrinsic size before CSS lands; the token overrides it. */
      width={diameter}
      height={diameter}
      viewBox={`0 0 ${STAR_VIEWBOX} ${STAR_VIEWBOX}`}
      className={cn(className)}
      style={{ width: cssSize, height: cssSize, ...vars, ...style } as CSSProperties}
    >
      <g className="ds-spinner-spin">
        <path d={STAR_SHAPE_PATH} transform={STAR_FIT_TRANSFORM} style={{ fill: color }} />
      </g>
    </svg>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * Indeterminate circular loading indicator.
 *
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner variant={LoadingSpinnerVariant.spokes} color={LoadingSpinnerColor.prominent} />
 * <LoadingSpinner variant={LoadingSpinnerVariant.star} size={LoadingSpinnerSize.md} />
 * <LoadingSpinner size={LoadingSpinnerSize.md} color="#a3c2d1" />
 * ```
 */
export const LoadingSpinner = forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  (
    {
      variant = LoadingSpinnerVariant.flat,
      color = LoadingSpinnerColor.primary,
      size = LoadingSpinnerSize.rg,
      className,
      ...props
    },
    ref,
  ) => {
    const geo = getSpinnerGeometry(size);
    const resolvedColor = resolveDsColor(color, "var(--ui-color-primary)");

    const svgProps: InnerSvgProps = {
      // Indeterminate progressbar: no aria-valuenow (ARIA 1.2).
      role: "progressbar",
      "aria-label": "Loading",
      className: cn(className),
      ref,
      ...props,
    };

    if (variant === LoadingSpinnerVariant.spokes) {
      return <SpokesSpinner geo={geo} color={resolvedColor} svgProps={svgProps} />;
    }
    if (variant === LoadingSpinnerVariant.star) {
      return <StarSpinner geo={geo} color={resolvedColor} svgProps={svgProps} />;
    }
    return <FlatSpinner geo={geo} color={resolvedColor} svgProps={svgProps} />;
  },
);
LoadingSpinner.displayName = "LoadingSpinner";
