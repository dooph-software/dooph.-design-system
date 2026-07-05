import { BaseIcon, IconProps } from "./BaseIcon";

export const StopFilledIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M216,56V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Z"></path>
    </BaseIcon>
  );
};

export default StopFilledIcon;
