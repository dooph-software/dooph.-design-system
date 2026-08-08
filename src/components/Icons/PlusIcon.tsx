import { BaseIcon, IconProps } from "./BaseIcon";

export const PlusIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </BaseIcon>
  );
};

export default PlusIcon;
