import { BaseIcon, IconProps } from "./BaseIcon";

export const ChevronsRightLeftIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="m20 17-5-5 5-5" />
      <path d="m4 17 5-5-5-5" />
    </BaseIcon>
  );
};

export default ChevronsRightLeftIcon;
