/*
 * AIToolPart — one tool call in the transcript (Figma 761:1329).
 *
 * ## behavior
 * - `state` picks the tone: `active` shimmers the label via ShimmerText (re-based
 *   onto the tool pair by `ds-chat-tool-shimmer`), `complete` rests at ghost
 *   weight, `error` paints the label danger.
 * - `meta` (timing, token count, a failure reason) stays visible while active
 *   and is revealed on hover once settled.
 * - `variant={AIToolPartVariant.skill}` is the static skill-load row: no hover
 *   response and no meta.
 *
 * ## constraints
 * - Every string is the consumer's: the label is `children`, `meta` is a
 *   ReactNode. The component formats nothing and measures nothing — it holds no
 *   timer. Elapsed time is ticked by the consumer and passed in as `meta`, so it
 *   starts whenever THEY decide, not on mount.
 * - `state` is AIToolPartState, never an AI SDK state string. Mapping one onto
 *   the other is the consumer's one line of glue.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { ShimmerText } from "../AnimatedText";
import { AIToolPartState, AIToolPartVariant } from "./constants";

export interface AIToolPartProps extends HTMLAttributes<HTMLDivElement> {
  /** The row's label, e.g. "Viewing ball bearing housing". */
  children: ReactNode;
  state?: AIToolPartState;
  variant?: AIToolPartVariant;
  /** Secondary detail — timing, tokens or a failure reason. Ignored on `skill`. */
  meta?: ReactNode;
}

const AIToolPart = forwardRef<HTMLDivElement, AIToolPartProps>(
  (
    {
      children,
      state = AIToolPartState.complete,
      variant = AIToolPartVariant.simple,
      meta,
      className,
      ...props
    },
    ref,
  ) => {
    const isActive = state === AIToolPartState.active;
    const isSkill = variant === AIToolPartVariant.skill;
    const showMeta = !isSkill && meta != null && meta !== false;

    return (
      <div
        ref={ref}
        data-state={state}
        data-variant={variant}
        className={cn(
          "flex w-full min-w-0 select-none items-center gap-sm px-xs py-xxs text-style-body",
          !isSkill && "ds-chat-reveal-root",
          className,
        )}
        {...props}
      >
        {isActive ? (
          <ShimmerText className="ds-chat-tool-shimmer shrink-0 whitespace-nowrap">
            {children}
          </ShimmerText>
        ) : (
          <span
            className={cn(
              "shrink-0 whitespace-nowrap",
              state === AIToolPartState.error
                ? "text-danger-primary"
                : "text-ghost-fg",
              state === AIToolPartState.complete && !isSkill && "ds-chat-lift",
            )}
          >
            {children}
          </span>
        )}
        {showMeta ? (
          <span
            className={cn(
              "min-w-0 truncate text-text-tertiary",
              !isActive && "ds-chat-reveal",
            )}
          >
            {meta}
          </span>
        ) : null}
      </div>
    );
  },
);
AIToolPart.displayName = "AIToolPart";

export { AIToolPart };
