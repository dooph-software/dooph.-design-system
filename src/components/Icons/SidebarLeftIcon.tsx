import { BaseIcon, IconProps } from "./BaseIcon";

export const SidebarLeftIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="5" />
      <path d="M9 8v8" />
    </BaseIcon>
  );
};

export default SidebarLeftIcon;
