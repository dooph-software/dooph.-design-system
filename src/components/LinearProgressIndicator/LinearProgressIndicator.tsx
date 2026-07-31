'use client';

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
  extends ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Filled-bar color. Accepts a DS token name ('primary', 'brand', 'text') or
   * any CSS color. Defaults to the primary token. */
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
      className={cn('relative h-[4px] w-full', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out',
          'w-[max(4px,calc(var(--progress-pct)*1%-2px))]',
          'bg-[var(--ds-progress-color)]',
        )}
      />
      <div
        aria-hidden
        className={cn(
          'absolute inset-y-0 right-0 rounded-full bg-border-primary',
          'left-[max(4px,min(100%,calc(var(--progress-pct)*1%+2px)))]',
          'data-[hidden]:hidden',
        )}
        data-hidden={pct >= 100 || undefined}
      />
    </ProgressPrimitive.Root>
  );
});
LinearProgressIndicator.displayName = 'LinearProgressIndicator';

export { LinearProgressIndicator };
