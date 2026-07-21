'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import {
  forwardRef,
  useCallback,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type CSSProperties,
} from 'react';
import { cn } from '../../utils/cn';
import { LabelText } from '../Text';
import { SliderVariant } from './constants';

type RootProps = ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

export interface SliderProps extends RootProps {
  variant?: SliderVariant;
}

const pctOf = (v: number, min: number, max: number) =>
  max === min ? 0 : ((v - min) / (max - min)) * 100;

/* Thumb-aligned position for a value's percent. Radix insets the thumb by half
 * its width at each end (center travels [handleW/2 … 100%-handleW/2]); step dots
 * must use the SAME formula so a dot sits exactly under the thumb at its stop
 * instead of a few px beside it. */
const thumbAlignedLeft = (percent: number) =>
  `calc(${percent} / 100 * (100% - var(--ui-width-slider-handle)) + var(--ui-width-slider-handle) / 2)`;

/* Fill geometry: each pill stops (track-gap + half handle) short of the thumb
 * center. IMPORTANT: the calc() class strings below MUST stay as single literal
 * strings — Tailwind's scanner reads source text and cannot see concatenated
 * class names. */

const activeFill: Record<SliderVariant, string> = {
  brand: 'bg-brand border border-solid border-brand-border',
  primary: 'ds-slider-fill-primary', // primary bg @45%, no border (Figma)
};

interface SliderBaseProps extends SliderProps {
  showSteps?: boolean;
}

const SliderBase = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  SliderBaseProps
>(
  (
    {
      className,
      variant = SliderVariant.brand,
      showSteps = false,
      min = 0,
      max = 100,
      step = 1,
      defaultValue,
      value,
      onValueChange,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    // Interpolate the fill/thumb between step stops (stepped only); the
    // continuous slider must track the pointer 1:1 with no transition lag.
    const glide = showSteps
      ? 'transition-[left,width] duration-150 ease-out motion-reduce:transition-none'
      : '';
    const [internal, setInternal] = useState<number[]>(
      value ?? defaultValue ?? [min],
    );
    const current = value ?? internal;
    const handleChange = useCallback(
      (next: number[]) => {
        setInternal(next);
        onValueChange?.(next);
      },
      [onValueChange],
    );
    const pct = pctOf(current[0] ?? min, min, max);
    const stepValues =
      showSteps && step > 0
        ? Array.from(
            { length: Math.floor((max - min) / step) + 1 },
            (_, i) => min + i * step,
          )
        : [];

    return (
      <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleChange}
        style={{ '--slider-pct': pct } as CSSProperties}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          'h-[var(--ui-height-slider-handle)]',
          'data-[disabled]:ds-disabled-state',
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-slider-track w-full">
          {/* active pill — hidden at 0% so its borders don't paint a sliver */}
          <div
            aria-hidden
            data-hidden={pct <= 0 || undefined}
            className={cn(
              'absolute inset-y-0 left-0 overflow-hidden data-[hidden]:hidden',
              'rounded-l-tight rounded-r-slider-inner',
              'w-[max(0px,calc(var(--slider-pct)*1%-var(--ui-slider-track-gap)-var(--ui-width-slider-handle)/2))]',
              activeFill[variant],
              glide,
            )}
          />
          {/* inactive pill — hidden at 100% so its borders don't paint a sliver */}
          <div
            aria-hidden
            data-hidden={pct >= 100 || undefined}
            className={cn(
              'absolute inset-y-0 right-0 overflow-hidden data-[hidden]:hidden',
              'rounded-r-tight rounded-l-slider-inner',
              'left-[min(100%,calc(var(--slider-pct)*1%+var(--ui-slider-track-gap)+var(--ui-width-slider-handle)/2))]',
              'bg-secondary border border-solid border-secondary-border',
              glide,
            )}
          />
          {/* step dots — centers aligned to the thumb's stop positions */}
          {stepValues.map((v) => (
            <span
              key={v}
              aria-hidden
              data-active={v <= (current[0] ?? min) || undefined}
              className={cn(
                'absolute top-1/2 size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full',
                'bg-secondary-border data-[active]:ds-slider-dot-active',
              )}
              style={{ left: thumbAlignedLeft(pctOf(v, min, max)) }}
            />
          ))}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={ariaLabel ?? 'Value'}
          className={cn(
            'block h-[var(--ui-height-slider-handle)] w-[var(--ui-width-slider-handle)]',
            'rounded-slider-inner ds-focus-visible-ring cursor-grab active:cursor-grabbing',
            variant === SliderVariant.primary ? 'bg-primary' : 'bg-brand',
            glide,
          )}
        />
      </SliderPrimitive.Root>
    );
  },
);
SliderBase.displayName = 'SliderBase';

const SliderContinuous = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>((props, ref) => <SliderBase ref={ref} showSteps={false} {...props} />);
SliderContinuous.displayName = 'SliderContinuous';

const SliderStepped = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>((props, ref) => <SliderBase ref={ref} showSteps {...props} />);
SliderStepped.displayName = 'SliderStepped';

export interface SliderLabeledProps extends SliderProps {
  stepped?: boolean;
  labels: { start: string; end: string };
}

const SliderLabeled = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  SliderLabeledProps
>(({ labels, stepped = false, className, ...props }, ref) => (
  <div className={cn('flex w-full flex-col gap-xxs', className)}>
    <SliderBase ref={ref} showSteps={stepped} {...props} />
    <div className="flex w-full items-center justify-between">
      <LabelText className="text-text-tertiary">{labels.start}</LabelText>
      <LabelText className="text-text-tertiary">{labels.end}</LabelText>
    </div>
  </div>
));
SliderLabeled.displayName = 'SliderLabeled';

export { SliderContinuous, SliderStepped, SliderLabeled };
