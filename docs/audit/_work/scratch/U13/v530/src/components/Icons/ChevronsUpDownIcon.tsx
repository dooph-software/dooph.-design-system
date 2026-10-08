import { BaseIcon, IconProps } from "./BaseIcon";

export const ChevronsUpDownIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </BaseIcon>
  );
};

export default ChevronsUpDownIcon;
