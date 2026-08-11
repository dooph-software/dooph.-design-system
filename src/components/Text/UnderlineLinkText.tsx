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
}

const toLength = (value: string | number) =>
  typeof value === "number" ? `${value}px` : value;

/**
 * UnderlineLinkText — a "sliding underline" link decoration. The underline is
 * present at rest; on hover it wipes out to the right and immediately redraws in
 * from the left (a single-hover, two-phase sweep).
 *
 * The line is a `currentColor` gradient painted into `background`, not a
 * pseudo-element or `text-decoration`, so it inherits the child's text color,
 * survives across line wraps, and never clips descenders. The motion is a
 * `@keyframes` sweep (not a transition) because it is two-phase — out-right then
 * in-left — which a single transition cannot express.
 *
 * Wraps a text child the same way ShimmerText/RollHoverText do; it owns only the
 * underline, so the child keeps its own typography and color. Stroke weight is
 * tunable via the `thickness` prop.
 * Responds to its own :hover, an ancestor .group:hover, or the `active` prop.
 * <TextLink asChild><a href="…"><UnderlineLinkText><BodyText>Changelog</BodyText></UnderlineLinkText></a></TextLink>
 */
const UnderlineLinkText = forwardRef<HTMLSpanElement, UnderlineLinkTextProps>(
  ({ active, thickness, className, style, ...props }, ref) => (
    <span
      ref={ref}
      data-active={active ? "true" : undefined}
      className={cn("ds-underline-link", className)}
      style={
        {
          ...(thickness != null
            ? { "--ds-underline-thickness": toLength(thickness) }
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
