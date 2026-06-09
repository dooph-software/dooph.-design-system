import { BaseIcon, IconProps } from "./BaseIcon";

export const ReviewQueueIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M13 5h8" />
      <path d="M13 12h8" />
      <path d="M13 19h8" />
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
    </BaseIcon>
  );
};

export default ReviewQueueIcon;
