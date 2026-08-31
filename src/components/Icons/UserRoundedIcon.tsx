import { BaseIcon, type IconProps } from "./BaseIcon";

export const UserRoundedIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </BaseIcon>
);
