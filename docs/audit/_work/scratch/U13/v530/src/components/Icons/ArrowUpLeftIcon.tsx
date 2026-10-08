import { BaseIcon, IconProps } from "./BaseIcon";

export const ArrowUpLeftIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M7 17V7h10" />
      <path d="M17 17 7 7" />
    </BaseIcon>
  );
};

export default ArrowUpLeftIcon;
