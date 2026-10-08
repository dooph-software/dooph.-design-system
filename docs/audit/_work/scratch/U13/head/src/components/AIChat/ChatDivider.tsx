/*
 * ChatDivider — a centred label between wavy rules (Figma 761:2496 Model Switch
 * Divider, 761:1453 Chat Date Divider).
 *
 * ## behavior
 * - One component for both Figma dividers: they share every value but the
 *   text. `children` is the label — "Today", or "Switched to <b>Opus 5</b> Low".
 * - The rules take the leftover width so the label stays centred at any width;
 *   Figma pins them at 120px only because its frame is a fixed 418px.
 *
 * ## constraints
 * - Deciding WHEN to draw one (a day boundary, a model change) is the
 *   consumer's: it depends on their message metadata.
 */
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { WavyDivider } from "../WavyDivider/WavyDivider";
import { WavyDividerVariant } from "../WavyDivider/constants";

export type ChatDividerProps = HTMLAttributes<HTMLDivElement>;

const ChatDivider = forwardRef<HTMLDivElement, ChatDividerProps>(
  ({ className, children, ...props }, ref) => {
    const rule = (
      <WavyDivider
        variant={WavyDividerVariant.high}
        aria-hidden
        className="h-3 min-w-0 flex-1 text-border-primary"
      />
    );
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full items-center justify-center gap-sm overflow-hidden",
          className,
        )}
        {...props}
      >
        {rule}
        <span className="shrink-0 whitespace-nowrap text-style-body text-text-tertiary">
          {children}
        </span>
        {rule}
      </div>
    );
  },
);
ChatDivider.displayName = "ChatDivider";

export { ChatDivider };
