/*
 * Sticker — a non-interactive chip: a tinted wash with icon-and-label content.
 *
 * ## behavior
 * - `variant` maps through `stickerVariants` onto the content colour and the
 *   wash. Both are already-resolved tokens (the wash is a color-mix at the
 *   sticker opacity), so the component does not apply alpha a second time.
 * - Children are the content. They are wrapped in a row with `gap-xs` so an
 *   icon and a text node sit beside each other without a wrapper at the call
 *   site. The wrapper is layout, not an interactive element.
 * - `custom` has no paints of its own. `color` (inline, so it beats class
 *   order) is the content colour, and the wash is that colour at
 *   `--ui-sticker-bg-opacity`.
 *
 * ## constraints
 * - Do not bake the wash alpha into a hex. `custom` has to retint an arbitrary
 *   colour, and a consumer overriding the opacity token has to move every
 *   built-in wash that references it.
 * - `custom` with no `color` throws. Silently falling back to prominent would
 *   make an explicit choice look like it had been honoured. The prop union is
 *   the real guard; the throw covers JavaScript and a runtime `variant`.
 */
import { cva } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { resolveDsColor, type DsColor } from "../../utils/color";
import { StickerVariant } from "./constants";

const stickerVariants = cva(
  [
    "inline-flex w-fit items-center overflow-clip",
    "rounded-tight px-sm py-sticker-y",
    "text-style-button whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        prominent: "bg-sticker-bg-prominent text-sticker-prominent",
        alternate: "bg-sticker-bg-alternate text-sticker-alternate",
        secondary: "bg-sticker-bg-secondary text-sticker-secondary",
        tertiary: "bg-sticker-bg-tertiary text-sticker-tertiary",
        danger: "bg-sticker-bg-danger text-sticker-danger",
        custom: "",
      },
    },
    defaultVariants: {
      variant: "prominent",
    },
  },
);

type StickerPaintProps =
  | {
      variant?: Exclude<StickerVariant, typeof StickerVariant.custom>;
      color?: never;
    }
  | {
      variant: typeof StickerVariant.custom;
      /** REQUIRED for `custom`, which has no palette of its own. A DS token
       * name or any CSS color. The wash is this colour at
       * `--ui-sticker-bg-opacity`. */
      color: DsColor;
    };

/* A type alias, not an interface: an interface cannot extend a union. The
 * intersection distributes, so `custom` still requires `color`. VariantProps
 * is deliberately NOT intersected — its `variant` includes `null` and would
 * collapse the discriminant. */
export type StickerProps = StickerPaintProps &
  Omit<HTMLAttributes<HTMLDivElement>, "color">;

/* The implementation takes the widened shape. Narrowing the union inside the
 * component would mean branching just to read props every arm shares. */
type StickerBaseProps = Omit<HTMLAttributes<HTMLDivElement>, "color"> & {
  variant?: StickerVariant;
  color?: DsColor;
};

const StickerBase = forwardRef<HTMLDivElement, StickerBaseProps>(
  (
    {
      className,
      style,
      variant = StickerVariant.prominent,
      color,
      children,
      ...props
    },
    ref,
  ) => {
    /* Unconditional, matching Slider's guard: `custom` with no colour cannot
     * render anything that is actually custom, and falling back to prominent
     * would honour a choice the caller did not make. */
    if (variant === StickerVariant.custom && !color) {
      throw new Error(
        '[Sticker] variant="custom" has no palette of its own and requires a ' +
          "`color` prop. Use one of the built-in variants for a preset palette.",
      );
    }

    const customColor =
      variant === StickerVariant.custom
        ? resolveDsColor(color, "var(--ui-color-prominent)")
        : undefined;

    return (
      <div
        ref={ref}
        className={cn(stickerVariants({ variant }), className)}
        style={
          customColor
            ? {
                ...style,
                color: customColor,
                backgroundColor: `color-mix(in srgb, ${customColor} var(--ui-sticker-bg-opacity), transparent)`,
              }
            : style
        }
        {...props}
      >
        <div className="flex flex-row items-center gap-xs">{children}</div>
      </div>
    );
  },
);
StickerBase.displayName = "Sticker";

const Sticker = forwardRef<HTMLDivElement, StickerProps>((props, ref) => (
  <StickerBase ref={ref} {...props} />
));
Sticker.displayName = "Sticker";

export { Sticker, stickerVariants };
