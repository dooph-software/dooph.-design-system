import { BaseIcon, IconProps } from "./BaseIcon";

export const SendIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M6 18h6a3 3 0 0 0 3 -3v-10l-4 4m8 0l-4 -4" />
    </BaseIcon>
  );
};

export default SendIcon;
