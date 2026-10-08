/*
 * AITurnSummary — the closing row of a settled assistant turn (Figma 761:1368).
 *
 * ## behavior
 * - `label` rests at ghost weight ("Worked for 1m 22s"), `meta` at tertiary
 *   ("12k tokens"). With `copyValue`, a ghost CopyButton is revealed on hover
 *   (Figma Variant2) and on keyboard focus.
 *
 * ## constraints
 * - Durations and counts arrive formatted. The component never reads a clock
 *   or a usage object; what "worked for" measures is the consumer's decision.
 * - Render it only once a turn has settled — that rule is the consumer's to
 *   apply, since only they know when their stream has finished.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { CopyButton } from "../CopyButton";
import { CopyButtonVariant } from "../CopyButton/constants";

export interface AITurnSummaryProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Primary summary, e.g. "Worked for 1m 22s". */
  label?: ReactNode;
  /** Secondary summary, e.g. "12k tokens". */
  meta?: ReactNode;
  /** Text written to the clipboard. Omit to render no copy affordance. */
  copyValue?: string;
  /** Accessible name for the copy button — the consumer's copy. */
  copyLabel?: string;
}

const AITurnSummary = forwardRef<HTMLDivElement, AITurnSummaryProps>(
  ({ label, meta, copyValue, copyLabel, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "ds-chat-reveal-root flex h-button-sm w-full min-w-0 select-none items-center gap-sm px-xs text-style-body",
        className,
      )}
      {...props}
    >
      {label != null && label !== false ? (
        <span className="shrink-0 whitespace-nowrap text-ghost-fg">{label}</span>
      ) : null}
      {meta != null && meta !== false ? (
        <span className="min-w-0 truncate text-text-tertiary">{meta}</span>
      ) : null}
      {copyValue !== undefined ? (
        <CopyButton
          variant={CopyButtonVariant.ghost}
          value={copyValue}
          // Spread only when given: an explicit `aria-label={undefined}` would
          // override CopyButton's own default name and leave the button unnamed.
          {...(copyLabel !== undefined ? { "aria-label": copyLabel } : {})}
          className="ds-chat-reveal shrink-0"
        />
      ) : null}
    </div>
  ),
);
AITurnSummary.displayName = "AITurnSummary";

export { AITurnSummary };
