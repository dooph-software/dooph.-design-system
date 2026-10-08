/*
 * UserMessageHeader — the user's prompt, heading its turn (Figma 854:1337): a
 * surface card that `children` flows straight into. It is NOT sticky: pinning a
 * turn's header and having the next turn push it away depends on how the
 * consumer structures turns inside their own scroll container, which the
 * package neither designs nor owns. Consumers wrap it
 * (`<div className="sticky top-0">`); clamping long prompts (`line-clamp-*`) is
 * likewise a `className` decision.
 */
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { BodyText } from "../Text";

export type UserMessageHeaderProps = HTMLAttributes<HTMLDivElement>;

const UserMessageHeader = forwardRef<HTMLDivElement, UserMessageHeaderProps>(
  ({ className, ...props }, ref) => (
    <BodyText
      as="div"
      ref={ref}
      className={cn(
        "w-full min-w-0 rounded-tight border border-solid border-border-primary bg-surface-primary p-md shadow-standard text-text wrap-break-word",
        className,
      )}
      {...props}
    />
  ),
);
UserMessageHeader.displayName = "UserMessageHeader";

export { UserMessageHeader };
