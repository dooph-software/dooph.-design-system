import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { AvatarSize } from "./constants";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = AvatarSize.standard, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          "bg-surface-secondary border border-solid border-border-secondary",
          "text-prominent-color *:size-full *:object-contain",
          size === AvatarSize.standard && "size-avatar rounded-avatar p-sm",
          size === AvatarSize.sm && "size-avatar-sm rounded-avatar-sm p-xxs",
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
