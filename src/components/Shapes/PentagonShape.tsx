import { BaseShape, ShapeProps } from "./BaseShape";

export const PentagonShape = ({
  size,
  strokeColor,
  fillColor = "currentColor",
  strokeWeight,
}: ShapeProps) => {
  return (
    <BaseShape
      size={size}
      strokeColor={strokeColor}
      fillColor={fillColor}
      strokeWeight={strokeWeight}
    >
      <path
        d="M9.3101 0.863758C10.914 -0.28792 13.086 -0.287919 14.6899 0.863759L22.1133 6.19394C23.7172 7.34562 24.3884 9.38702 23.7757 11.2505L20.9402 19.8749C20.3276 21.7383 18.5705 23 16.5879 23H7.41211C5.42953 23 3.67242 21.7383 3.05976 19.8749L0.224294 11.2505C-0.388359 9.38702 0.282797 7.34562 1.88674 6.19394L9.3101 0.863758Z"
        fill="currentColor"
      />
    </BaseShape>
  );
};
