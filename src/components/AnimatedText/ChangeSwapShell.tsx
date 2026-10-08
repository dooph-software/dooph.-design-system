/*
 * ChangeSwapShell — the internal render shell behind RollChangeText and
 * FadeChangeText: one grid cell holding the keyed, aria-hidden exiting copy and
 * the entering copy, wired to `useChangeSwap`. Not re-exported from the folder
 * index; each wrapper passes only its out/in class pair.
 *
 * ## behavior
 * - Renders an `inline-grid` root with the soft vertical mask `ds-change-swap`
 *   (index.css) in place of a hard `overflow: hidden` clip, carrying `--ds-roll-dir`
 *   (`-1` for `up`, `1` for `down`, the default) ahead of the consumer's
 *   `style`, and the consumer's `className` last.
 * - While a change is in flight the outgoing copy sits in the same grid cell,
 *   `aria-hidden`, with `outClassName`; the incoming copy carries `inClassName`
 *   only until its own animation ends.
 *
 * ## constraints
 * - Keep both `key`s and both `onAnimationEnd`s exactly as wired: they are how
 *   `useChangeSwap` restarts and retires each half (see its constraints). Do not
 *   merge the two spans' handlers or drop either key.
 * - The entering span's `onAnimationEnd` is not optional: it drops the in-class
 *   once the animation lands, so `will-change` does not strand a compositor
 *   layer on every settled node.
 * - `ds-change-swap` must stay on the root and must not gain `overflow: hidden`
 *   back: a hard clip slices the glyph and its blur halo mid-roll. Its padding
 *   and negative margin are equal and opposite, so the root's outer size does
 *   not change; keep them as a pair.
 * - The shell owns structure only. It holds no class that animates and no
 *   duration; each wrapper's look (classes, keyframes, motion-scale timing)
 *   stays in that wrapper and index.css. Two wrappers once copied this shell
 *   line for line and drifted; do not re-inline it into either.
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

export interface ChangeSwapShellProps extends HTMLAttributes<HTMLSpanElement> {
  changeKey?: string | number;
  direction?: RollDirection;
  children: ReactNode;
  /** The wrapper's exit animation class (on the outgoing copy). */
  outClassName: string;
  /** The wrapper's entry animation class (on the incoming copy while it animates). */
  inClassName: string;
}

export const ChangeSwapShell = forwardRef<HTMLSpanElement, ChangeSwapShellProps>(
  (
    {
      changeKey,
      children,
      className,
      direction = RollDirection.down,
      style,
      outClassName,
      inClassName,
      ...props
    },
    ref,
  ) => {
    const { exiting, entering } = useChangeSwap(changeKey, children);

    return (
      <span
        ref={ref}
        className={cn("ds-change-swap inline-grid", className)}
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
            className={cn("[grid-area:1/1]", outClassName)}
            onAnimationEnd={exiting.onAnimationEnd}
          >
            {exiting.node}
          </span>
        )}
        <span
          key={entering.key}
          className={cn("[grid-area:1/1]", entering.animating && inClassName)}
          /* Drops the in-class once the animation lands, so `will-change` does
           * not strand a compositor layer on every settled node. */
          onAnimationEnd={entering.onAnimationEnd}
        >
          {children}
        </span>
      </span>
    );
  },
);
ChangeSwapShell.displayName = "ChangeSwapShell";
