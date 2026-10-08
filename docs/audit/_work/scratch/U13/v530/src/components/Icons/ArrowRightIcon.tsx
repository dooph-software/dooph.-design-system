import { BaseIcon, IconProps } from "./BaseIcon";

export const ArrowRightIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </BaseIcon>
  );
};

export default ArrowRightIcon;
