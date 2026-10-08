// No "use client": the only hook here is useMemo, which React's server build
// exports, so this module is neutral — it renders in either graph. Adding a
// state/effect/ref hook would make it client-only again.
import {
  forwardRef,
  useMemo,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";
import { resolveDsColor, type DsColor } from "../../utils/color";
import {
  getSpinnerGeometry,
  type SpinnerGeometry,
} from "../LoadingSpinner/spinnerGeometry";
// Color and Size enums are shared with LoadingSpinner — same const objects.
import {
  LoadingSpinnerColor,
  LoadingSpinnerSize,
} from "../LoadingSpinner/constants";
import { ProgressIndicatorVariant } from "./constants";
import {
  createMaterialWaveGeometry,
  getWavyTrackGeometry,
} from "./waveGeometry";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProgressIndicatorProps = {
  /**
   * Progress value from 0 (empty) to 1 (complete).
   * Throws if the value is below 0, above 1 or NaN — in every build.
   */
  progress: number;
  variant?: ProgressIndicatorVariant;
  /**
   * A DS colour name (`DS_COLOR_TOKENS` key, e.g. `"primary"`, `"danger"`,
   * `"text-secondary"`) or any CSS colour (e.g. `"#ff6b6b"`).
   * @default LoadingSpinnerColor.primary
   */
  color?: DsColor;
  size?: (typeof LoadingSpinnerSize)[keyof typeof LoadingSpinnerSize];
  className?: string;
} & Omit<ComponentPropsWithoutRef<"svg">, "children" | "className">;

// ── Internal: shared SVG props type ──────────────────────────────────────────

type InnerSvgProps = ComponentPropsWithoutRef<"svg"> & {
  ref?: Ref<SVGSVGElement>;
};

// ── Internal: flat determinate ────────────────────────────────────────────────

/**
 * Flat determinate progress — discrete arcs (M3 style):
 *
 * At `progress === 0` the track renders as a complete circle — no gaps — to
 * represent the fully-empty state cleanly. From any value above 0, the standard M3
 * discrete-arc gap formula applies: indicator arc spans `progress × C` from
 * 12 o'clock; track covers the complementary arc with a `gapLength` gap at each
 * endpoint. The gap is switched by `--ds-pi-gap-on` (0|1, from the TARGET
 * `progress > 0`) — a discrete, non-transitioned property, so it appears at
 * once while only the arc scalar animates. Once the track's complement has no
 * length it is faded out, not unmounted.
 *
 * Motion: the <svg> sets ONE number, `--ds-pi-progress`, inline (plus the
 * fixed circumference and gap), and `.ds-progress-ring` transitions only that
 * number (motion scale `slow` on `standard`). Every dash value of both arcs is
 * a calc() of it in `.ds-progress-ring-indicator` / `-track`, so every frame —
 * including frames of a transition interrupted by a new `progress` — is one
 * self-consistent drawing. Transitioning the dash properties themselves (the
 * earlier `.ds-progress-arc`) let four independent transitions restart from
 * their own mid-flight values, and the track slid backwards or vanished.
 *
 * Both circles are always mounted: a zero-length round-capped dash still
 * paints a dot, so each arc's stroke-opacity drops to 0 when its length is
 * ≤ 0 instead of the element being removed and re-added mid-animation.
 */
function FlatProgressIndicator({
  geo,
  progress,
  strokeColor,
  svgProps,
}: {
  geo: SpinnerGeometry;
  progress: number;
  strokeColor: string;
  svgProps: InnerSvgProps;
}) {
  const {
    diameter,
    cssSize,
    strokeWidth,
    cx,
    cy,
    trackRadius,
    indicatorRadius,
    circumference,
    gapLength,
  } = geo;
  const { className, style, ...rest } = svgProps;

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
      className={cn("ds-progress-ring", className)}
      style={
        {
          width: cssSize,
          height: cssSize,
          // The one animated value, plus the fixed geometry (user units) the
          // .ds-progress-ring-* calc()s derive both arcs from.
          "--ds-pi-progress": progress,
          "--ds-pi-c": circumference,
          "--ds-pi-gap": gapLength,
          // Discrete, from the TARGET progress: never transitions, so the end
          // gaps appear at once instead of growing in over the first 1 %.
          "--ds-pi-gap-on": progress > 0 ? 1 : 0,
          ...style,
        } as CSSProperties
      }
    >
      {/* Track arc — full circle at 0, discrete complement of the indicator above 0, faded once it has no length */}
      <circle
        cx={cx}
        cy={cy}
        r={trackRadius}
        fill="none"
        stroke="var(--ui-color-border-primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        className="ds-progress-ring-track"
      />
      {/* Indicator arc — rotated to start at 12 o'clock */}
      <circle
        cx={cx}
        cy={cy}
        r={indicatorRadius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        className="ds-progress-ring-indicator"
      />
    </svg>
  );
}

// ── Internal: wavy determinate ────────────────────────────────────────────────

/**
 * Wavy determinate progress — discrete arcs (M3 style):
 *
 * At `progress === 0` the track renders as a complete circle (no indicator,
 * no gaps). For all values above 0, the indicator reveals a stable, closed
 * rounded-star path matching Material's expressive wave geometry. The track
 * remains an independent smooth circular arc with round ends.
 *
 * Progress is applied through a normalized SVG dash rather than by rebuilding
 * a partial path, so every intermediate value keeps identical, uniform lobes.
 */
function WavyProgressIndicator({
  geo,
  progress,
  strokeColor,
  svgProps,
}: {
  geo: SpinnerGeometry;
  progress: number;
  strokeColor: string;
  svgProps: InnerSvgProps;
}) {
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

  const wave = useMemo(
    () => createMaterialWaveGeometry(diameter, strokeWidth),
    [diameter, strokeWidth],
  );

  const track = getWavyTrackGeometry(
    progress,
    circumference,
    gapLength,
  );

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
      className={className}
      style={{ width: cssSize, height: cssSize, ...style }}
    >
      {/* A zero-length round-capped dash paints a dot, so complete progress omits the track. */}
      {track && (
        <circle
          cx={cx}
          cy={cy}
          r={trackRadius}
          fill="none"
          stroke="var(--ui-color-border-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${track.length} ${circumference}`}
          strokeDashoffset={track.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      {/* Stable Material-style wave; normalized dash reveals the requested progress. */}
      {progress > 0 && (
        <path
          d={wave.path}
          pathLength={1}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${progress} 1`}
        />
      )}
    </svg>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * Determinate circular progress indicator. Pass `progress` as a value from
 * 0 (empty) to 1 (complete).
 *
 * Throws if `progress` is outside [0, 1] or NaN — invalid values are always a bug.
 *
 * ```tsx
 * <ProgressIndicator progress={0.6} />
 * <ProgressIndicator progress={progress} variant={ProgressIndicatorVariant.wavy} />
 * <ProgressIndicator progress={1} color={LoadingSpinnerColor.prominent} size={LoadingSpinnerSize.md} />
 * ```
 */
export const ProgressIndicator = forwardRef<
  SVGSVGElement,
  ProgressIndicatorProps
>(
  (
    {
      progress,
      variant = ProgressIndicatorVariant.flat,
      color = LoadingSpinnerColor.primary,
      size = LoadingSpinnerSize.rg,
      className,
      ...props
    },
    ref,
  ) => {
    // Written as a negated range test so NaN (e.g. done / total with total 0) throws too.
    if (!(progress >= 0 && progress <= 1)) {
      throw new Error(
        `[ProgressIndicator] progress must be a number between 0 and 1, received: ${progress}`,
      );
    }

    const geo = getSpinnerGeometry(size);
    const strokeColor = resolveDsColor(color, "var(--ui-color-primary)");

    const svgProps: InnerSvgProps = {
      role: "progressbar",
      "aria-valuenow": Math.round(progress * 100),
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      className: cn(className),
      ref,
      ...props,
    };

    if (variant === ProgressIndicatorVariant.wavy) {
      return (
        <WavyProgressIndicator
          geo={geo}
          progress={progress}
          strokeColor={strokeColor}
          svgProps={svgProps}
        />
      );
    }

    return (
      <FlatProgressIndicator
        geo={geo}
        progress={progress}
        strokeColor={strokeColor}
        svgProps={svgProps}
      />
    );
  },
);
ProgressIndicator.displayName = "ProgressIndicator";
