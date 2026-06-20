import { BaseIcon, IconProps } from "./BaseIcon";

export const FilterLinesIcon = (props: IconProps) => {
  return (
    <BaseIcon {...props}>
      <path d="M2 5h20" />
      <path d="M6 12h12" />
      <path d="M9 19h6" />
    </BaseIcon>
  );
};

export default FilterLinesIcon;
