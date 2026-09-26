/*
 * AIContextGauge — how full the model's context is (the dial inside Figma
 * 761:1382, AI Prompt Input).
 *
 * ## behavior
 * - Draws `used / budget` on a flat ProgressIndicator. `color` is the open
 *   design value (a LoadingSpinnerColor key or any CSS colour), so warning
 *   tiers are a consumer's call:
 *   `color={ratio > 0.9 ? "var(--ui-color-danger-primary)" : undefined}`.
 *
 * ## constraints
 * - Deliberately NOT clamped. A gauge that quietly pins at full would disagree
 *   with the numbers the consumer holds, so an out-of-range ratio reaches
 *   ProgressIndicator — which THROWS. Keeping the figures in range is the
 *   consumer's job; their stream keeps running if this throws inside it.
 * - `budget <= 0` means "no budget known yet" (the state before a first reply)
 *   and draws empty. That is the absence of a ratio, not a clamp: 0/0 is NaN,
 *   which would otherwise slip past the range guard and render garbage.
 */
import { forwardRef } from "react";
import { LoadingSpinnerSize } from "../LoadingSpinner/constants";
import {
  ProgressIndicator,
  type ProgressIndicatorProps,
} from "../ProgressIndicator/ProgressIndicator";
import { ProgressIndicatorVariants } from "../ProgressIndicator/constants";

export type AIContextGaugeProps = Omit<
  ProgressIndicatorProps,
  "progress" | "variant"
> & {
  /** Tokens the conversation occupies. */
  used: number;
  /** What `used` is measured against. */
  budget: number;
};

const AIContextGauge = forwardRef<SVGSVGElement, AIContextGaugeProps>(
  ({ used, budget, size = LoadingSpinnerSize.sm, ...props }, ref) => (
    <ProgressIndicator
      ref={ref}
      progress={budget > 0 ? used / budget : 0}
      variant={ProgressIndicatorVariants.flat}
      size={size}
      {...props}
    />
  ),
);
AIContextGauge.displayName = "AIContextGauge";

export { AIContextGauge };
