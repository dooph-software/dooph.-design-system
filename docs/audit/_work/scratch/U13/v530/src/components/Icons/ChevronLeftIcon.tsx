import { BaseIcon, IconProps } from "./BaseIcon";

export const ChevronLeftIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="m15 18-6-6 6-6" />
    </BaseIcon>
  );
};

export default ChevronLeftIcon;
