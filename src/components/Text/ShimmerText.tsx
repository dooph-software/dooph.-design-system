import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type ShimmerTextProps = HTMLAttributes<HTMLSpanElement>;

/**
 * ShimmerText — masks an animated sheen to the glyphs of its children
 * (ChatGPT-style "working" indicator). Children keep their own typography;
 * ShimmerText owns COLOR while active — children must not set an explicit
 * text color. Tune via --ui-shimmer-base / --ui-shimmer-highlight.
 */
const ShimmerText = forwardRef<HTMLSpanElement, ShimmerTextProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("ds-shimmer-text inline-block", className)} {...props} />
  ),
);
ShimmerText.displayName = "ShimmerText";
export { ShimmerText };
