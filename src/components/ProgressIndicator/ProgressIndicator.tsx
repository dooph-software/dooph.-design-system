"use client";

import {
  forwardRef,
  useMemo,
  type ComponentPropsWithoutRef,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";
import {
  getSpinnerGeometry,
  SPINNER_START_ANGLE,
  type SpinnerGeometry,
  type SpinnerSizeKey,
} from "../LoadingSpinner/spinnerGeometry";
import { generateWavyArcPath } from "../LoadingSpinner/waveUtils";
// Color and Size enums are shared with LoadingSpinner — same const objects.
import {
  LoadingSpinnerColor,
  LoadingSpinnerSize,
} from "../LoadingSpinner/LoadingSpinner";

// ── Enums ─────────────────────────────────────────────────────────────────────

export const ProgressIndicatorVariants = {
  /** Smooth circular arc — discrete arcs with M3 gap behaviour and CSS transitions. */
  flat: "flat",
  /**
   * Polar sine-wave arc — indicator follows a wavy path generated from `progress`.
   * CSS path transitions are not applied (point count changes); drive `progress`
   * gradually from a spring/animation loop for smooth motion.
   */
  wavy: "wavy",
} as const;
export type ProgressIndicatorVariant =
  (typeof ProgressIndicatorVariants)[keyof typeof ProgressIndicatorVariants];

// Re-export shared enums so consumers can import everything from one place.
export { LoadingSpinnerColor, LoadingSpinnerSize };

// ── Color resolution ──────────────────────────────────────────────────────────

const COLOR_TOKENS: Record<string, string> = {
  primary: "var(--ui-color-primary)",
  brand: "var(--ui-color-brand)",
};

function resolveColor(color: string): string {
  return COLOR_TOKENS[color] ?? color;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProgressIndicatorProps = {
  /**
   * Progress value from 0 (empty) to 1 (complete).
   * Throws in development if the value is outside this range.
   */
  progress: number;
  variant?: ProgressIndicatorVariant;
  /**
   * Preset alias or any CSS string (e.g. `"#ff6b6b"`).
   * @default LoadingSpinnerColor.primary
   */
  color?:
    | (typeof LoadingSpinnerColor)[keyof typeof LoadingSpinnerColor]
    | (string & {});
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
 * represent the fully-empty state cleanly. For all values above 0, the standard
 * M3 discrete-arc gap formula applies: indicator arc spans `progress × C` from
 * 12 o'clock; track covers the complementary arc with a `gapLength` gap at each
 * endpoint.
 *
 * Both arcs carry a CSS transition (300ms cubic-bezier) so they animate smoothly
 * together whenever `progress` changes.
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
    strokeWidth,
    cx,
    cy,
    trackRadius,
    indicatorRadius,
    circumference,
    gapLength,
  } = geo;
  const { className, style, ...rest } = svgProps;

  const activeLength = circumference * progress;
  const dashOffset = circumference * (1 - progress);

  // At progress === 0: full-circle track, no indicator, no gaps.
  // For progress > 0: standard M3 discrete-arc formula with gapLength gaps.
  let trackLength: number;
  let trackOffset: number;
  if (progress === 0) {
    trackLength = circumference;
    trackOffset = 0;
  } else {
    trackLength = Math.max(0, circumference - activeLength - 2 * gapLength);
    // Correct dashoffset formula: L + G - D where L=trackLength, G=circumference,
    // D=activeLength+gapLength (track starts one gap after the indicator arc ends).
    trackOffset = trackLength + circumference - (activeLength + gapLength);
  }

  const easing = "cubic-bezier(0.4, 0, 0.2, 1)";
  const transition = `stroke-dasharray 300ms ${easing}, stroke-dashoffset 300ms ${easing}`;

  return (
    <svg
      {...rest}
      width={diameter}
      height={diameter}
      viewBox={`0 0 ${diameter} ${diameter}`}
      className={className}
      style={style}
    >
      {/* Track arc — full circle at 0, discrete complement of indicator for progress > 0 */}
      <circle
        cx={cx}
        cy={cy}
        r={trackRadius}
        fill="none"
        stroke="var(--ui-color-border)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${trackLength} ${circumference}`}
        strokeDashoffset={trackOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition }}
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
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: `stroke-dashoffset 300ms ${easing}` }}
      />
    </svg>
  );
}

// ── Internal: wavy determinate ────────────────────────────────────────────────

/**
 * Wavy determinate progress — discrete arcs (M3 style):
 *
 * At `progress === 0` the track renders as a complete circle (no indicator,
 * no gaps). For all values above 0, the indicator is a polar sine-wave arc
 * generated by `generateWavyArcPath` and the track is the discrete complement
 * with `gapLength` gaps at each endpoint.
 *
 * No CSS path transitions (point count changes with progress). Consumers that
 * need smooth animation should drive `progress` gradually from a spring or
 * animation loop.
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
    strokeWidth,
    cx,
    cy,
    trackRadius,
    waveBaseRadius,
    waveAmplitude,
    waveFrequency,
    waveSteps,
    circumference,
    gapLength,
  } = geo;
  const { className, style, ...rest } = svgProps;

  const wavyPath = useMemo(
    () =>
      progress > 0
        ? generateWavyArcPath(
            cx,
            cy,
            waveBaseRadius,
            progress,
            SPINNER_START_ANGLE,
            waveAmplitude,
            waveFrequency,
            waveSteps,
          )
        : "",
    [cx, cy, waveBaseRadius, progress, waveAmplitude, waveFrequency, waveSteps],
  );

  // At progress === 0: full-circle track, no indicator, no gaps.
  // For progress > 0: standard M3 discrete-arc formula with gapLength gaps.
  const activeLength = circumference * progress;
  let trackLength: number;
  let trackOffset: number;
  if (progress === 0) {
    trackLength = circumference;
    trackOffset = 0;
  } else {
    trackLength = Math.max(0, circumference - activeLength - 2 * gapLength);
    // Correct dashoffset formula: L + G - D where L=trackLength, G=circumference,
    // D=activeLength+gapLength (track starts one gap after the indicator arc ends).
    trackOffset = trackLength + circumference - (activeLength + gapLength);
  }

  return (
    <svg
      {...rest}
      width={diameter}
      height={diameter}
      viewBox={`0 0 ${diameter} ${diameter}`}
      className={className}
      style={style}
    >
      {/* Track arc — full circle at 0, discrete complement of wavy arc for progress > 0 */}
      <circle
        cx={cx}
        cy={cy}
        r={trackRadius}
        fill="none"
        stroke="var(--ui-color-border)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${trackLength} ${circumference}`}
        strokeDashoffset={trackOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Wavy determinate arc — derived from progress prop, hidden at progress === 0 */}
      {wavyPath && (
        <path
          d={wavyPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
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
 * Throws if `progress` is outside [0, 1] — invalid values are always a bug.
 *
 * ```tsx
 * <ProgressIndicator progress={0.6} />
 * <ProgressIndicator progress={progress} variant={ProgressIndicatorVariants.wavy} />
 * <ProgressIndicator progress={1} color={LoadingSpinnerColor.brand} size={LoadingSpinnerSize.md} />
 * ```
 */
export const ProgressIndicator = forwardRef<
  SVGSVGElement,
  ProgressIndicatorProps
>(
  (
    {
      progress,
      variant = ProgressIndicatorVariants.flat,
      color = LoadingSpinnerColor.primary,
      size = LoadingSpinnerSize.rg,
      className,
      ...props
    },
    ref,
  ) => {
    if (progress < 0 || progress > 1) {
      throw new Error(
        `[ProgressIndicator] progress must be a number between 0 and 1, received: ${progress}`,
      );
    }

    const geo = getSpinnerGeometry(size as SpinnerSizeKey);
    const strokeColor = resolveColor(color);

    const svgProps: InnerSvgProps = {
      role: "progressbar",
      "aria-valuenow": Math.round(progress * 100),
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      className: cn(className),
      ref,
      ...props,
    };

    if (variant === ProgressIndicatorVariants.wavy) {
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
