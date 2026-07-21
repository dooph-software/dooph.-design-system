import { BaseIcon, IconProps } from "./BaseIcon";

export const SidebarRightHoverIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path
        d="M19.7955 19.7955L17.7408 16.2732C16.6511 14.4051 16.6511 12.0949 17.7408 10.2268L19.7955 6.70455M19.7955 1.25L6.70455 1.25C3.69209 1.25 1.25 3.69208 1.25 6.70454L1.25 19.7955C1.25 22.8079 3.69208 25.25 6.70454 25.25L19.7955 25.25C22.8079 25.25 25.25 22.8079 25.25 19.7955L25.25 6.70455C25.25 3.69209 22.8079 1.25 19.7955 1.25Z"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
};

export default SidebarRightHoverIcon;
