/*
 * AITextPart — the assistant's prose (Figma 761:1342).
 *
 * ## behavior
 * - A shell: `children` is whatever the consumer renders — Streamdown,
 *   react-markdown, MDX or a plain string. `ds-chat-prose` styles the elements
 *   any of them emit.
 * - `streamingAnimation` makes each block rise out of a blur as it mounts
 *   (`ds-chat-stream-in`, timed by the --ui-chat-stream-* tokens).
 *
 * ## constraints
 * - The package takes NO dependency on a markdown renderer. Do not import one
 *   here; the renderer is the consumer's choice, as is its streaming memo.
 * - No wrapper around `children` (architecture Rule 3): the prose selectors are
 *   written against this element's own descendants.
 * - Pass `streamingAnimation` only while THIS part is streaming. It animates
 *   blocks as they mount, so leaving it on for history would blur every block
 *   of every message in on load. Turning it off mid-flight settles any block
 *   still animating straight to rest.
 */
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface AITextPartProps extends HTMLAttributes<HTMLDivElement> {
  /** Animate blocks in as they arrive. True only while this part streams. */
  streamingAnimation?: boolean;
}

const AITextPart = forwardRef<HTMLDivElement, AITextPartProps>(
  ({ className, streamingAnimation = false, ...props }, ref) => (
    <div
      ref={ref}
      data-streaming-animation={streamingAnimation || undefined}
      className={cn(
        "ds-chat-prose w-full min-w-0 px-xs text-style-body text-text wrap-break-word",
        className,
      )}
      {...props}
    />
  ),
);
AITextPart.displayName = "AITextPart";

export { AITextPart };
