"use client";
import { forwardRef, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { RollDirection } from "./constants";

export interface RollChangeTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Marks a content change. Defaults to children when children is a string/number. */
  changeKey?: string | number;
  /** Travel direction of the roll. `down` (default): new content settles in from above; `up`: rises in from below. */
  direction?: RollDirection;
  children: ReactNode;
}

const keyOf = (changeKey: RollChangeTextProps["changeKey"], children: ReactNode) =>
  changeKey ?? (typeof children === "string" || typeof children === "number" ? children : undefined);

/**
 * RollChangeText — when content changes, the old text rolls out and blurs away
 * while the new text rolls in and settles into focus. `direction` chooses the
 * travel: `down` (default) settles the new text in from above, `up` rises it in
 * from below.
 * <RollChangeText changeKey={model.id}><BodyText>{model.name}</BodyText></RollChangeText>
 */
const RollChangeText = forwardRef<HTMLSpanElement, RollChangeTextProps>(
  ({ changeKey, children, className, direction = RollDirection.down, style, ...props }, ref) => {
    const key = keyOf(changeKey, children);
    const prevKey = useRef(key);
    const prevChildren = useRef(children);
    const [exiting, setExiting] = useState<ReactNode>(null);

    useEffect(() => {
      if (key !== prevKey.current && prevKey.current !== undefined) {
        setExiting(prevChildren.current);
        const t = setTimeout(() => setExiting(null), 300);
        prevKey.current = key;
        prevChildren.current = children;
        return () => clearTimeout(t);
      }
      prevKey.current = key;
      prevChildren.current = children;
    }, [key, children]);

    return (
      <span
        ref={ref}
        className={cn("inline-grid overflow-hidden", className)}
        style={{ "--ds-roll-dir": direction === RollDirection.up ? -1 : 1, ...style } as CSSProperties}
        {...props}
      >
        {exiting != null && (
          <span aria-hidden className="[grid-area:1/1] motion-safe:animate-[ds-roll-out_200ms_cubic-bezier(0.4,0,1,1)_forwards]">
            {exiting}
          </span>
        )}
        <span key={String(key)} className={cn(
          "[grid-area:1/1]",
          exiting != null && "motion-safe:animate-[ds-roll-in_300ms_cubic-bezier(0.32,0.72,0,1)_both]",
        )}>
          {children}
        </span>
      </span>
    );
  },
);
RollChangeText.displayName = "RollChangeText";
export { RollChangeText };
