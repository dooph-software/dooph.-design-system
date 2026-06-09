import { BaseIcon, IconProps } from "./BaseIcon";

export const DropdownIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M6 15l6 -6l6 6" />
    </BaseIcon>
  );
};

export default DropdownIcon;
