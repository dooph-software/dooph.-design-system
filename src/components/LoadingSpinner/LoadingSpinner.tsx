import {
  forwardRef,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";
import {
  getSpinnerGeometry,
  SPINNER_ANIM_DURATION,
  SPINNER_MAX_SWEEP,
  SPINNER_MIN_SWEEP,
  SPINNER_START_ANGLE,
  type SpinnerGeometry,
  type SpinnerSizeKey,
} from "./spinnerGeometry";

// ── Enums ─────────────────────────────────────────────────────────────────────

export const LoadingSpinnerVariant = {
  /** Smooth circular arc — rAF-driven discrete arcs with M3 gap behaviour. */
  flat: "flat",
  /**
   * Icon spinner — the LoadingSpinnerIcon paths rotate at a constant linear
   * rate. Communicates "loading" via a familiar eight-spoke icon.
   */
  spokes: "spokes",
} as const;
export type LoadingSpinnerVariant =
  (typeof LoadingSpinnerVariant)[keyof typeof LoadingSpinnerVariant];

export const LoadingSpinnerColor = {
  primary: "primary",
  brand: "brand",
} as const;
export type LoadingSpinnerColor =
  (typeof LoadingSpinnerColor)[keyof typeof LoadingSpinnerColor];

export const LoadingSpinnerSize = {
  /** 16 px diameter — maps to --ui-size-spinner-sm */
  sm: "sm",
  /** 22 px diameter — maps to --ui-size-spinner-rg */
  rg: "rg",
  /** 32 px diameter — maps to --ui-size-spinner-md */
  md: "md",
  /** 40 px diameter — maps to --ui-size-spinner-xl */
  xl: "xl",
} as const;
export type LoadingSpinnerSize =
  (typeof LoadingSpinnerSize)[keyof typeof LoadingSpinnerSize];

// ── Color resolution ──────────────────────────────────────────────────────────

const COLOR_TOKENS: Record<LoadingSpinnerColor, string> = {
  primary: "var(--ui-color-primary)",
  brand: "var(--ui-color-brand)",
};

/** Preset color aliases resolve to design tokens; arbitrary strings pass through. */
function resolveColor(color: string): string {
  return COLOR_TOKENS[color as LoadingSpinnerColor] ?? color;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type LoadingSpinnerProps = {
  variant?: LoadingSpinnerVariant;
  /**
   * Preset color alias or any CSS string (e.g. `"#ff6b6b"`).
   * @default LoadingSpinnerColor.primary
   */
  color?: LoadingSpinnerColor | (string & {});
  size?: LoadingSpinnerSize;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"svg">, "children" | "className">;

// ── Internal: shared SVG props type ──────────────────────────────────────────

type InnerSvgProps = ComponentPropsWithoutRef<"svg"> & {
  ref?: Ref<SVGSVGElement>;
};

// ── Internal: flat arc path helper ───────────────────────────────────────────

/**
 * Returns an SVG clockwise arc `M…A…` path string.
 *
 * @param startAngle - Start angle in radians (0 = 3 o'clock, −π/2 = 12 o'clock).
 * @param sweepAngle - Arc span in radians, must be positive.
 *
 * Returns an empty string when `sweepAngle ≤ 0`.
 * Clamps to just under 2π: at exactly 2π the start/end points are identical
 * and the SVG `A` command draws nothing.
 *
 * WHY THIS APPROACH:
 * Using `<path>` + explicit arc coordinates entirely avoids the rendering
 * artefact that occurs with `<circle>` + `strokeDashoffset` when the dash
 * position crosses the circle element's path endpoint (12 o'clock after the
 * rotate(-90) transform). At that point SVG clips the dash at the path end
 * instead of wrapping, producing a spurious visual contraction + flash with
 * round linecaps. Direct arc coordinates have no such seam.
 */
function flatArcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  sweepAngle: number,
): string {
  if (sweepAngle <= 0) return "";
  const sweep = Math.min(sweepAngle, 2 * Math.PI - 0.0001);
  const endAngle = startAngle + sweep;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
}

// ── Internal: flat spinner ────────────────────────────────────────────────────

/**
 * Flat indeterminate spinner — rAF-driven, path-based discrete arcs (M3 style):
 *
 * Both arcs are `<path>` elements whose `d` attribute is replaced each frame
 * via `requestAnimationFrame` + direct `setAttribute`. Using `<path>` with
 * explicit SVG arc coordinates (not `<circle>` + dashoffset) avoids the clip
 * artefact that occurs when a dashed stroke crosses the circle path's seam.
 *
 * Animation model:
 * - Arc length oscillates between SPINNER_MIN_SWEEP and SPINNER_MAX_SWEEP of
 *   a full rotation via cosine easing over SPINNER_ANIM_DURATION ms.
 * - Arc head (leading edge) advances at 2 full rotations per cycle; tail
 *   trails sweepAngle behind. The arc therefore compacts from the back.
 * - Track arc covers the complementary arc: (2π − sweepAngle − 2×gapAngle).
 *   With round linecaps the visual gap ≈ strokeWidth (M3 spec).
 */
function FlatSpinner({
  geo,
  strokeColor,
  svgProps,
}: {
  geo: SpinnerGeometry;
  strokeColor: string;
  svgProps: InnerSvgProps;
}) {
  const { diameter, strokeWidth, cx, cy, trackRadius, gapLength } = geo;
  const { className, style, ...rest } = svgProps;

  const activeRef = useRef<SVGPathElement>(null);
  const trackRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const startTime = performance.now();
    let frameId: number;
    const twoPi = 2 * Math.PI;
    // Gap in radians: gapLength (arc-length) ÷ radius = subtended angle.
    const gapAngle = gapLength / trackRadius;

    function animate(now: number) {
      const elapsed = now - startTime;
      const phase = (elapsed % SPINNER_ANIM_DURATION) / SPINNER_ANIM_DURATION;

      // Cosine easing: 0→1→0 over one cycle.
      const easedPhase = (1 - Math.cos(phase * twoPi)) / 2;
      const sweepAngle =
        (SPINNER_MIN_SWEEP +
          (SPINNER_MAX_SWEEP - SPINNER_MIN_SWEEP) * easedPhase) *
        twoPi;

      // Head advances at 2 full rotations per cycle; tail = head − sweepAngle.
      const arcEndAngle =
        SPINNER_START_ANGLE + (elapsed / SPINNER_ANIM_DURATION) * 2 * twoPi;
      const arcStartAngle = arcEndAngle - sweepAngle;

      if (activeRef.current) {
        activeRef.current.setAttribute(
          "d",
          flatArcPath(cx, cy, trackRadius, arcStartAngle, sweepAngle),
        );
      }

      if (trackRef.current) {
        const trackSweepAngle = twoPi - sweepAngle - 2 * gapAngle;
        if (trackSweepAngle > 0) {
          trackRef.current.setAttribute(
            "d",
            flatArcPath(
              cx,
              cy,
              trackRadius,
              arcEndAngle + gapAngle,
              trackSweepAngle,
            ),
          );
        } else {
          trackRef.current.setAttribute("d", "");
        }
      }

      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [cx, cy, trackRadius, gapLength]);

  return (
    <svg
      {...rest}
      width={diameter}
      height={diameter}
      viewBox={`0 0 ${diameter} ${diameter}`}
      className={className}
      style={style}
    >
      {/* Track arc — discrete complement of active arc, driven by rAF */}
      <path
        ref={trackRef}
        fill="none"
        stroke="var(--ui-color-border)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Active indicator arc — driven by rAF */}
      <path
        ref={activeRef}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Internal: spokes spinner ─────────────────────────────────────────────────

/**
 * Spokes (icon) spinner — the eight-spoke LoadingSpinnerIcon paths rendered
 * inside an SVG sized to match the spinner's diameter, rotating at a constant
 * linear rate via `ds-spinner-rotate`.
 *
 * Unlike the flat/wavy variants there is no arc animation — the entire SVG
 * simply spins. This is the lightest-weight variant: no rAF loop, no path
 * recomputation, pure CSS animation.
 */
function SpokesSpinner({
  geo,
  strokeColor,
  svgProps,
}: {
  geo: SpinnerGeometry;
  strokeColor: string;
  svgProps: InnerSvgProps;
}) {
  const { diameter, spokesDuration } = geo;
  const { className, style, ...rest } = svgProps;

  return (
    <svg
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
      width={diameter}
      height={diameter}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      style={
        {
          stroke: strokeColor,
          strokeWidth: "var(--ui-icon-stroke)",
          animation: `ds-spinner-rotate ${spokesDuration}ms linear infinite`,
          transformOrigin: "center",
          ...style,
        } as React.CSSProperties
      }
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * Indeterminate circular loading indicator.
 *
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner variant={LoadingSpinnerVariant.spokes} color={LoadingSpinnerColor.brand} />
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
    const geo = getSpinnerGeometry(size as SpinnerSizeKey);
    const strokeColor = resolveColor(color);

    const svgProps: InnerSvgProps = {
      role: "status",
      "aria-label": "Loading",
      className: cn(className),
      ref,
      ...props,
    };

    if (variant === LoadingSpinnerVariant.spokes) {
      return (
        <SpokesSpinner geo={geo} strokeColor={strokeColor} svgProps={svgProps} />
      );
    }

    return (
      <FlatSpinner geo={geo} strokeColor={strokeColor} svgProps={svgProps} />
    );
  },
);
LoadingSpinner.displayName = "LoadingSpinner";
