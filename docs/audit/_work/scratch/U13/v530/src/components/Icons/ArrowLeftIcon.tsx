import { BaseIcon, IconProps } from "./BaseIcon";

export const ArrowLeftIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </BaseIcon>
  );
};

export default ArrowLeftIcon;
