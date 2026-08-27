import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
} from 'react';
import { cn } from '../../utils/cn';
import { TEXT_VARIANT_CLASS, TextVariant } from './constants';
import { buildTextStyle, type TextStyleProps } from './textStyle';

type BaseTextOwnProps = TextStyleProps & {
  /** Role providing the defaults. Ignored when `unstyled`. */
  variant?: TextVariant;
  /** Drop the role class entirely and style from props/className alone. */
  unstyled?: boolean;
};

/* `as` is typed as the generic itself, not ElementType — that is what lets TS
 * infer the element from the value and admit its props (as="label" + htmlFor). */
export type BaseTextProps<TElement extends ElementType = 'span'> =
  BaseTextOwnProps & { as?: TElement } & Omit<
      ComponentPropsWithoutRef<TElement>,
      keyof BaseTextOwnProps | 'as'
    >;

type PolymorphicTextComponent<TOwnProps> = <
  TElement extends ElementType = 'span',
>(
  props: TOwnProps & { as?: TElement } & Omit<
      ComponentPropsWithoutRef<TElement>,
      keyof TOwnProps | 'as'
    > & {
      ref?: ComponentPropsWithRef<TElement>['ref'];
    },
) => ReactElement | null;

/**
 * BaseText — every visible string in the system renders through this.
 *
 * Three tiers decide the final typography, in this order:
 *
 *   1. props        — written as inline style, so they beat everything
 *   2. className    — the consumer's own utilities (leading-*, text-2xl, …)
 *   3. role class   — `.text-style-*`, in the `components` layer so utilities win
 *
 * That ordering is the whole point of the design: a prop is explicit and must
 * never lose to cascade order, while a role default is ambient and must stay
 * overridable. `style` still outranks props, as the last-resort escape hatch.
 *
 * Values come from the dot-accessible constants (`Fonts`, `FontSizes`,
 * `FontWeights`, `Tracking`), which resolve to `var(--ui-*)` so a consuming
 * project's token overrides apply, or from raw CSS values / numbers:
 *
 *   <BaseText font={Fonts.body} fontWeight={FontWeights.regular} />
 *   <BodyText fontSize={16} fontWeight={450} lineHeight={1.6} />
 *   <BodyText axes={{ [FontAxes.grade]: 40 }} />
 */
const BaseTextBase = forwardRef<HTMLElement, BaseTextProps<ElementType>>(
  (
    {
      variant = TextVariant.body,
      as: Tag = 'span',
      unstyled = false,
      className,
      style,
      font,
      fontSize,
      fontWeight,
      lineHeight,
      letterSpacing,
      axes,
      ...props
    },
    ref,
  ) => {
    const role = unstyled ? undefined : (variant as TextVariant);
    const typography = buildTextStyle(
      { font, fontSize, fontWeight, lineHeight, letterSpacing, axes },
      role,
    );

    return (
      <Tag
        ref={ref as ForwardedRef<HTMLElement>}
        className={cn(role && TEXT_VARIANT_CLASS[role], className)}
        /* Spread `style` last: an explicit style prop is the final override,
         * and merging (rather than replacing) means passing one does not wipe
         * the typography the props asked for. */
        style={
          typography || style
            ? ({ ...typography, ...style } as CSSProperties)
            : undefined
        }
        {...props}
      />
    );
  },
);
BaseTextBase.displayName = 'BaseText';

export const BaseText = BaseTextBase as PolymorphicTextComponent<BaseTextOwnProps>;

/* ── Pre-composed roles ─────────────────────────────────────────────────
 * Each is BaseText with `variant` fixed. Built through a factory so the six
 * stay identical by construction; the cast restores the polymorphic `as`
 * typing that a plain forwardRef wrapper erases. */

export type RoleTextProps<TElement extends ElementType = 'span'> = Omit<
  BaseTextProps<TElement>,
  'variant'
>;

type RoleTextComponent = PolymorphicTextComponent<Omit<BaseTextOwnProps, 'variant'>>;

const createRoleText = (
  variant: TextVariant,
  displayName: string,
): RoleTextComponent => {
  const Role = forwardRef<HTMLElement, RoleTextProps<ElementType>>(
    (props, ref) => <BaseText ref={ref} variant={variant} {...props} />,
  );
  Role.displayName = displayName;
  return Role as RoleTextComponent;
};

export const ButtonText = createRoleText(TextVariant.button, 'ButtonText');
export const HeadingText = createRoleText(TextVariant.heading, 'HeadingText');
export const SubheadingText = createRoleText(TextVariant.subheading, 'SubheadingText');
export const HeroText = createRoleText(TextVariant.hero, 'HeroText');
export const TitleText = createRoleText(TextVariant.title, 'TitleText');
export const BodyText = createRoleText(TextVariant.body, 'BodyText');
export const LabelText = createRoleText(TextVariant.label, 'LabelText');

export type ButtonTextProps<T extends ElementType = 'span'> = RoleTextProps<T>;
export type HeadingTextProps<T extends ElementType = 'span'> = RoleTextProps<T>;
export type SubheadingTextProps<T extends ElementType = 'span'> = RoleTextProps<T>;
export type HeroTextProps<T extends ElementType = 'span'> = RoleTextProps<T>;
export type TitleTextProps<T extends ElementType = 'span'> = RoleTextProps<T>;
export type BodyTextProps<T extends ElementType = 'span'> = RoleTextProps<T>;
export type LabelTextProps<T extends ElementType = 'span'> = RoleTextProps<T>;
