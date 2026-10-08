import { BaseIcon, IconProps } from "./BaseIcon";

export const ChevronsRightIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="m6 17 5-5-5-5" />
      <path d="m13 17 5-5-5-5" />
    </BaseIcon>
  );
};

export default ChevronsRightIcon;
