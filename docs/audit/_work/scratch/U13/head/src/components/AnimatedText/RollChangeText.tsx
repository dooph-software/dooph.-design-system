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
 *
 * ## constraints
 * - A wrapper, not a BaseText prop: it has to be able to wrap icons and
 *   arbitrary children, not just text.
 * - The swap engine lives in `useChangeSwap` and is shared with
 *   FadeChangeText. Do not re-inline it here: its render-phase reconcile, keyed
 *   exit and independent in/out retirement each fixed a shipped bug, and two
 *   copies drift. This file owns only the roll's look.
 * - Nothing here may hold a duration. Timing, easing, depth, blur and the
 *   reduced-motion case are all `--ui-roll-change-*` tokens read by
 *   `.ds-roll-change-*` in index.css; out (200ms) is deliberately shorter than
 *   in (300ms), which is why the two halves retire independently.
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
            className="[grid-area:1/1] ds-roll-change-out"
            onAnimationEnd={exiting.onAnimationEnd}
          >
            {exiting.node}
          </span>
        )}
        <span
          key={entering.key}
          className={cn(
            "[grid-area:1/1]",
            entering.animating && "ds-roll-change-in",
          )}
          /* Drops the class once the roll lands, so `will-change` does not
           * strand a compositor layer on every settled node. */
          onAnimationEnd={entering.onAnimationEnd}
        >
          {children}
        </span>
      </span>
    );
  },
);
RollChangeText.displayName = "RollChangeText";
export { RollChangeText };
