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

/** Wave geometry — one full sine cycle per high-frequency tile. */
const DESIGN_WAVELENGTH = 15;
const HIGH_FREQ_TILE_WIDTH = 20;
const LOW_FREQ_TILE_WIDTH = 40;
const DESIGN_AMPLITUDE = 6;
const SVG_UNIT_SCALE = HIGH_FREQ_TILE_WIDTH / DESIGN_WAVELENGTH;
const WAVE_AMPLITUDE = DESIGN_AMPLITUDE * SVG_UNIT_SCALE;
const WAVE_CENTER_Y = WAVE_AMPLITUDE;
const WAVE_CONTROL_Y_DELTA = WAVE_AMPLITUDE * (4 / 3);

/** Height of the wave tile (and the rendered SVG element) in SVG units. */
const WAVE_HEIGHT = WAVE_AMPLITUDE * 2;

function formatSvgNumber(value: number) {
  return Number(value.toFixed(4));
}

function createWavePath(tileWidth: number) {
  const halfTileWidth = tileWidth / 2;
  const topControlY = WAVE_CENTER_Y - WAVE_CONTROL_Y_DELTA;
  const bottomControlY = WAVE_CENTER_Y + WAVE_CONTROL_Y_DELTA;

  return [
    `M 0,${formatSvgNumber(WAVE_CENTER_Y)}`,
    `C ${formatSvgNumber(halfTileWidth * 0.35)},${formatSvgNumber(topControlY)}`,
    `${formatSvgNumber(halfTileWidth * 0.65)},${formatSvgNumber(topControlY)}`,
    `${formatSvgNumber(halfTileWidth)},${formatSvgNumber(WAVE_CENTER_Y)}`,
    `C ${formatSvgNumber(tileWidth - halfTileWidth * 0.65)},${formatSvgNumber(bottomControlY)}`,
    `${formatSvgNumber(tileWidth - halfTileWidth * 0.35)},${formatSvgNumber(bottomControlY)}`,
    `${formatSvgNumber(tileWidth)},${formatSvgNumber(WAVE_CENTER_Y)}`,
  ].join(" ");
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type WavyDividerProps = {
  variant?: WavyDividerVariant;
  strokeWeight?: ComponentPropsWithoutRef<"path">["strokeWidth"];
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
  (
    {
      variant = WavyDividerVariant.high,
      strokeWeight = "1",
      className,
      ...props
    },
    ref,
  ) => {
    // useId gives a stable, SSR-safe unique string per instance so each SVG's
    // <pattern> id does not collide when multiple dividers appear on the page.
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
    const isHigh = variant === WavyDividerVariant.high;
    const tileWidth = isHigh ? HIGH_FREQ_TILE_WIDTH : LOW_FREQ_TILE_WIDTH;
    const wavePath = createWavePath(tileWidth);
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
            overflow="visible"
          >
            <path
              d={wavePath}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWeight}
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
