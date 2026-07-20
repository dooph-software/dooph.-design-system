import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
}

/**
 * TextLink — body text that acts as a link. Ghost foreground at rest,
 * primary text on hover/active (Figma 554-927; color change only, no underline).
 * For Next.js: <TextLink asChild><Link href="…">Changelog</Link></TextLink>
 */
const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return (
      <Comp
        ref={ref}
        className={cn(
          "text-style-body text-ghost-fg cursor-pointer",
          "transition-colors duration-100",
          "hover:text-ghost-fg-active active:text-ghost-fg-active",
          "ds-focus-visible-ring rounded-tight",
          className,
        )}
        {...props}
      />
    );
  },
);
TextLink.displayName = "TextLink";
export { TextLink };
