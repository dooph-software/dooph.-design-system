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
      <path d="M9.3101 1.8262C10.914 0.724598 13.086 0.724599 14.6899 1.8262L22.1133 6.92464C23.7172 8.02625 24.3884 9.97889 23.7757 11.7613L20.9402 20.0108C20.3276 21.7932 18.5705 23 16.5879 23H7.41211C5.42953 23 3.67242 21.7932 3.05976 20.0108L0.224294 11.7613C-0.388359 9.97889 0.282797 8.02624 1.88674 6.92464L9.3101 1.8262Z" />
    </BaseShape>
  );
};
