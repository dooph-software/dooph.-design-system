import { BaseIcon, IconProps } from "./BaseIcon";

export const SidebarLeftIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path
        d="M8.88636 6.70455L8.88636 19.7955M6.70455 25.25H19.7955C22.8079 25.25 25.25 22.8079 25.25 19.7955V6.70455C25.25 3.69208 22.8079 1.25 19.7955 1.25H6.70455C3.69208 1.25 1.25 3.69208 1.25 6.70455V19.7955C1.25 22.8079 3.69208 25.25 6.70455 25.25Z"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
};

export default SidebarLeftIcon;
