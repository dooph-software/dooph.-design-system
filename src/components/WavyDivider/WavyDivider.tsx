import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../utils/cn";

// ── Variant enum ─────────────────────────────────────────────────────────────

export const WavyDividerVariant = {
  /** Tighter wave — 20 px period, higher visual frequency. */
  high: "high",
  /** Broader wave — 40 px period, lower visual frequency. */
  low: "low",
} as const;
export type WavyDividerVariant =
  (typeof WavyDividerVariant)[keyof typeof WavyDividerVariant];

// ── SVG wave path constants ───────────────────────────────────────────────────

/**
 * Wave paths — one full sine cycle per tile, approximated with two cubic
 * bezier segments. The wave is centred vertically at y=6 inside a 12 px
 * tall tile. Amplitude is ±4.5 px (top peak at y≈1.5, trough at y≈10.5).
 *
 * Control point placement (35 % / 65 % of each half-period) minimises
 * deviation from a true sine wave while keeping the SVG simple.
 */
const HIGH_FREQ_TILE_WIDTH = 20;
const HIGH_FREQ_PATH =
  "M 0,6 C 3.5,1.5 6.5,1.5 10,6 C 13.5,10.5 16.5,10.5 20,6";

const LOW_FREQ_TILE_WIDTH = 40;
const LOW_FREQ_PATH = "M 0,6 C 7,1.5 13,1.5 20,6 C 27,10.5 33,10.5 40,6";

/** Height of the wave tile (and the rendered SVG element) in px. */
const WAVE_HEIGHT = 12;

// ── Types ─────────────────────────────────────────────────────────────────────

export type WavyDividerProps = {
  variant?: WavyDividerVariant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"svg">, "children" | "className">;

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Decorative horizontal wave divider. Fills the full width of its flex or
 * block container via `width="100%"`. Stroke color inherits from CSS
 * `color` (`currentColor`) so consumers can tint it with a text-* utility.
 *
 * ```tsx
 * <WavyDivider variant={WavyDividerVariant.high} className="text-border" />
 * ```
 */
export const WavyDivider = forwardRef<SVGSVGElement, WavyDividerProps>(
  ({ variant = WavyDividerVariant.high, className, ...props }, ref) => {
    // useId gives a stable, SSR-safe unique string per instance so each SVG's
    // <pattern> id does not collide when multiple dividers appear on the page.
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
    const isHigh = variant === WavyDividerVariant.high;
    const tileWidth = isHigh ? HIGH_FREQ_TILE_WIDTH : LOW_FREQ_TILE_WIDTH;
    const wavePath = isHigh ? HIGH_FREQ_PATH : LOW_FREQ_PATH;
    const patternId = `ds-wave-${uid}`;

    return (
      <svg
        ref={ref}
        role="presentation"
        aria-hidden="true"
        width="100%"
        height={WAVE_HEIGHT}
        className={cn("overflow-visible", className)}
        {...props}
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={tileWidth}
            height={WAVE_HEIGHT}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={wavePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height={WAVE_HEIGHT} fill={`url(#${patternId})`} />
      </svg>
    );
  },
);
WavyDivider.displayName = "WavyDivider";
