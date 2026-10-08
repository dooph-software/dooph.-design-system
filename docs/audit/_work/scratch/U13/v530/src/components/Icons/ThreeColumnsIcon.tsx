import { BaseIcon, type IconProps } from "./BaseIcon";

export const ThreeColumnsIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
    <path d="M15 3v18" />
  </BaseIcon>
);
