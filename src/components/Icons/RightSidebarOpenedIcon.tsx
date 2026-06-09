import { BaseIcon, IconProps } from "./BaseIcon";

export const RightSidebarOpenedIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M15 3v18" />
      <path
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-4V3z"
        fill="currentColor"
        stroke="none"
      />
    </BaseIcon>
  );
};

export default RightSidebarOpenedIcon;
