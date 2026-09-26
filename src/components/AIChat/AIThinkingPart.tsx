/*
 * AIThinkingPart — the model's reasoning (Figma 761:1345).
 *
 * ## behavior
 * - `thinking`: the label shimmers (ShimmerText, re-based by
 *   `ds-chat-thinking-shimmer`) and a transcript, if given, streams inline and
 *   is always visible — there is nothing to toggle while it is live.
 * - `thought` with a transcript: the row becomes a disclosure. The chevron is
 *   revealed on hover and stays while open; the transcript collapses with a
 *   grid-rows transition timed by `--ui-chat-disclosure-*`.
 * - `thought` without a transcript: a plain settled row.
 * - Open state is controllable (`open` / `onOpenChange`) or uncontrolled
 *   (`defaultOpen`). It is the only state this component owns.
 *
 * ## constraints
 * - A transcript is "available" exactly when `children` is given. Providers that
 *   never stream reasoning text simply pass none, and the row stays static.
 * - `label` and `meta` are the consumer's copy ("Thinking", "Thought for 26s",
 *   "3s • 743 tokens"). No timer lives here — the consumer ticks elapsed time,
 *   so it can start counting whenever it chooses.
 * - Transcript colour is inherited by `ds-chat-prose`: tertiary while live,
 *   secondary once opened, as Figma draws them.
 */
"use client";

import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { ShimmerText } from "../AnimatedText";
import { Button } from "../Button";
import { ButtonVariant } from "../Button/constants";
import { DropdownIcon, IconSize } from "../Icons";
import { AIThinkingPartState } from "./constants";

export interface AIThinkingPartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  state?: AIThinkingPartState;
  /** "Thinking" while live, "Thought for 26s" once settled — the consumer's copy. */
  label: ReactNode;
  /** Secondary detail beside the label, e.g. "3s • 743 tokens". */
  meta?: ReactNode;
  /** The reasoning transcript. Its presence is what makes a settled row expandable. */
  children?: ReactNode;
  /**
   * Animate transcript blocks in as they arrive (see AITextPart). Applies to
   * the live `thinking` transcript only — a settled transcript never animates.
   */
  streamingAnimation?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AIThinkingPart = forwardRef<HTMLDivElement, AIThinkingPartProps>(
  (
    {
      state = AIThinkingPartState.thinking,
      label,
      meta,
      children,
      streamingAnimation = false,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      className,
      ...props
    },
    ref,
  ) => {
    const transcriptId = useId();
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const open = openProp ?? uncontrolledOpen;
    const setOpen = useCallback(
      (next: boolean) => {
        if (openProp === undefined) setUncontrolledOpen(next);
        onOpenChange?.(next);
      },
      [openProp, onOpenChange],
    );

    const isThinking = state === AIThinkingPartState.thinking;
    const hasTranscript = children != null && children !== false;
    const hasMeta = meta != null && meta !== false;

    const metaNode = hasMeta ? (
      <span className="min-w-0 truncate whitespace-nowrap text-style-body text-ghost-fg">
        {meta}
      </span>
    ) : null;

    if (isThinking) {
      return (
        <div
          ref={ref}
          data-state={state}
          className={cn(
            "flex w-full min-w-0 flex-col gap-sm px-xs py-xxs",
            className,
          )}
          {...props}
        >
          <div className="flex min-w-0 select-none items-center gap-sm">
            <ShimmerText className="ds-chat-thinking-shimmer shrink-0 whitespace-nowrap text-style-body">
              {label}
            </ShimmerText>
            {metaNode}
          </div>
          {hasTranscript ? (
            <div
              data-streaming-animation={streamingAnimation || undefined}
              className="ds-chat-prose min-w-0 pl-xs text-style-body text-text-tertiary wrap-break-word"
            >
              {children}
            </div>
          ) : null}
        </div>
      );
    }

    const labelNode = (
      <span
        className={cn(
          "shrink-0 whitespace-nowrap text-style-body text-ghost-fg",
          hasTranscript && "ds-chat-lift",
        )}
      >
        {label}
      </span>
    );

    if (!hasTranscript) {
      return (
        <div
          ref={ref}
          data-state={state}
          className={cn(
            "flex w-full min-w-0 select-none items-center gap-sm px-xs py-xxs",
            className,
          )}
          {...props}
        >
          {labelNode}
          {metaNode}
        </div>
      );
    }

    const openState = open ? "open" : "closed";

    return (
      <div
        ref={ref}
        data-state={openState}
        className={cn(
          "ds-chat-reveal-root flex w-full min-w-0 flex-col",
          className,
        )}
        {...props}
      >
        <Button
          variant={ButtonVariant.text}
          data-state={openState}
          aria-expanded={open}
          aria-controls={transcriptId}
          onClick={() => setOpen(!open)}
          // `h-auto!`: the row hugs its text like every other part. Button's
          // `h-button` is a package utility tailwind-merge cannot recognise as
          // a height, so a plain `h-auto` would not replace it.
          className="h-auto! w-full justify-start gap-sm border-0 px-xs py-xxs"
        >
          {labelNode}
          {metaNode}
          {/* Down while closed, up while open — ds-chat-chevron rotates on the
              button's data-state, timed by --ui-chat-disclosure-*. */}
          <DropdownIcon
            size={IconSize.rg}
            aria-hidden
            className="ds-chat-chevron ds-chat-reveal shrink-0 text-ghost-fg-active"
          />
        </Button>
        <div
          id={transcriptId}
          data-state={openState}
          inert={!open}
          className="ds-chat-disclosure"
        >
          <div>
            {/* px-xs matches the row's own inset; pl-xs indents the transcript
                under the label, as the live variant does. */}
            <div className="ds-chat-prose mx-xs min-w-0 pb-xxs pl-xs pt-sm text-style-body text-text-secondary wrap-break-word">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
AIThinkingPart.displayName = "AIThinkingPart";

export { AIThinkingPart };
