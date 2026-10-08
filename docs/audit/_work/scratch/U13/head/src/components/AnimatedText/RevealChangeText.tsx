/*
 * RevealChangeText — content that slides out of a collapsed slot and tucks back
 * into it when it changes or goes away.
 *
 * ## behavior
 * - A change is signalled by `changeKey`, or by the children themselves when
 *   they are a string or number. `changeKey={null}` means "nothing to show":
 *   the slot collapses and stays collapsed.
 * - With content already on screen, a change runs BOTH halves in order — the
 *   old content collapses toward the pinned edge, the swap happens while the
 *   slot is 0 wide, and the new content reveals back out from that same edge.
 * - `direction` picks the pinned edge. Mount never animates.
 *
 * ## constraints
 * - WIDTH is the animated property, not a transform. The point is that the row
 *   around the slot re-flows — and, if it is centred, re-centres — as the slot
 *   opens and closes; a transform has no layout effect and would leave the row
 *   snapping between two widths.
 * - Content inside never rolls or fades: it has a stable identity and only its
 *   slot moves. Pair it with RollChangeText for the piece that swaps its text,
 *   and hang that roll off `onSettled` so it FOLLOWS the reveal rather than
 *   racing it.
 * - Nothing here may hold a duration. Timing, easing and the reduced-motion
 *   case are `--ui-reveal-change-*` tokens read by `.ds-reveal-change` in
 *   index.css. Reduced motion drops those to 1ms rather than to
 *   `transition: none`: the content swap AND `onSettled` both hang off
 *   `transitionend`, which `transition: none` would never fire — stranding the
 *   outgoing content on screen forever.
 * - Slot state is reconciled during RENDER, never in an effect. Doing it in an
 *   effect commits a frame of stale slot state and schedules another, which is
 *   the cascading render `react-hooks/set-state-in-effect` flags.
 */
"use client";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type TransitionEvent,
} from "react";
import { cn } from "../../utils/cn";
import { RevealDirection } from "./constants";

/** Nothing to show — the slot sits collapsed. */
type RevealKey = string | number | symbol | null;

/**
 * Stand-in key for opaque children (an element, a fragment) when no `changeKey`
 * is given. It is stable, so such content reveals once and then never re-runs
 * the cycle: pass `changeKey` to make an opaque child swappable.
 */
const OPAQUE: unique symbol = Symbol("ds-reveal-opaque");

const keyOf = (
  changeKey: RevealChangeTextProps["changeKey"],
  children: ReactNode,
): RevealKey => {
  /* `!== undefined`, not `??`: `null` is a meaningful value here (collapse), so
   * it must not fall through to the children-derived key. */
  if (changeKey !== undefined) return changeKey;
  if (typeof children === "string" || typeof children === "number")
    return children;
  return children == null ? null : OPAQUE;
};

/** Where the slot is in its collapse/reveal cycle. `idle` means settled. */
type RevealPhase = "idle" | "collapsing" | "opening";

/**
 * One atom rather than five separate pieces of state.
 *
 * The reconcile that drives this runs in the RENDER phase, and a render-phase
 * update has to be idempotent because React may render twice before committing.
 * Five independent setStates cannot guarantee that; one object can.
 *
 * `source` is the key the rest was derived from — the guard that stops the
 * render-phase update from looping.
 */
type RevealState = {
  source: RevealKey;
  shown: RevealKey;
  shownChildren: ReactNode;
  open: boolean;
  phase: RevealPhase;
};

/* Measuring has to happen before paint, so a swap never animates toward the
 * OUTGOING width for a frame. On the server there is nothing to measure, and
 * useLayoutEffect would only log a warning. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface RevealChangeTextProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Identity of the content. When it changes, the slot collapses, swaps in the
   * new content, and reveals again. `null` collapses the slot and leaves it
   * collapsed. Defaults to `children` when children is a string or number, and
   * to `null` when children is nullish.
   */
  changeKey?: string | number | null;
  /** Edge the content travels toward as the slot opens. `left` by default. */
  direction?: RevealDirection;
  /**
   * Fired when the slot returns to rest after a change — the reveal, the
   * collapse, or a full collapse-then-reveal has finished. Use it to sequence
   * whatever should follow the reveal rather than race it.
   */
  onSettled?: () => void;
  children: ReactNode;
}

/**
 * <RevealChangeText changeKey={section}>
 *   <BodyText>{section}</BodyText>
 * </RevealChangeText>
 */
const RevealChangeText = forwardRef<HTMLSpanElement, RevealChangeTextProps>(
  (
    {
      changeKey,
      children,
      className,
      direction = RevealDirection.left,
      onSettled,
      onTransitionEnd,
      style,
      ...props
    },
    ref,
  ) => {
    const key = keyOf(changeKey, children);

    /* Adjusted during RENDER, not in an effect. Reconciling in an effect commits
     * one frame of stale slot state and then immediately schedules another — the
     * cascading render `react-hooks/set-state-in-effect` exists to catch. The
     * `source` guard is what keeps this from looping. */
    const [state, setState] = useState<RevealState>(() => ({
      source: key,
      shown: key,
      shownChildren: children,
      open: key !== null,
      phase: "idle",
    }));

    if (state.source !== key) {
      setState((cur) => {
        if (cur.source === key) return cur;
        /* Nothing on screen to clear — open straight into the new content.
         * Otherwise collapse first; the transitionend below swaps the content
         * and re-opens, so the old content tucks away before the new one
         * slides out. */
        if (cur.shown === null) {
          return {
            source: key,
            shown: key,
            shownChildren: children,
            open: key !== null,
            phase: key !== null ? "opening" : "idle",
          };
        }
        return { ...cur, source: key, open: false, phase: "collapsing" };
      });
    }

    /* The children that belong to the LATEST key. Read only from the
     * transitionend handler, which fires long after the effect has run. */
    const latestChildren = useRef(children);
    useEffect(() => {
      latestChildren.current = children;
    });

    /* Fires once per settle, on the trailing edge. Guarded by a ref rather than
     * by the effect's deps so a caller passing an inline `onSettled` (a new
     * function identity every render) cannot re-fire it. */
    const settled = useRef(true);
    useEffect(() => {
      if (state.phase !== "idle") {
        settled.current = false;
        return;
      }
      if (settled.current) return;
      settled.current = true;
      onSettled?.();
    }, [state.phase, onSettled]);

    /* The slot is sized from its content's natural width, which stays intact
     * even while the slot around it is 0 wide because the content is
     * `flex-shrink: 0` and `nowrap`. Read synchronously before paint on a swap;
     * the ResizeObserver then covers font loading and resizes for free. */
    const contentRef = useRef<HTMLSpanElement>(null);
    const [width, setWidth] = useState<number | null>(null);
    useIsomorphicLayoutEffect(() => {
      const el = contentRef.current;
      if (!el) return;
      const read = () => setWidth(el.getBoundingClientRect().width);
      read();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(read);
      observer.observe(el);
      return () => observer.disconnect();
    }, [state.shown]);

    const handleTransitionEnd = (event: TransitionEvent<HTMLSpanElement>) => {
      onTransitionEnd?.(event);
      if (event.target !== event.currentTarget) return;
      if (event.propertyName !== "width") return;
      setState((cur) => {
        if (cur.phase !== "collapsing")
          return cur.phase === "idle" ? cur : { ...cur, phase: "idle" };
        /* Swap to whatever the LATEST key is, not to whatever it was when the
         * collapse started — rapid changes land on the newest content. */
        return {
          ...cur,
          shown: cur.source,
          shownChildren: latestChildren.current,
          open: cur.source !== null,
          phase: cur.source !== null ? "opening" : "idle",
        };
      });
    };

    return (
      <span
        ref={ref}
        data-open={state.open ? "true" : "false"}
        data-direction={direction}
        className={cn("ds-reveal-change", className)}
        style={
          {
            ...(width === null
              ? {}
              : { "--ds-reveal-change-width": `${width}px` }),
            ...style,
          } as CSSProperties
        }
        onTransitionEnd={handleTransitionEnd}
        {...props}
      >
        <span
          ref={contentRef}
          className="ds-reveal-change-content"
          aria-hidden={state.open ? undefined : true}
        >
          {state.shown === key ? children : state.shownChildren}
        </span>
      </span>
    );
  },
);
RevealChangeText.displayName = "RevealChangeText";
export { RevealChangeText };
