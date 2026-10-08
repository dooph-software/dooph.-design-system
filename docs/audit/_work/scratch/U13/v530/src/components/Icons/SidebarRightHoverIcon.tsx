import { BaseIcon, IconProps } from "./BaseIcon";

export const SidebarRightHoverIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="5" />
      <path d="M16 8C13.5 10.5 13.5 13.5 16 16" />
    </BaseIcon>
  );
};

export default SidebarRightHoverIcon;
