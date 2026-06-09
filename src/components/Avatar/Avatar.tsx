import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export const AvatarSize = {
  standard: "standard",
  small: "small",
} as const;
export type AvatarSize = (typeof AvatarSize)[keyof typeof AvatarSize];

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = AvatarSize.standard, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-avatar-bg text-logo *:size-full *:object-contain",
          size === AvatarSize.standard && "size-[38px] rounded-avatar p-xs",
          size === AvatarSize.small && "size-[22px] rounded-avatar-sm p-xxs",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar };
