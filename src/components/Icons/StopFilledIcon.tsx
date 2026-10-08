import { BaseIcon, type IconProps } from "./BaseIcon";

export const StopFilledIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    {/* Filled with currentColor, which BaseIcon sets from `color`. Stroke is
        kept so the filled and outlined variants share the same outer bounds. */}
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      fill="currentColor"
    />
  </BaseIcon>
);
