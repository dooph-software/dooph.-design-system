import { BaseIcon, IconProps } from "./BaseIcon";

export const ThreeDotsIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </BaseIcon>
  );
};

export default ThreeDotsIcon;
