import BaseShape, { ShapeProps } from "./BaseShape";

export const PixircleShape = ({
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
      <path d="M16.8889 0H7.11111V1.55552H3.77778V3.55555H1.77778V7.11111H0V16.8889H1.77778V20.4445H3.77778V22.4444H7.11111V24H16.8889V22.4444H20.2222V20.4445H22.2222V16.8889H24V7.11111H22.2222V3.55555H20.2222V1.55552H16.8889V0Z" />
    </BaseShape>
  );
};
