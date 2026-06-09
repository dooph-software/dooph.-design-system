import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
} from "react";
import { cn } from "../../utils/cn";

/**
 * Dot-accessible text variant constants.
 * Maps directly to the `text-style-*` Tailwind utilities defined in index.css.
 *
 * Usage: <BaseText variant={TextVariant.button}>Label</BaseText>
 */
export const TextVariant = {
  button: "button",
  heading: "heading",
  hero: "hero",
  title: "title",
  body: "body",
  label: "label",
} as const;
export type TextVariant = (typeof TextVariant)[keyof typeof TextVariant];

const textVariantClassName: Record<TextVariant, string> = {
  [TextVariant.button]: "text-style-button",
  [TextVariant.heading]: "text-style-heading",
  [TextVariant.hero]: "text-style-hero",
  [TextVariant.title]: "text-style-title",
  [TextVariant.body]: "text-style-body",
  [TextVariant.label]: "text-style-label",
};

/** Dot-accessible font family override. Maps to the --ui-font-* token family stacks. */
export const TextFontFamily = {
  sans: "sans",
  label: "label",
  heading: "heading",
} as const;
export type TextFontFamily = (typeof TextFontFamily)[keyof typeof TextFontFamily];

const textFontFamilyClass: Record<TextFontFamily, string> = {
  sans: "font-sans",
  label: "font-label",
  heading: "font-heading",
};

/** Dot-accessible font size override. Maps to the --ui-text-* token sizes. */
export const TextFontSize = {
  label: "label",
  body: "body",
  heading: "heading",
  title: "title",
  hero: "hero",
} as const;
export type TextFontSize = (typeof TextFontSize)[keyof typeof TextFontSize];

const textFontSizeClass: Record<TextFontSize, string> = {
  label: "text-label",
  body: "text-body",
  heading: "text-heading",
  title: "text-title",
  hero: "text-hero",
};

/** Dot-accessible font weight override. Aligned to the --ui-weight-* token values. */
export const TextFontWeight = {
  normal: "normal",
  medium: "medium",
  semibold: "semibold",
  bold: "bold",
} as const;
export type TextFontWeight = (typeof TextFontWeight)[keyof typeof TextFontWeight];

const textFontWeightClass: Record<TextFontWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

type BaseTextOwnProps = {
  variant?: TextVariant;
  as?: ElementType;
  fontFamily?: TextFontFamily;
  fontSize?: TextFontSize;
  fontWeight?: TextFontWeight;
};

export type BaseTextProps<TElement extends ElementType = "span"> =
  BaseTextOwnProps &
    Omit<ComponentPropsWithoutRef<TElement>, keyof BaseTextOwnProps>;

type BaseTextComponent = <TElement extends ElementType = "span">(
  props: BaseTextProps<TElement> & {
    ref?: ComponentPropsWithRef<TElement>["ref"];
  },
) => ReactElement | null;

/**
 * BaseText — renders any inline or block element with a design-system text style.
 *
 * All pre-composed text components (ButtonText, HeadingText, HeroText,
 * TitleText, BodyText, LabelText) are
 * BaseText instances with a fixed variant. Consuming projects can do the same:
 *
 *   export const CaptionText = (props: BaseTextProps) => (
 *     <BaseText as="span" variant="label" {...props} />
 *   );
 */
const BaseTextBase = forwardRef<HTMLElement, BaseTextProps<ElementType>>(
  (
    {
      variant = TextVariant.body,
      as: Tag = "span",
      className,
      fontFamily,
      fontSize,
      fontWeight,
      ...props
    },
    ref,
  ) => (
    <Tag
      ref={ref as ForwardedRef<HTMLElement>}
      className={cn(
        textVariantClassName[variant as TextVariant],
        fontFamily && textFontFamilyClass[fontFamily as TextFontFamily],
        fontSize && textFontSizeClass[fontSize as TextFontSize],
        fontWeight && textFontWeightClass[fontWeight as TextFontWeight],
        className,
      )}
      {...props}
    />
  ),
);
BaseTextBase.displayName = "BaseText";

export const BaseText = BaseTextBase as BaseTextComponent;

/* ── Pre-composed variants ──────────────────────────────────────────── */

export type ButtonTextProps = Omit<BaseTextProps, "variant">;
export const ButtonText = forwardRef<HTMLElement, ButtonTextProps>(
  (props, ref) => (
    <BaseText ref={ref} variant={TextVariant.button} {...props} />
  ),
);
ButtonText.displayName = "ButtonText";

export type HeadingTextProps = Omit<BaseTextProps, "variant">;
export const HeadingText = forwardRef<HTMLElement, HeadingTextProps>(
  (props, ref) => (
    <BaseText ref={ref} variant={TextVariant.heading} {...props} />
  ),
);
HeadingText.displayName = "HeadingText";

export type HeroTextProps = Omit<BaseTextProps, "variant">;
export const HeroText = forwardRef<HTMLElement, HeroTextProps>((props, ref) => (
  <BaseText ref={ref} variant={TextVariant.hero} {...props} />
));
HeroText.displayName = "HeroText";

export type TitleTextProps = Omit<BaseTextProps, "variant">;
export const TitleText = forwardRef<HTMLElement, TitleTextProps>(
  (props, ref) => <BaseText ref={ref} variant={TextVariant.title} {...props} />,
);
TitleText.displayName = "TitleText";

export type BodyTextProps = Omit<BaseTextProps, "variant">;
export const BodyText = forwardRef<HTMLElement, BodyTextProps>((props, ref) => (
  <BaseText ref={ref} variant={TextVariant.body} {...props} />
));
BodyText.displayName = "BodyText";

export type LabelTextProps = Omit<BaseTextProps, "variant">;
export const LabelText = forwardRef<HTMLElement, LabelTextProps>(
  (props, ref) => <BaseText ref={ref} variant={TextVariant.label} {...props} />,
);
LabelText.displayName = "LabelText";
