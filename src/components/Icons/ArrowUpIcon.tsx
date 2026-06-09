import { BaseIcon, IconProps } from "./BaseIcon";

export const ArrowUpIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </BaseIcon>
  );
};

export default ArrowUpIcon;
