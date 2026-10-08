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
 *   not re-inline it here; the render shell lives in `ChangeSwapShell`; this
 *   file owns only the look: its class pair.
 * - No blur, ever. `ds-fade-change-*` animate transform and opacity only, and
 *   `will-change` is scoped to those two — a crisp, sharp-edged roll is the
 *   whole reason this exists beside RollChangeText. Anyone wanting blur uses
 *   RollChangeText.
 * - Opacity must not share the travel's curve. With no blur to mask it, both
 *   faces sat near-opaque at once (the in-ease decelerates) and the words
 *   stacked with no visible fade. `ds-fade-change-*` keyframes give opacity its
 *   own offsets — old gone by 50%, new held at 0 until 30% — and must keep
 *   doing so; see the keyframes' comment in index.css.
 * - Nothing here may hold a duration. Timing and easing come from the motion
 *   scale (`--ui-motion-*`, the same steps as the roll) and depth from
 *   `--ui-fade-change-depth` (defaulting to the roll's), read by
 *   `.ds-fade-change-*` in index.css; reduced motion is the scale's global
 *   collapse in tokens.css.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ChangeSwapShell } from "./ChangeSwapShell";
import { RollDirection } from "./constants";

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
  (props, ref) => (
    <ChangeSwapShell
      ref={ref}
      {...props}
      outClassName="ds-fade-change-out"
      inClassName="ds-fade-change-in"
    />
  ),
);
FadeChangeText.displayName = "FadeChangeText";
export { FadeChangeText };
