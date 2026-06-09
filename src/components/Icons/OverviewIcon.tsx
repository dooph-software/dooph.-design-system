import { BaseIcon, IconProps } from "./BaseIcon";

export const OverviewIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M6 5h12" />
      <path d="M4 12h10" />
      <path d="M12 19h8" />
    </BaseIcon>
  );
};

export default OverviewIcon;
