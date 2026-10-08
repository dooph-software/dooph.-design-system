import { BaseIcon, IconProps } from "./BaseIcon";

export const ArrowDownIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </BaseIcon>
  );
};

export default ArrowDownIcon;
