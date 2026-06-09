import { BaseIcon, IconProps } from "./BaseIcon";

export const AIContextIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </BaseIcon>
  );
};

export default AIContextIcon;
