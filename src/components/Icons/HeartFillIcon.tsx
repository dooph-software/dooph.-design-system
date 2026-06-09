import { BaseIcon, type IconProps } from './BaseIcon';

export const HeartFillIcon = ({ color, ...props }: IconProps) => (
  <BaseIcon {...props} color={color}>
    <path
      d="M15 6.375c0 4.375-6.487 7.916-6.763 8.063a.5.5 0 0 1-.474 0C7.487 14.291 1 10.75 1 6.375A3.879 3.879 0 0 1 4.875 2.5c1.291 0 2.42.555 3.125 1.493C8.705 3.055 9.834 2.5 11.125 2.5A3.879 3.879 0 0 1 15 6.375Z"
      fill={color ?? 'currentColor'}
      stroke="none"
    />
  </BaseIcon>
);
