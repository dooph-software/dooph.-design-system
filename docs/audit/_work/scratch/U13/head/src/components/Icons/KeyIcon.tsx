import { BaseIcon, IconProps } from "./BaseIcon";

export const KeyIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
      <circle cx="7.5" cy="15.5" r="5.5" />
    </BaseIcon>
  );
};

export default KeyIcon;
