import { BaseIcon, IconProps } from "./BaseIcon";

export const CloseCancelIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </BaseIcon>
  );
};

export default CloseCancelIcon;
