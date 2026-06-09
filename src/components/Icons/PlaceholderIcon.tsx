import { BaseIcon, IconProps } from "./BaseIcon";

export const PlaceholderIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </BaseIcon>
  );
};

export default PlaceholderIcon;
