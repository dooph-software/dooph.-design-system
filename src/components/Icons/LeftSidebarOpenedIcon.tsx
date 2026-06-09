import { BaseIcon, IconProps } from "./BaseIcon";

export const LeftSidebarOpenedIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path
        d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4V3z"
        fill="currentColor"
        stroke="none"
      />
    </BaseIcon>
  );
};

export default LeftSidebarOpenedIcon;
