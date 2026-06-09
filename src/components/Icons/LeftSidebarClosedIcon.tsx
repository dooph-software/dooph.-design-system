import { BaseIcon, IconProps } from "./BaseIcon";

export const LeftSidebarClosedIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" />
    </BaseIcon>
  );
};

export default LeftSidebarClosedIcon;
