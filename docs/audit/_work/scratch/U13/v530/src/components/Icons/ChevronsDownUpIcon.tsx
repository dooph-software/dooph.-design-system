import { BaseIcon, IconProps } from "./BaseIcon";

export const ChevronsDownUpIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="m7 20 5-5 5 5" />
      <path d="m7 4 5 5 5-5" />
    </BaseIcon>
  );
};

export default ChevronsDownUpIcon;
