'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type CSSProperties,
} from 'react';
import { cn } from '../../utils/cn';
import { LinearProgressVariant } from './constants';

export interface LinearProgressIndicatorProps
  extends ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: LinearProgressVariant;
}

const LinearProgressIndicator = forwardRef<
  ComponentRef<typeof ProgressPrimitive.Root>,
  LinearProgressIndicatorProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      variant = LinearProgressVariant.brand,
      ...props
    },
    ref,
  ) => {
    const pct = max > 0 ? (Math.min(Math.max(value ?? 0, 0), max) / max) * 100 : 0;
    return (
      <ProgressPrimitive.Root
        ref={ref}
        value={value}
        max={max}
        style={{ '--progress-pct': pct } as CSSProperties}
        className={cn('relative h-[4px] w-full', className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out',
            'w-[max(4px,calc(var(--progress-pct)*1%-2px))]',
            variant === LinearProgressVariant.primary ? 'bg-primary' : 'bg-brand',
          )}
        />
        <div
          aria-hidden
          className={cn(
            'absolute inset-y-0 right-0 rounded-full bg-border-primary',
            'left-[min(100%,calc(var(--progress-pct)*1%+2px))]',
            'data-[hidden]:hidden',
          )}
          data-hidden={pct >= 100 || undefined}
        />
      </ProgressPrimitive.Root>
    );
  },
);
LinearProgressIndicator.displayName = 'LinearProgressIndicator';

export { LinearProgressIndicator };
