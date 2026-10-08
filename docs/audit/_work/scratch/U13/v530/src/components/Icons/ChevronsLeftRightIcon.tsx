import { BaseIcon, IconProps } from "./BaseIcon";

export const ChevronsLeftRightIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="m9 7-5 5 5 5" />
      <path d="m15 7 5 5-5 5" />
    </BaseIcon>
  );
};

export default ChevronsLeftRightIcon;
