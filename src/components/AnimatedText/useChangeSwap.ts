/*
 * useChangeSwap — the content-swap engine behind the on-change text wrappers
 * (RollChangeText, FadeChangeText). It decides WHEN content changed and keeps
 * the outgoing node mounted until it has animated away; the wrapper decides
 * only what the animation LOOKS like (its own classes and keyframes).
 *
 * ## behavior
 * - A change is signalled by `changeKey`, or by the children themselves when
 *   they are a string or number. Mount never animates; opaque children with no
 *   `changeKey` never animate.
 * - Returns `exiting` (the outgoing node + its key + `onAnimationEnd`, or null)
 *   and `entering` (the incoming node's key, whether it is animating, and its
 *   `onAnimationEnd`). The wrapper renders both in one grid cell and spreads
 *   these onto its two spans.
 *
 * ## constraints
 * - This file holds no duration, no timer, no `requestAnimationFrame` and no
 *   `transitionend`. Each half is retired by its OWN `animationend`; an earlier
 *   RollChangeText ran a `setTimeout(300)` mirroring the CSS, which is the mirror
 *   that desyncs the moment either side is retuned. Timing lives in each
 *   wrapper's `--ui-*-change-*` tokens (architecture Rule 6).
 * - The swap is reconciled during RENDER, never in an effect. An effect runs
 *   after paint, so the browser painted one frame of the new content at rest
 *   before the animations yanked it back to their `from` pose — that frame read
 *   as the roll stuttering as it began. `source` is the anti-loop guard for the
 *   render-phase update.
 * - The exiting node is KEYED by a change counter and the entering node by the
 *   content key. Re-applying a class that is already present does not restart
 *   an animation, so without a fresh key two quick changes left the second exit
 *   already faded out.
 * - `entering` and `exiting` are retired INDEPENDENTLY, each guarded on the id
 *   it was scheduled for. The halves have separate durations (and the fade's in
 *   half is delayed); driving the in-class off `exiting` once let the exit's
 *   `animationend` strip it mid-flight and snap the arriving content to rest.
 * - `onAnimationEnd` ignores events bubbling from descendants
 *   (`e.target !== e.currentTarget`) — animated children inside the slot would
 *   otherwise retire the swap early.
 */
"use client";
import {
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type ReactNode,
} from "react";

export type ChangeSwapKey = string | number | undefined;

const keyOf = (
  changeKey: ChangeSwapKey,
  children: ReactNode,
): ChangeSwapKey =>
  changeKey ??
  (typeof children === "string" || typeof children === "number"
    ? children
    : undefined);

type AnimationEndHandler = (e: AnimationEvent<HTMLSpanElement>) => void;

export interface ChangeSwap {
  /** Outgoing content mid-exit, or null at rest. */
  exiting: {
    node: ReactNode;
    key: string;
    onAnimationEnd: AnimationEndHandler;
  } | null;
  /** The incoming (current) content's slot. */
  entering: {
    key: string;
    /** True from a change until its in-animation ends. */
    animating: boolean;
    onAnimationEnd: AnimationEndHandler | undefined;
  };
}

/* One object rather than several useStates: the reconcile runs in the RENDER
 * phase, and a render-phase update has to leave state consistent in one pass. */
type SwapState = {
  /** The key everything else was derived from — the anti-loop guard. */
  source: ChangeSwapKey;
  exiting: { node: ReactNode; id: number } | null;
  /** Id of the change the incoming node is animating in for, or null at rest. */
  entering: number | null;
  count: number;
};

export function useChangeSwap(
  changeKey: ChangeSwapKey,
  children: ReactNode,
): ChangeSwap {
  const key = keyOf(changeKey, children);

  /* What is currently on screen, so a change knows what to animate OUT. A ref
   * written after paint, because it must also follow children that change
   * WITHOUT a key change — which is not a swap and must not schedule a render. */
  const onScreen = useRef<ReactNode>(children);

  const [state, setState] = useState<SwapState>(() => ({
    source: key,
    exiting: null,
    entering: null,
    count: 0,
  }));

  if (state.source !== key) {
    const outgoing = onScreen.current;
    setState((cur) => {
      if (cur.source === key) return cur;
      /* An undefined previous key means opaque children with no changeKey:
       * there is no identity to have changed, so nothing animates. */
      if (cur.source === undefined) return { ...cur, source: key };
      const id = cur.count + 1;
      return {
        source: key,
        exiting: { node: outgoing, id },
        entering: id,
        count: id,
      };
    });
  }

  useEffect(() => {
    onScreen.current = children;
  }, [children]);

  const exitingId = state.exiting?.id;
  const enteringId = state.entering;

  const onExitEnd: AnimationEndHandler = (e) => {
    if (e.target !== e.currentTarget) return;
    setState((cur) =>
      cur.exiting != null && cur.exiting.id === exitingId
        ? { ...cur, exiting: null }
        : cur,
    );
  };

  const onEnterEnd: AnimationEndHandler = (e) => {
    if (e.target !== e.currentTarget) return;
    setState((cur) =>
      cur.entering === enteringId ? { ...cur, entering: null } : cur,
    );
  };

  return {
    exiting:
      state.exiting == null
        ? null
        : {
            node: state.exiting.node,
            key: `out-${state.exiting.id}`,
            onAnimationEnd: onExitEnd,
          },
    entering: {
      key: String(key),
      animating: state.entering != null,
      onAnimationEnd: state.entering != null ? onEnterEnd : undefined,
    },
  };
}
