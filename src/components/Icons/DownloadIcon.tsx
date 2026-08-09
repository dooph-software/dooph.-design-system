import { BaseIcon, IconProps } from "./BaseIcon";

export const DownloadIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M12 17V3" />
      <path d="m6 11 6 6 6-6" />
      <path d="M19 21H5" />
    </BaseIcon>
  );
};

export default DownloadIcon;
