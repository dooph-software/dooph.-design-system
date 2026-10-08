/*
 * ChatDivider — a centred label between wavy rules (Figma 761:2496 Model Switch
 * Divider, 761:1453 Chat Date Divider). One component serves both Figma
 * dividers; they share every value but the text, and `children` is the label.
 * The rules take the leftover width so the label stays centred at any width
 * (Figma pins them at 120px only because its frame is a fixed 418px). When to
 * draw one — a day boundary, a model change — is the consumer's decision.
 */
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { BodyText } from "../Text";
import { WavyDivider, WavyDividerVariant } from "../WavyDivider";

export type ChatDividerProps = HTMLAttributes<HTMLDivElement>;

const ChatDivider = forwardRef<HTMLDivElement, ChatDividerProps>(
  ({ className, children, ...props }, ref) => {
    const rule = (
      <WavyDivider
        variant={WavyDividerVariant.high}
        aria-hidden
        className="min-w-0 flex-1 text-border-primary"
      />
    );
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full items-center justify-center gap-rg overflow-hidden",
          className,
        )}
        {...props}
      >
        {rule}
        <BodyText className="shrink-0 whitespace-nowrap text-text-secondary">
          {children}
        </BodyText>
        {rule}
      </div>
    );
  },
);
ChatDivider.displayName = "ChatDivider";

export { ChatDivider };
