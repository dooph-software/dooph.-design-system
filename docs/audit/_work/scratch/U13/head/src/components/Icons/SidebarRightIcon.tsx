import { BaseIcon, IconProps } from "./BaseIcon";

export const SidebarRightIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="5" />
      <path d="M15 8v8" />
    </BaseIcon>
  );
};

export default SidebarRightIcon;
