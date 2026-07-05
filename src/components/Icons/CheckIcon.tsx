import { BaseIcon, IconProps } from "./BaseIcon";

export const CheckIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path
        d="M2.5 7L5.5 10L11.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
};

export default CheckIcon;
