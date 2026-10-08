/*
 * BaseIcon — the one `<svg>` every icon, every shape and SidebarWithHoverIcon
 * render through.
 *
 * ## behavior
 * - Forwards `ref` and every `<svg>` attribute and handler. Icon leaves are
 *   plain functions that spread their props in; under React 19 `ref` is a prop,
 *   so it rides that spread to this forwardRef.
 * - Decorative by default (`aria-hidden="true"`). An icon given `aria-label` or
 *   `aria-labelledby` and no explicit `aria-hidden` is not hidden.
 * - A consumer `style` merges after the size/paint values; `className` is
 *   merged after `shrink-0`.
 *
 * ## constraints
 * - The rest spread sits AFTER the fixed attributes and BEFORE `ref`,
 *   `aria-hidden`, `className` and `style`. Moving it later lets a consumer
 *   `className`/`style` replace the merged ones; moving it earlier, or
 *   reordering the fixed attributes, changes the markup every existing icon
 *   renders (it is pinned byte-identical).
 * - `IconSize` (type) is the closed union of its four token values. The open
 *   arm (`string & {}`) lives on the `size` prop only; putting `| string` back
 *   into the type collapses the exported `IconSize` to `string`.
 */
import {
  forwardRef,
  type ReactNode,
  type Ref,
  type SVGProps,
} from "react";
import { cn } from "../../utils/cn";

/**
 * Dot-accessible icon size constants.
 * Values resolve via CSS tokens so consuming projects can override.
 *
 * Usage: <ChevronDownIcon size={IconSize.md} />
 */
export const IconSize = {
  sm: "var(--ui-icon-sm)", // 12px
  rg: "var(--ui-icon-rg)", // 14px
  md: "var(--ui-icon-md)", // 16px
  lg: "var(--ui-icon-lg)", // 18px
} as const;
export type IconSize = (typeof IconSize)[keyof typeof IconSize];

type IconOwnProps = {
  /** An `IconSize`, any CSS length, or a number of px. */
  size?: IconSize | (string & {}) | number;
  color?: string;
  strokeWidth?: number | string;
  strokeColor?: string;
  fillColor?: string;
  className?: string;
  children?: ReactNode;
  "aria-hidden"?: boolean | "true" | "false";
};

/** Own props, plus every `<svg>` attribute and handler, plus `ref`. `ref` is
 *  declared because icon leaves are plain functions that spread their props
 *  into BaseIcon; React 19 passes `ref` as a prop, so it rides that spread. */
export type IconProps = IconOwnProps &
  Omit<SVGProps<SVGSVGElement>, keyof IconOwnProps | "ref"> & {
    ref?: Ref<SVGSVGElement>;
  };

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
export const BaseIcon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      size = IconSize.rg,
      color,
      strokeWidth,
      strokeColor,
      className,
      fillColor,
      children,
      "aria-hidden": ariaHidden,
      style,
      ...props
    },
    ref,
  ) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      ref={ref}
      // Decorative by default; a labelled icon is meaningful, so it is not hidden.
      aria-hidden={
        ariaHidden ??
        (props["aria-label"] || props["aria-labelledby"] ? undefined : true)
      }
      className={cn("shrink-0", className)}
      style={{
        width: size,
        height: size,
        // `color` sets CSS color, so every `currentColor` paint in the icon —
        // the default stroke and any filled child — follows the prop.
        color,
        fill: fillColor,
        stroke: strokeColor ?? "currentColor",
        strokeWidth: strokeWidth ?? "var(--ui-icon-stroke-width)",
        ...style,
      }}
    >
      {children}
    </svg>
  ),
);
BaseIcon.displayName = "BaseIcon";
