import { BaseIcon, IconProps } from "./BaseIcon";

export const StopIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,160H56V56H200V200Z"></path>
    </BaseIcon>
  );
};

export default StopIcon;
