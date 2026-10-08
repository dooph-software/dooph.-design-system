import { BaseIcon, IconProps } from "./BaseIcon";

export const SidebarLeftHoverIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="5" />
      <path d="M8 8C10.5 10.5 10.5 13.5 8 16" />
    </BaseIcon>
  );
};

export default SidebarLeftHoverIcon;
