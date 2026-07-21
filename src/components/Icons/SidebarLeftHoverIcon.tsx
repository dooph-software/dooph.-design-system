import { BaseIcon, IconProps } from "./BaseIcon";

export const SidebarLeftHoverIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path
        d="M6.70455 6.70455L8.59886 9.95194C9.7877 11.9899 9.78769 14.5101 8.59886 16.5481L6.70455 19.7955M6.70455 25.25H19.7955C22.8079 25.25 25.25 22.8079 25.25 19.7955V6.70455C25.25 3.69208 22.8079 1.25 19.7955 1.25H6.70455C3.69208 1.25 1.25 3.69208 1.25 6.70455V19.7955C1.25 22.8079 3.69208 25.25 6.70455 25.25Z"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
};

export default SidebarLeftHoverIcon;
