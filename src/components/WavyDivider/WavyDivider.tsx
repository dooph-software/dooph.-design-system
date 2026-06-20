import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../utils/cn";

// ── Variant enum ─────────────────────────────────────────────────────────────

export const WavyDividerVariant = {
  /** Tight wave — 20px period (Figma "High Frequency"). */
  high: "high",
  /** Broad wave — 40px period (Figma "Low Frequency"). */
  low: "low",
} as const;
export type WavyDividerVariant =
  (typeof WavyDividerVariant)[keyof typeof WavyDividerVariant];

// ── Wave geometry (px) ───────────────────────────────────────────────────────
// Mirrors the Figma "Wavy Divider" node: one crest + one trough per period with
// a deliberately shallow, fixed amplitude. The wave lives in a 12px band so the
// stroke stays inside the host container (default 2px → strokes up to ~6px never
// clip), and the pattern repeats horizontally to fill any width — no JS measuring.

const TILE_WIDTH: Record<WavyDividerVariant, number> = { high: 20, low: 40 };
const HEIGHT = 12;
const CENTER_Y = HEIGHT / 2;
const AMPLITUDE = 2.88;
// Symmetric cubic control points overshoot by 4/3 so the curve's midpoint peak
// lands exactly at AMPLITUDE.
const CONTROL_DELTA = AMPLITUDE * (4 / 3);

/** One full period: a trough then a crest, vertically centered. */
function wavePath(tileWidth: number) {
  const half = tileWidth / 2;
  const trough = CENTER_Y + CONTROL_DELTA;
  const crest = CENTER_Y - CONTROL_DELTA;
  return [
    `M 0 ${CENTER_Y}`,
    `C ${half / 3} ${trough} ${(half * 2) / 3} ${trough} ${half} ${CENTER_Y}`,
    `C ${half + half / 3} ${crest} ${half + (half * 2) / 3} ${crest} ${tileWidth} ${CENTER_Y}`,
  ].join(" ");
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type WavyDividerProps = {
  variant?: WavyDividerVariant;
  /** Stroke weight in px (default 2). Accepts any SVG stroke-width value. */
  strokeWeight?: ComponentPropsWithoutRef<"path">["strokeWidth"];
  className?: string;
} & Omit<ComponentPropsWithoutRef<"svg">, "children" | "className">;

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Decorative horizontal wave divider. Fills the full width of its container via
 * `width="100%"` and an SVG `<pattern>` that tiles automatically — no hooks,
 * resize observers, or layout measuring. Stroke color inherits from CSS `color`
 * (`currentColor`), so tint it with any text-* utility.
 *
 * ```tsx
 * <WavyDivider variant={WavyDividerVariant.high} className="text-border" />
 * ```
 */
export const WavyDivider = forwardRef<SVGSVGElement, WavyDividerProps>(
  (
    { variant = WavyDividerVariant.high, strokeWeight = 2, className, ...props },
    ref,
  ) => {
    // Stable, SSR-safe unique id so multiple dividers' <pattern>s never collide.
    const patternId = `ds-wave-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
    const tileWidth = TILE_WIDTH[variant];

    return (
      <svg
        ref={ref}
        role="presentation"
        aria-hidden="true"
        width="100%"
        height={HEIGHT}
        className={cn("block", className)}
        {...props}
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={tileWidth}
            height={HEIGHT}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={wavePath(tileWidth)}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWeight}
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height={HEIGHT} fill={`url(#${patternId})`} />
      </svg>
    );
  },
);
WavyDivider.displayName = "WavyDivider";
