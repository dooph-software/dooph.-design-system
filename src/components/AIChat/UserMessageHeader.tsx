/*
 * UserMessageHeader — the user's prompt, heading its turn (Figma 854:1337).
 *
 * ## behavior
 * - A surface card; `children` flows straight into it.
 *
 * ## constraints
 * - NOT sticky. Pinning a turn's header, and having the next turn push it away,
 *   only works because of how the consumer structures turns inside their own
 *   scroll container — layout the package neither designs nor owns. Consumers
 *   wrap it: `<div className="sticky top-0">`. Clamping long prompts
 *   (`line-clamp-*`) is likewise a `className` decision.
 */
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type UserMessageHeaderProps = HTMLAttributes<HTMLDivElement>;

const UserMessageHeader = forwardRef<HTMLDivElement, UserMessageHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "w-full min-w-0 rounded-tight border border-solid border-border-primary bg-surface-primary p-rg shadow-standard text-style-body text-text wrap-break-word",
        className,
      )}
      {...props}
    />
  ),
);
UserMessageHeader.displayName = "UserMessageHeader";

export { UserMessageHeader };
