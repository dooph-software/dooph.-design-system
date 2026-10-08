/*
 * CTAButton — padded-outline marketing CTA with a fixed shape end mark.
 *
 * ## behavior
 * - The end mark is a FIXED shape per size: the eight-leaf clover at
 *   `standard`, the puff at `big`. It never morphs. Hover rolls the label
 *   (RollHoverText on the root `.group`) and, on hover and focus-visible,
 *   tilts the shape by DropdownCaret's hover-nudge amount (13.5deg), on the
 *   motion scale (`base`, `enter`) — CSS only, through `.ds-cta-shape-tilt`.
 * - The shape is painted with the OPPOSITE button's background: a primary CTA
 *   draws it in the secondary-button bg, a secondary CTA in the primary-button
 *   bg. The icon on it takes that button's content colour.
 * - Both sizes hug their content: 16px pill padding, a 60px label → mark gap,
 *   the label in `CTAText` (`.text-style-cta`: button role, semibold,
 *   24 / 28px).
 *
 * ## constraints
 * - The shape is chosen by `size`, never by a prop, and it never morphs. That
 *   is the maintainer's decision (2026-10-03); a shape prop or a hover morph
 *   is a design change, not a refactor. Its only motion is the hover tilt,
 *   approved by the maintainer (2026-10-07): one named helper,
 *   `.ds-cta-shape-tilt`, reusing the nudge token — no listeners, no state.
 * - The shapes are the `Shapes/` primitives, never re-drawn copies. Figma's
 *   flattened end-mark SVGs are not the source of truth.
 */
import { Slot } from "@radix-ui/react-slot";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import { cn } from "../../utils/cn";
import { RollHoverText } from "../AnimatedText";
import { EightLeafCloverShape, PuffShape } from "../Shapes";
import { CTAText } from "../Text";
import { CTAButtonSize, CTAButtonVariant } from "./constants";

const SIZES = {
  standard: {
    content: "ds-gap-cta-content-standard ds-min-w-cta-content-standard pl-md",
    mark: "ds-size-cta-chip-standard",
    Shape: EightLeafCloverShape,
    shapeSize: "var(--ui-size-cta-shape-standard)",
    icon: "ds-size-cta-icon-standard",
    /* `.text-style-cta` is already sized for standard. */
    fontSize: undefined,
  },
  big: {
    content: "ds-gap-cta-content-big ds-min-w-cta-content-big pl-lg",
    mark: "ds-size-cta-chip-big",
    Shape: PuffShape,
    shapeSize: "var(--ui-size-cta-shape-big)",
    icon: "ds-size-cta-icon-big",
    fontSize: "var(--ui-text-cta-big)",
  },
} as const;

/** Per variant: pill fill, label colour, shape paint, icon colour. */
const PAINTS = {
  primary: {
    pill: "bg-primary",
    label: "text-primary-fg",
    shape: "text-secondary",
    icon: "text-secondary-fg",
  },
  secondary: {
    pill: "bg-secondary",
    label: "text-secondary-fg",
    shape: "text-primary",
    icon: "text-primary-fg",
  },
} as const satisfies Record<CTAButtonVariant, Record<string, string>>;

export interface CTAButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  /** Label shown in the CTA text style + RollHoverText. */
  text: string;
  /** Icon centred on the end-mark shape. */
  icon: ReactNode;
  /** Also picks the end-mark shape: eight-leaf clover (standard) or puff (big). */
  size?: CTAButtonSize;
  variant?: CTAButtonVariant;
  /**
   * Merge props onto the single child instead of rendering an `<a>`.
   * Use with Next.js `Link` (leave the Link empty — CTAButton supplies content):
   * `<CTAButton asChild text="…" icon={…}><Link href="/pricing" /></CTAButton>`
   */
  asChild?: boolean;
  /**
   * Read only with `asChild`: the single element CTAButton slots onto (its own
   * children are replaced by the CTA content). Without `asChild` there is no
   * place to render children — pass the label as `text`.
   */
  children?: ReactNode;
}

/* Public call signatures: `children` type-checks only together with
 * `asChild`, so a label passed as children in anchor mode (which renders
 * nothing) is a compile error rather than silently dropped. Overloads rather
 * than a union keep `CTAButtonProps` extendable by consumer interfaces. */
type CTAButtonComponent = {
  (
    props: Omit<CTAButtonProps, "asChild" | "children"> & {
      asChild: true;
      children: ReactElement;
    } & RefAttributes<HTMLElement>,
  ): ReactElement | null;
  /* A runtime boolean (`asChild={isLink}`) needs an element child to slot onto. */
  (
    props: Omit<CTAButtonProps, "asChild" | "children"> & {
      asChild: boolean;
      children: ReactElement;
    } & RefAttributes<HTMLElement>,
  ): ReactElement | null;
  /* Anchor mode — listed LAST because ComponentProps (and so Storybook's
   * Meta<typeof CTAButton>) reads the last call signature. */
  (
    props: Omit<CTAButtonProps, "asChild" | "children"> & {
      asChild?: false;
      children?: never;
    } & RefAttributes<HTMLElement>,
  ): ReactElement | null;
  displayName?: string;
};

/**
 * Padded-outline marketing CTA. The outline ring is primary-only; hover rolls
 * the label (RollHoverText) and tilts the end shape (`.ds-cta-shape-tilt`), both
 * keyed to the root `.group`. Radii stay fully round.
 */
const CTAButtonBase = forwardRef<HTMLElement, CTAButtonProps>(
  (
    {
      text,
      icon,
      size = CTAButtonSize.standard,
      variant = CTAButtonVariant.primary,
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const s = SIZES[size];
    const paint = PAINTS[variant];
    const isPrimary = variant === CTAButtonVariant.primary;
    const Shape = s.Shape;

    const content = (
      <span
        className={cn(
          "flex items-center p-lg",
          "rounded-full",
          "ds-drop-shadow-cta",
          paint.pill,
        )}
      >
        <span className={cn("flex items-center", s.content)}>
          <CTAText
            fontSize={s.fontSize}
            className={cn("min-w-px flex-1", paint.label)}
          >
            <RollHoverText>{text}</RollHoverText>
          </CTAText>

          <span
            className={cn(
              "relative flex shrink-0 items-center justify-center",
              s.mark,
            )}
          >
            <span
              aria-hidden
              className={cn(
                "ds-cta-shape-tilt absolute inset-0 flex items-center justify-center",
                paint.shape,
              )}
            >
              <Shape
                size={s.shapeSize}
                strokeColor="transparent"
                strokeWeight={0}
                fillColor="currentColor"
              />
            </span>
            <span
              className={cn(
                "relative shrink-0 overflow-clip",
                s.icon,
                paint.icon,
              )}
            >
              {icon}
            </span>
          </span>
        </span>
      </span>
    );

    const rootClassName = cn(
      "group inline-flex items-center justify-center p-sm",
      "rounded-full",
      "ds-focus-visible-ring",
      isPrimary && "border-2 border-solid border-border-cta",
      className,
    );

    if (asChild) {
      if (!isValidElement(children)) {
        throw new Error(
          "CTAButton: asChild requires a single valid React element child.",
        );
      }
      return (
        <Slot ref={ref} className={rootClassName} {...props}>
          {cloneElement(children as ReactElement, undefined, content)}
        </Slot>
      );
    }

    return (
      /* this branch always renders an <a>; the HTMLElement ref type is for asChild */
      <a
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        className={rootClassName}
        {...props}
      >
        {content}
      </a>
    );
  },
);
CTAButtonBase.displayName = "CTAButton";

const CTAButton = CTAButtonBase as CTAButtonComponent;

export { CTAButton };
