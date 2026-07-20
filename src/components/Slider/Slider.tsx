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

// 8px inner padding, per Figma track — step dots are inset by this on each side.
const SLIDER_PAD = 'var(--ui-spacing-xs)';

const pctOf = (v: number, min: number, max: number) =>
  max === min ? 0 : ((v - min) / (max - min)) * 100;

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
      ...props
    },
    ref,
  ) => {
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
          {/* active pill */}
          <div
            aria-hidden
            className={cn(
              'absolute inset-y-0 left-0 overflow-hidden',
              'rounded-l-tight rounded-r-slider-inner',
              'w-[max(0px,calc(var(--slider-pct)*1%-var(--ui-slider-track-gap)-var(--ui-width-slider-handle)/2))]',
              activeFill[variant],
            )}
          />
          {/* inactive pill */}
          <div
            aria-hidden
            className={cn(
              'absolute inset-y-0 right-0 overflow-hidden',
              'rounded-r-tight rounded-l-slider-inner',
              'left-[min(100%,calc(var(--slider-pct)*1%+var(--ui-slider-track-gap)+var(--ui-width-slider-handle)/2))]',
              'bg-secondary border border-solid border-secondary-border',
            )}
          />
          {/* step dots — absolute over the full track, inset by the 8px pad */}
          {stepValues.map((v) => (
            <span
              key={v}
              aria-hidden
              data-active={v <= (current[0] ?? min) || undefined}
              className={cn(
                'absolute top-1/2 size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full',
                'bg-secondary-border data-[active]:ds-slider-dot-active',
              )}
              style={{
                left: `calc(${SLIDER_PAD} + ${pctOf(v, min, max)} * (100% - 2 * ${SLIDER_PAD}) / 100)`,
              }}
            />
          ))}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={props['aria-label'] ?? 'Value'}
          className={cn(
            'block h-[var(--ui-height-slider-handle)] w-[var(--ui-width-slider-handle)]',
            'rounded-slider-inner ds-focus-visible-ring cursor-grab active:cursor-grabbing',
            variant === SliderVariant.primary ? 'bg-primary' : 'bg-brand',
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
