import { BaseIcon, IconProps } from "./BaseIcon";

export const SaveAlternativeIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M12 15V3" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
    </BaseIcon>
  );
};

export default SaveAlternativeIcon;
