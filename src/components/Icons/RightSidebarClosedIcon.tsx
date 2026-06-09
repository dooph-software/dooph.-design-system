import { BaseIcon, IconProps } from "./BaseIcon";

export const RightSidebarClosedIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M15 3v18" />
    </BaseIcon>
  );
};

export default RightSidebarClosedIcon;
