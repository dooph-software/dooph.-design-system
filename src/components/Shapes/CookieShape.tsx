import BaseShape, { ShapeClipPath, ShapeProps } from "./BaseShape";

export const CookieShape = ({
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
      <g clip-path="url(#clip0_504_972)">
        <g clip-path="url(#clip1_504_972)">
          <path
            d="M15.1122 1.24877C19.945 -0.850213 24.8502 4.05494 22.7512 8.88783L22.4042 9.68689C21.7634 11.1624 21.7634 12.8376 22.4042 14.3131L22.7512 15.1122C24.8502 19.945 19.945 24.8502 15.1122 22.7512L14.3131 22.4042C12.8376 21.7634 11.1624 21.7634 9.68689 22.4042L8.88783 22.7512C4.05494 24.8502 -0.850213 19.945 1.24877 15.1122L1.59581 14.3131C2.23665 12.8376 2.23665 11.1624 1.59581 9.68689L1.24877 8.88783C-0.850213 4.05494 4.05494 -0.850213 8.88783 1.24877L9.68689 1.59581C11.1624 2.23665 12.8376 2.23665 14.3131 1.59581L15.1122 1.24877Z"
            fill={fillColor}
          />
        </g>
      </g>
      <defs>
        <ShapeClipPath id="clip0_504_972" fillColor={fillColor} />
        <ShapeClipPath id="clip1_504_972" fillColor={fillColor} />
      </defs>
    </BaseShape>
  );
};
