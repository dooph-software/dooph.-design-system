import { Slot } from "@radix-ui/react-slot";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { ButtonText, FontWeights, RollHoverText } from "../Text";
import { CTAButtonSize, CTAButtonVariant } from "./constants";

const SIZES = {
  standard: {
    pill: "p-md gap-rg",
    content: "gap-xxl ds-min-w-cta-content-standard pl-rg",
    chip: "ds-size-cta-chip-standard",
    fontSize: "var(--ui-text-cta-standard)",
  },
  big: {
    pill: "p-rg gap-md ds-min-w-cta-pill-big",
    content: "ds-gap-cta-content-big ds-min-w-cta-content-big pl-md",
    chip: "ds-size-cta-chip-big",
    fontSize: "var(--ui-text-cta-big)",
  },
} as const;

export interface CTAButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  /** Label shown inside ButtonText + RollHoverText. */
  text: string;
  /** Icon rendered inside the contrasting end chip. */
  icon: ReactNode;
  size?: CTAButtonSize;
  variant?: CTAButtonVariant;
  /**
   * Merge props onto the single child instead of rendering an `<a>`.
   * Use with Next.js `Link` (leave the Link empty — CTAButton supplies content):
   * `<CTAButton asChild text="…" icon={…}><Link href="/pricing" /></CTAButton>`
   */
  asChild?: boolean;
  children?: ReactNode;
}

/**
 * Padded-outline marketing CTA. The outline ring is primary-only; hover response
 * is label-only via RollHoverText on an ancestor `.group`. Radii stay fully round.
 */
const CTAButton = forwardRef<HTMLAnchorElement, CTAButtonProps>(
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
    const isPrimary = variant === CTAButtonVariant.primary;

    const content = (
      <span
        className={cn(
          "flex items-center",
          "rounded-full",
          "ds-drop-shadow-cta",
          s.pill,
          isPrimary ? "bg-primary" : "bg-secondary",
        )}
      >
        <span className={cn("flex items-center", s.content)}>
          <ButtonText
            fontSize={s.fontSize}
            fontWeight={FontWeights.medium}
            className={cn(
              "min-w-px flex-1",
              isPrimary ? "text-primary-fg" : "text-secondary-fg",
            )}
          >
            <RollHoverText>{text}</RollHoverText>
          </ButtonText>

          <span
            className={cn(
              "flex shrink-0 items-center justify-center gap-xs px-rg",
              "rounded-full",
              s.chip,
              isPrimary ? "bg-secondary" : "bg-primary",
            )}
          >
            <span className="relative shrink-0 overflow-clip ds-size-cta-icon">
              {icon}
            </span>
          </span>
        </span>
      </span>
    );

    const rootClassName = cn(
      "group inline-flex items-center justify-center p-xs",
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
      <a ref={ref} className={rootClassName} {...props}>
        {content}
      </a>
    );
  },
);
CTAButton.displayName = "CTAButton";

export { CTAButton };
