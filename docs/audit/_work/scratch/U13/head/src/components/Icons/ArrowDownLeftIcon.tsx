import { BaseIcon, IconProps } from "./BaseIcon";

export const ArrowDownLeftIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M17 7 7 17" />
      <path d="M17 17H7V7" />
    </BaseIcon>
  );
};

export default ArrowDownLeftIcon;
