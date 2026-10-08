import { BaseIcon, IconProps } from "./BaseIcon";

export const ArrowUpRightIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </BaseIcon>
  );
};

export default ArrowUpRightIcon;
