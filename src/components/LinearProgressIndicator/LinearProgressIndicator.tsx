/*
 * LinearProgressIndicator — determinate bar backed by Radix Progress.
 *
 * ## behavior
 * - `value` / `max` clamp into a percentage stored on `--progress-pct`.
 * - When that percentage changes, the fill's `width` and the remainder's
 *   `left` transition (`ds-progress-fill` / `ds-progress-remainder`; off under
 *   reduced motion).
 * - `color` accepts a DS token name or any CSS color (same contract as Slider).
 *
 * ## constraints
 * - Do not add a LinearProgressVariant enum — color is the open design value.
 * - Remainder track hides at 100% via `data-hidden` so it never overlaps the nub.
 */

import * as ProgressPrimitive from '@radix-ui/react-progress';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type CSSProperties,
} from 'react';
import { cn } from '../../utils/cn';
import { resolveDsColor, type DsColor } from '../../utils/color';

export interface LinearProgressIndicatorProps
  extends Omit<ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, 'value'> {
  /** 0…`max`. Determinate only: Radix's `null` (indeterminate) is not supported. */
  value?: number;
  /** Filled-bar color. Accepts a `DS_COLOR_TOKENS` name ('primary',
   * 'prominent', 'text', 'danger-primary', …) or any CSS color. Defaults to
   * the primary token. */
  color?: DsColor;
}

const DEFAULT_COLOR = 'var(--ui-color-primary)';

const LinearProgressIndicator = forwardRef<
  ComponentRef<typeof ProgressPrimitive.Root>,
  LinearProgressIndicatorProps
>(({ className, style, value = 0, max = 100, color, ...props }, ref) => {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value ?? 0, 0), safeMax);
  const pct = (clamped / safeMax) * 100;
  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={clamped}
      max={safeMax}
      style={
        {
          ...style,
          '--progress-pct': pct,
          '--ds-progress-color': resolveDsColor(color, DEFAULT_COLOR),
        } as CSSProperties
      }
      className={cn('relative h-linear-progress w-full', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="absolute inset-y-0 left-0 rounded-full ds-progress-fill"
      />
      <div
        aria-hidden
        className={cn(
          'absolute inset-y-0 right-0 rounded-full bg-border-primary ds-progress-remainder',
          'data-[hidden]:hidden',
        )}
        data-hidden={pct >= 100 || undefined}
      />
    </ProgressPrimitive.Root>
  );
});
LinearProgressIndicator.displayName = 'LinearProgressIndicator';

export { LinearProgressIndicator };
