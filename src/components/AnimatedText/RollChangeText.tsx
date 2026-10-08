/*
 * RollChangeText — old content rolls out and blurs away while new content rolls
 * in and settles, on every content change.
 *
 * ## behavior
 * - A change is signalled by `changeKey`, or by the children themselves when
 *   they are a string or number. Mount never animates.
 * - `direction` picks the travel: `down` (default) settles the new content in
 *   from above, `up` rises it in from below. It is one signed custom property,
 *   so both keyframes flip from a single value.
 * - The roll is clipped by a soft vertical mask (`ds-change-swap`), not a hard
 *   edge, with em-based blur and travel, so a glyph fades at the box edge
 *   rather than being sliced. The box's outer size is unchanged by it.
 *
 * ## constraints
 * - A wrapper, not a BaseText prop: it has to be able to wrap icons and
 *   arbitrary children, not just text.
 * - The swap engine lives in `useChangeSwap` and is shared with
 *   FadeChangeText. Do not re-inline it here: its render-phase reconcile, keyed
 *   exit and independent in/out retirement each fixed a shipped bug, and two
 *   copies drift. The render shell (grid cell, keyed exit, entry span) lives
 *   in `ChangeSwapShell` for the same reason. This file owns only the roll's
 *   look: its class pair.
 * - Nothing here may hold a duration. Timing and easing come from the motion
 *   scale (`--ui-motion-*`), depth, blur and clip breathing room from `--ui-roll-change-*`, all read
 *   by `.ds-roll-change-*` in index.css; reduced motion is the scale's global
 *   collapse in tokens.css. Out (`base`) is deliberately shorter than in
 *   (`slow`), which is why the two halves retire independently.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ChangeSwapShell } from "./ChangeSwapShell";
import { RollDirection } from "./constants";

export interface RollChangeTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Marks a content change. Defaults to children when children is a string/number. */
  changeKey?: string | number;
  /** Travel direction of the roll. `down` (default): new content settles in from above; `up`: rises in from below. */
  direction?: RollDirection;
  children: ReactNode;
}

/**
 * <RollChangeText changeKey={model.id}><BodyText>{model.name}</BodyText></RollChangeText>
 */
const RollChangeText = forwardRef<HTMLSpanElement, RollChangeTextProps>(
  (props, ref) => (
    <ChangeSwapShell
      ref={ref}
      {...props}
      outClassName="ds-roll-change-out"
      inClassName="ds-roll-change-in"
    />
  ),
);
RollChangeText.displayName = "RollChangeText";
export { RollChangeText };
