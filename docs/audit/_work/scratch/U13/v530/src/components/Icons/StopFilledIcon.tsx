import { BaseIcon, type IconProps } from "./BaseIcon";

export const StopFilledIcon = ({ color, ...props }: IconProps) => (
  <BaseIcon {...props} color={color}>
    {/* BaseIcon maps `color` to stroke only, so the fill is wired up here to
        keep both in sync. Stroke is kept so the filled and outlined variants
        share the same outer bounds. */}
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      fill={color ?? "currentColor"}
    />
  </BaseIcon>
);

export default StopFilledIcon;
