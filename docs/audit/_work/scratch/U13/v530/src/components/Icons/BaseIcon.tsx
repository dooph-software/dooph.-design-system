import { cn } from "../../utils/cn";

/**
 * Dot-accessible icon size constants.
 * Values resolve via CSS tokens so consuming projects can override.
 *
 * Usage: <ChevronDownIcon size={IconSizes.medium} />
 */
export const IconSizes = {
  tiny: "var(--ui-icon-tiny)", // 12px
  standard: "var(--ui-icon-standard)", // 14px
  medium: "var(--ui-icon-medium)", // 16px
} as const;
export type IconSizes = (typeof IconSizes)[keyof typeof IconSizes] | string;

export interface IconProps {
  size?: IconSizes | number;
  color?: string;
  strokeWidth?: number | string;
  strokeColor?: string;
  fillColor?: string;
  className?: string;
  children?: React.ReactNode;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * BaseIcon — render any SVG icon by passing path(s) as children.
 *
 * All icons in this package are BaseIcon instances. Consuming projects
 * can build their own icons with the same system:
 *
 *   export const MyIcon = (props: IconProps) => (
 *     <BaseIcon {...props}><path d="..." /></BaseIcon>
 *   );
 */
export const BaseIcon = ({
  size = IconSizes.standard,
  color,
  strokeWidth,
  strokeColor,
  className,
  fillColor,
  children,
  "aria-hidden": ariaHidden = true,
}: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={ariaHidden}
    className={cn("shrink-0", className)}
    style={{
      width: size,
      height: size,
      fill: fillColor ?? undefined,
      stroke: strokeColor ?? color ?? "currentColor",
      strokeWidth: strokeWidth ?? "var(--ui-icon-stroke)",
    }}
  >
    {children}
  </svg>
);
