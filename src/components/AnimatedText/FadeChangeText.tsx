/*
 * FadeChangeText — RollChangeText's roll without the blur: old content rolls
 * out and fades, new content rolls in and fades up, on every content change.
 *
 * ## behavior
 * - A change is signalled by `changeKey`, or by the children themselves when
 *   they are a string or number. Mount never animates.
 * - `direction` picks the travel exactly as on RollChangeText: `down` (default)
 *   settles the new content in from above, `up` rises it in from below, via the
 *   same signed `--ds-roll-dir`.
 *
 * ## constraints
 * - The swap engine lives in `useChangeSwap`, shared with RollChangeText. Do
 *   not re-inline it here; this file owns only the look.
 * - No blur, ever. `ds-fade-change-*` animate transform and opacity only, and
 *   `will-change` is scoped to those two — a crisp, sharp-edged roll is the
 *   whole reason this exists beside RollChangeText. Anyone wanting blur uses
 *   RollChangeText.
 * - Opacity must not share the travel's curve. With no blur to mask it, both
 *   faces sat near-opaque at once (the in-ease decelerates) and the words
 *   stacked with no visible fade. `ds-fade-change-*` keyframes give opacity its
 *   own offsets — old gone by 50%, new held at 0 until 30% — and must keep
 *   doing so; see the keyframes' comment in index.css.
 * - Nothing here may hold a duration. Timing, easing, depth and the
 *   reduced-motion case are `--ui-fade-change-*` tokens (defaulting to the
 *   roll-change values) read by `.ds-fade-change-*` in index.css.
 */
"use client";
import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { RollDirection } from "./constants";
import { useChangeSwap } from "./useChangeSwap";

export interface FadeChangeTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Marks a content change. Defaults to children when children is a string/number. */
  changeKey?: string | number;
  /** Travel direction. `down` (default): new content settles in from above; `up`: rises in from below. */
  direction?: RollDirection;
  children: ReactNode;
}

/**
 * <FadeChangeText changeKey={status}><LabelText>{status}</LabelText></FadeChangeText>
 */
const FadeChangeText = forwardRef<HTMLSpanElement, FadeChangeTextProps>(
  (
    {
      changeKey,
      children,
      className,
      direction = RollDirection.down,
      style,
      ...props
    },
    ref,
  ) => {
    const { exiting, entering } = useChangeSwap(changeKey, children);

    return (
      <span
        ref={ref}
        className={cn("inline-grid overflow-hidden", className)}
        style={
          {
            "--ds-roll-dir": direction === RollDirection.up ? -1 : 1,
            ...style,
          } as CSSProperties
        }
        {...props}
      >
        {exiting != null && (
          <span
            key={exiting.key}
            aria-hidden
            className="[grid-area:1/1] ds-fade-change-out"
            onAnimationEnd={exiting.onAnimationEnd}
          >
            {exiting.node}
          </span>
        )}
        <span
          key={entering.key}
          className={cn(
            "[grid-area:1/1]",
            entering.animating && "ds-fade-change-in",
          )}
          onAnimationEnd={entering.onAnimationEnd}
        >
          {children}
        </span>
      </span>
    );
  },
);
FadeChangeText.displayName = "FadeChangeText";
export { FadeChangeText };
