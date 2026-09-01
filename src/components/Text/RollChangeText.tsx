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
 * - Nothing here may hold a duration. The exiting node is unmounted by its own
 *   `animationend`; an earlier version ran a `setTimeout(300)` that mirrored the
 *   CSS, which is the mirror that desyncs the moment either side is retuned.
 *   Timing, easing, depth, blur and the reduced-motion case are all
 *   `--ui-roll-change-*` tokens read by `.ds-roll-change-*` in index.css.
 * - The exiting node is KEYED by a change counter. Re-applying a class that is
 *   already present does not restart an animation, so without a fresh key two
 *   changes in quick succession would leave the second exit already faded out.
 */
"use client";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
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

const keyOf = (
  changeKey: RollChangeTextProps["changeKey"],
  children: ReactNode,
) =>
  changeKey ??
  (typeof children === "string" || typeof children === "number"
    ? children
    : undefined);

type Exiting = { node: ReactNode; id: number };

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
    const prevKey = useRef(key);
    const prevChildren = useRef(children);
    const changeCount = useRef(0);
    const [exiting, setExiting] = useState<Exiting | null>(null);

    useEffect(() => {
      if (key !== prevKey.current && prevKey.current !== undefined) {
        changeCount.current += 1;
        setExiting({ node: prevChildren.current, id: changeCount.current });
      }
      prevKey.current = key;
      prevChildren.current = children;
    }, [key, children]);

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
            /* Fresh key per change so the exit animation always restarts. */
            key={exiting.id}
            aria-hidden
            className="[grid-area:1/1] ds-roll-change-out"
            /* The only thing that removes the old content. Guarded on the id so
             * a stale animation from a superseded change cannot clear a newer
             * one. */
            onAnimationEnd={(e) => {
              if (e.target !== e.currentTarget) return;
              setExiting((cur) => (cur && cur.id === exiting.id ? null : cur));
            }}
          >
            {exiting.node}
          </span>
        )}
        <span
          key={String(key)}
          className={cn(
            "[grid-area:1/1]",
            exiting != null && "ds-roll-change-in",
          )}
        >
          {children}
        </span>
      </span>
    );
  },
);
RollChangeText.displayName = "RollChangeText";
export { RollChangeText };
