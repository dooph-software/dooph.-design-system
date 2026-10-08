import { BaseIcon, IconProps } from "./BaseIcon";

export const ArrowDownRightIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="m7 7 10 10" />
      <path d="M17 7v10H7" />
    </BaseIcon>
  );
};

export default ArrowDownRightIcon;
