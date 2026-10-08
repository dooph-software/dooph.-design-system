import { BaseIcon, type IconProps } from "./BaseIcon";

export const StopIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </BaseIcon>
);

export default StopIcon;
