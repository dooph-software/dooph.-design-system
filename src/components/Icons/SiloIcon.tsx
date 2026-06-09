import { BaseIcon, IconProps } from "./BaseIcon";

export const SiloIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M5 12V18C5 18 5 21 12 21C19 21 19 18 19 18V12" />
      <path d="M5 6V12C5 12 5 15 12 15C19 15 19 12 19 12V6" />
      <path d="M12 3C19 3 19 6 19 6C19 6 19 9 12 9C5 9 5 6 5 6C5 6 5 3 12 3Z" />
    </BaseIcon>
  );
};

export default SiloIcon;
