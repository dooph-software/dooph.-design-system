import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface RollHoverTextProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Text to animate. Must be a string — the component splits it per character. */
  children: string;
  /** Force the rolled state regardless of hover (touch, focus-visible, programmatic). */
  active?: boolean;
}

/**
 * RollHoverText — on hover, each character rolls in place on a shallow 3D barrel
 * and blurs through the rotation, staggered so many characters are mid-roll at
 * once. Un-hovering reverses the motion from wherever it currently sits.
 *
 * The text never changes — the incoming glyph is identical to the outgoing one —
 * so every character cell is self-sizing and nothing needs measuring. That is why
 * this needs no state, no hooks, and no "use client": hover is browser-owned.
 *
 * Responds to its own :hover, an ancestor .group:hover, or the `active` prop.
 * Inherits all typography; compose it inside ButtonText/BodyText or a Button.
 * <Button className="group"><ButtonText><RollHoverText>Deploy now</RollHoverText></ButtonText></Button>
 */
const RollHoverText = forwardRef<HTMLSpanElement, RollHoverTextProps>(
  ({ children, active, className, ...props }, ref) => {
    // Split words from whitespace runs so spaces render as plain text between
    // word wrappers — only glyphs get cells. The char index runs continuously
    // across the whole string so the wave sweeps the full phrase, not each word.
    let index = 0;

    return (
      <span
        ref={ref}
        aria-label={children}
        data-active={active ? "true" : undefined}
        className={cn("ds-roll-hover", className)}
        {...props}
      >
        {children.split(/(\s+)/).map((segment, segmentIndex) => {
          if (segment === "") return null;
          if (/^\s+$/.test(segment)) {
            return (
              <span key={segmentIndex} aria-hidden="true">
                {segment}
              </span>
            );
          }
          return (
            <span key={segmentIndex} aria-hidden="true" className="ds-roll-hover-word">
              {Array.from(segment).map((char, charIndex) => (
                <span
                  key={charIndex}
                  className="ds-roll-hover-char"
                  style={{ "--i": index++ } as CSSProperties}
                >
                  <span className="ds-roll-hover-out">{char}</span>
                  <span className="ds-roll-hover-in">{char}</span>
                </span>
              ))}
            </span>
          );
        })}
      </span>
    );
  },
);
RollHoverText.displayName = "RollHoverText";
export { RollHoverText };
