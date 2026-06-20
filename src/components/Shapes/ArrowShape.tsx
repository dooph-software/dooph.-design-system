import BaseShape, { ShapeClipPath, ShapeProps } from "./BaseShape";
export const ArrowShape = ({
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
      <g clip-path="url(#clip0_504_971)">
        <path
          d="M17.0922 5.94811C16.4447 4.90881 15.7856 3.85509 14.9102 3.02982C14.0347 2.2025 12.9006 1.61802 11.7377 1.69417C10.7166 1.76208 9.77024 2.33421 9.0231 3.08128C8.27596 3.82834 7.69551 4.74828 7.12462 5.65998C5.58054 8.12139 4.03455 10.5828 2.49047 13.0462C1.75674 14.2152 1.00386 15.4356 0.800792 16.8289C0.555578 18.5124 1.21651 20.2267 2.38893 21.3463C3.615 22.5173 5.60162 22.4226 7.09397 22.1016C8.72997 21.7496 10.3296 21.087 11.9982 21.089C13.4274 21.089 14.8086 21.5789 16.1995 21.9349C17.5884 22.2889 19.0807 22.507 20.4217 21.9801C22.0865 21.3277 23.2819 19.4735 23.2494 17.5698C23.2187 15.8328 21.3873 12.8363 21.3873 12.8363C21.3873 12.8363 18.5236 8.24437 17.0922 5.94811Z"
          fill={fillColor}
        />
      </g>
      <defs>
        <ShapeClipPath id="clip0_504_971" fillColor={fillColor} />
      </defs>
    </BaseShape>
  );
};
