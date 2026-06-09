import { BaseIcon, type IconProps } from './BaseIcon';

export const SearchIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </BaseIcon>
);
