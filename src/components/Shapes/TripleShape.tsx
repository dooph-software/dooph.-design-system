import BaseShape, { ShapeProps } from "./BaseShape";

export const TripleShape = ({
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
      <path d="M19.8281 0C22.1321 8.9526e-05 23.9999 1.86785 24 4.17187C24 5.96748 22.8654 7.49778 21.2742 8.08596C22.8654 8.67408 23.9999 10.2044 24 12C24 13.7956 22.8654 15.3259 21.2742 15.914C22.8654 16.5022 23.9999 18.0325 24 19.8281C24 22.1322 22.1322 23.9999 19.8281 24H4.17187C1.8678 23.9999 0 22.1322 0 19.8281C5.53027e-05 18.0327 1.13425 16.5023 2.72519 15.914C1.13426 15.3257 0 13.7954 0 12C5.53027e-05 10.2046 1.13425 8.6742 2.72519 8.08596C1.13426 7.4976 0 5.96729 0 4.17187C6.43728e-05 1.86784 1.86784 7.53276e-05 4.17187 0H19.8281Z" />
    </BaseShape>
  );
};
