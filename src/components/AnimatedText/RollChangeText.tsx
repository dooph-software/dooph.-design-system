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
 * - Nothing here may hold a duration. Each node is unmounted or un-classed by
 *   its OWN `animationend`; an earlier version ran a `setTimeout(300)` that
 *   mirrored the CSS, which is the mirror that desyncs the moment either side
 *   is retuned. Timing, easing, depth, blur and the reduced-motion case are all
 *   `--ui-roll-change-*` tokens read by `.ds-roll-change-*` in index.css.
 * - The swap is reconciled during RENDER, never in an effect. An effect runs
 *   AFTER paint, so the browser first painted one full frame of the new content
 *   at its resting position, and only then did the animations start and yank it
 *   back to its `from` pose. That frame of the finished state, immediately
 *   undone, is what read as the roll stuttering or dropping frames as it began.
 *   `source` is the key the rest was derived from — the guard that stops the
 *   render-phase update from looping. Same arrangement as RevealChangeText.
 * - The exiting node is KEYED by a change counter, and the entering node by the
 *   content key. Re-applying a class that is already present does not restart an
 *   animation, so without a fresh key two changes in quick succession would
 *   leave the second exit already faded out.
 * - `entering` and `exiting` are INDEPENDENT. They must be: the two halves have
 *   separate duration tokens, and out (200ms) is deliberately shorter than in
 *   (300ms). Driving the in-class off `exiting` — as this once did — meant the
 *   exit's `animationend` stripped the class mid-flight and snapped the arriving
 *   content to rest at two thirds of its travel.
 */
"use client";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { RollDirection } from "./constants";

export interface RollChangeTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Marks a content change. Defaults to children when children is a string/number. */
  changeKey?: string | number;
  /** Travel direction of the roll. `down` (default): new content settles in from above; `up`: rises in from below. */
  direction?: RollDirection;
  children: ReactNode;
}

type RollKey = string | number | undefined;

const keyOf = (
  changeKey: RollChangeTextProps["changeKey"],
  children: ReactNode,
): RollKey =>
  changeKey ??
  (typeof children === "string" || typeof children === "number"
    ? children
    : undefined);

type Exiting = { node: ReactNode; id: number };

/* One object rather than several useStates: the reconcile below runs in the
 * RENDER phase, and a render-phase update has to leave the component in a
 * consistent state in a single pass. */
type RollState = {
  /** The key everything else was derived from — the anti-loop guard. */
  source: RollKey;
  /** Outgoing content, mid roll-out. */
  exiting: Exiting | null;
  /** Id of the change the incoming node is rolling in for, or null at rest. */
  entering: number | null;
  count: number;
};

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
    const key = keyOf(changeKey, children);

    /* What is currently on screen, so a change knows what to roll OUT. Held in
     * a ref and written after paint because it must also track children that
     * change WITHOUT a key change — which is not a roll, and must not schedule
     * a render. */
    const onScreen = useRef<ReactNode>(children);

    const [state, setState] = useState<RollState>(() => ({
      source: key,
      exiting: null,
      entering: null,
      count: 0,
    }));

    /* Render-phase reconcile. React re-runs this component immediately, before
     * the browser paints, so the very first frame of a change already carries
     * both animations at their start pose. */
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

    /* Both halves retire themselves, each on its own animation. Each is guarded
     * on the id it was scheduled for, so a stale animation from a superseded
     * change cannot clear a newer one. */
    const onExitEnd = (e: AnimationEvent<HTMLSpanElement>) => {
      if (e.target !== e.currentTarget) return;
      setState((cur) =>
        cur.exiting != null && cur.exiting.id === exitingId
          ? { ...cur, exiting: null }
          : cur,
      );
    };

    const onEnterEnd = (e: AnimationEvent<HTMLSpanElement>) => {
      if (e.target !== e.currentTarget) return;
      setState((cur) =>
        cur.entering === enteringId ? { ...cur, entering: null } : cur,
      );
    };

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
        {state.exiting != null && (
          <span
            /* Fresh key per change so the exit animation always restarts. */
            key={`out-${state.exiting.id}`}
            aria-hidden
            className="[grid-area:1/1] ds-roll-change-out"
            /* The only thing that removes the old content. Guarded on the id so
             * a stale animation from a superseded change cannot clear a newer
             * one. */
            onAnimationEnd={onExitEnd}
          >
            {state.exiting.node}
          </span>
        )}
        <span
          key={String(key)}
          className={cn(
            "[grid-area:1/1]",
            state.entering != null && "ds-roll-change-in",
          )}
          /* Drops the class once the roll lands, so `will-change` does not
           * strand a compositor layer on every settled node. The animation
           * fills to exactly the resting style, so removing it shows nothing. */
          onAnimationEnd={state.entering != null ? onEnterEnd : undefined}
        >
          {children}
        </span>
      </span>
    );
  },
);
RollChangeText.displayName = "RollChangeText";
export { RollChangeText };
