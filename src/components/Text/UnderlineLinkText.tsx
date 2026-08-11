import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface UnderlineLinkTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Force the wipe regardless of hover (touch, focus-visible, programmatic). */
  active?: boolean;
  /**
   * Underline stroke weight. A number is treated as px; any CSS length (e.g.
   * `"0.1em"`, `"2px"`) passes through. Defaults to `--ui-underline-link-thickness`.
   */
  thickness?: string | number;
  /**
   * Distance of the underline below the em-square bottom. A number is px; any
   * CSS length passes through. Positive pushes further down, `0` sits at the
   * em-square bottom, negative pulls into the glyphs. Defaults to
   * `--ui-underline-link-offset`.
   */
  offset?: string | number;
}

const toLength = (value: string | number) =>
  typeof value === "number" ? `${value}px` : value;

/**
 * UnderlineLinkText — a "sliding underline" link decoration. The underline is
 * present at rest; on hover it wipes out to the right and immediately redraws in
 * from the left (a single-hover, two-phase sweep).
 *
 * The line is a `currentColor` gradient painted into `background`, so it tracks
 * this element's own `color` — including hover/active changes on this element or
 * an ancestor (e.g. TextLink). Put the color on UnderlineLinkText or above; a
 * child that sets its own text color will paint the glyphs but not the underline
 * (CSS inheritance only flows downward). No color prop is needed.
 *
 * Positioned at `1em + offset` from the top of each line box so it sits snug
 * under the text like a native `text-decoration` underline, independent of
 * leading. Tune with `thickness` / `offset`.
 *
 * Responds to its own :hover, an ancestor .group:hover, or the `active` prop.
 * <TextLink><UnderlineLinkText>Changelog</UnderlineLinkText></TextLink>
 */
const UnderlineLinkText = forwardRef<HTMLSpanElement, UnderlineLinkTextProps>(
  ({ active, thickness, offset, className, style, ...props }, ref) => (
    <span
      ref={ref}
      data-active={active ? "true" : undefined}
      className={cn("ds-underline-link", className)}
      style={
        {
          ...(thickness != null
            ? { "--ds-underline-thickness": toLength(thickness) }
            : {}),
          ...(offset != null
            ? { "--ds-underline-offset": toLength(offset) }
            : {}),
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  ),
);
UnderlineLinkText.displayName = "UnderlineLinkText";
export { UnderlineLinkText };
