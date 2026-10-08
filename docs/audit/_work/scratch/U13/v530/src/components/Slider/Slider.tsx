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
import { resolveDsColor, type DsColor } from '../../utils/color';
import { LabelText } from '../Text';

type RootProps = ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

/* Take the event types from Radix's own handler props rather than naming an
 * element type — Radix renders a span but types these against HTMLDivElement. */
type RootKeyboardEvent = Parameters<NonNullable<RootProps['onKeyDown']>>[0];
type RootPointerEvent = Parameters<NonNullable<RootProps['onPointerDown']>>[0];

export interface SliderProps extends RootProps {
  /** Handle color, and the active track at 45% of it. Accepts a DS token name
   * ('primary', 'brand', 'text') or any CSS color. Defaults to the primary token. */
  color?: DsColor;
}

const DEFAULT_COLOR = 'var(--ui-color-primary)';

/* Radix quantizes the value to `step`, so a stepped slider dragged at its real
 * step lurches from dot to dot. We hand Radix a much finer step during drag so
 * the handle tracks the pointer 1:1, and snap the public value back onto the
 * real step. The only visible cost is aria-valuenow reading an intermediate
 * value mid-drag; it lands on a real step the moment the pointer is released. */
const DRAG_SUBDIVISIONS = 100;

const pctOf = (v: number, min: number, max: number) =>
  max === min ? 0 : ((v - min) / (max - min)) * 100;

/* Thumb-aligned position for a value's percent. Radix insets the thumb by half
 * its width at each end (center travels [handleW/2 … 100%-handleW/2]); step dots
 * and both fills use the SAME formula so a dot sits exactly under the thumb at
 * its stop instead of a few px beside it.
 *
 * IMPORTANT: the calc() class strings below MUST stay as single literal strings
 * — Tailwind's scanner reads source text and cannot see concatenated names. */
const thumbAlignedLeft = (percent: number) =>
  `calc(${percent} / 100 * (100% - var(--ui-width-slider-handle)) + var(--ui-width-slider-handle) / 2)`;

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
      style,
      color,
      showSteps = false,
      min = 0,
      max = 100,
      step = 1,
      defaultValue,
      value,
      onValueChange,
      onValueCommit,
      onKeyDown,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      dir,
      inverted,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = useState<number[]>(
      value ?? defaultValue ?? [min],
    );
    /* Raw, un-snapped position held only while the pointer is down. Rendering
     * from this is what makes the stepped drag smooth; dropping it back to null
     * on release is what makes the handle glide onto the nearest dot. */
    const [drag, setDrag] = useState<number[] | null>(null);
    const [dragging, setDragging] = useState(false);
    /* Radix positions the handle with an offset it can only apply after it has
     * measured the handle, so the first paint moves it by half a handle width.
     * Transitions stay off until the user touches the control, otherwise every
     * stepped slider slides 3px on mount. */
    const [interacted, setInteracted] = useState(false);

    const settled = value ?? internal; // always on-step
    const display = drag ?? settled; // what Radix and the fills render

    const snap = useCallback(
      (v: number) => {
        if (!(step > 0)) return v;
        const snapped = min + Math.round((v - min) / step) * step;
        /* toFixed tames float drift from divide-then-multiply (0.1 steps). */
        return Math.min(max, Math.max(min, Number(snapped.toFixed(6))));
      },
      [max, min, step],
    );

    const publish = useCallback(
      (next: number[]) => {
        setInternal(next);
        if (next.some((v, i) => v !== settled[i])) onValueChange?.(next);
      },
      [onValueChange, settled],
    );

    const handleValueChange = useCallback(
      (next: number[]) => {
        if (!showSteps) {
          setInternal(next);
          onValueChange?.(next);
          return;
        }
        setDrag(next);
        publish(next.map(snap));
      },
      [onValueChange, publish, showSteps, snap],
    );

    const handleValueCommit = useCallback(
      (next: number[]) => {
        setDragging(false);
        if (!showSteps) {
          onValueCommit?.(next);
          return;
        }
        const snapped = next.map(snap);
        setDrag(null);
        publish(snapped);
        onValueCommit?.(snapped);
      },
      [onValueCommit, publish, showSteps, snap],
    );

    /* Radix only commits when the value actually changed, so a press-and-release
     * that never moved would otherwise leave us stuck in the dragging state. */
    const endDrag = useCallback(() => {
      setDragging(false);
      setDrag(null);
    }, []);

    const handleKeyDown = (event: RootKeyboardEvent) => {
      onKeyDown?.(event);
      if (!showSteps || event.defaultPrevented || props.disabled) return;
      setInteracted(true);

      /* The fine drag step would otherwise make an arrow press move a hundredth
       * of a dot, so stepped keyboard interaction is handled here instead.
       * Left/Right follow the visual direction; Up/Down are always increase or
       * decrease, matching Radix. */
      const flip = (dir === 'rtl' ? -1 : 1) * (inverted ? -1 : 1);
      const from = snap(display[0] ?? min);
      let next: number;

      switch (event.key) {
        case 'ArrowLeft':
          next = from - step * flip;
          break;
        case 'ArrowRight':
          next = from + step * flip;
          break;
        case 'ArrowDown':
        case 'PageDown':
          next = from - step;
          break;
        case 'ArrowUp':
        case 'PageUp':
          next = from + step;
          break;
        case 'Home':
          next = min;
          break;
        case 'End':
          next = max;
          break;
        default:
          return;
      }

      event.preventDefault(); // stops Radix moving by the fine drag step
      const committed = [snap(Math.min(max, Math.max(min, next)))];
      setDrag(null);
      publish(committed);
      onValueCommit?.(committed);
    };

    const handlePointerDown = (event: RootPointerEvent) => {
      onPointerDown?.(event);
      setInteracted(true);
      setDragging(true);
    };

    const handlePointerUp = (event: RootPointerEvent) => {
      onPointerUp?.(event);
      endDrag();
    };

    const handlePointerCancel = (event: RootPointerEvent) => {
      onPointerCancel?.(event);
      endDrag();
    };

    const pct = pctOf(display[0] ?? min, min, max);
    const stepValues =
      showSteps && step > 0
        ? Array.from(
            { length: Math.floor((max - min) / step) + 1 },
            (_, i) => min + i * step,
          )
        : [];

    return (
      /* The outer box owns the width; on the stepped slider its horizontal
       * padding is what pulls the end dots off the ends of the track. Radix maps
       * both the pointer and the handle against the Root's own box, so shrinking
       * the Root is the only way to inset the handle's travel — the fills then
       * bleed back out over the padding via --ds-slider-pad so the track still
       * spans the full width. Padding is 0px on the continuous slider, which
       * leaves its geometry exactly as it was. */
      <div
        className={cn(
          'relative flex w-full items-center',
          showSteps && 'px-xs',
          className,
        )}
      >
        <SliderPrimitive.Root
          ref={ref}
          min={min}
          max={max}
          step={showSteps ? step / DRAG_SUBDIVISIONS : step}
          value={display}
          onValueChange={handleValueChange}
          onValueCommit={handleValueCommit}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={endDrag}
          dir={dir}
          inverted={inverted}
          data-dragging={dragging || undefined}
          style={
            {
              ...style,
              '--slider-pct': pct,
              '--ds-slider-color': resolveDsColor(color, DEFAULT_COLOR),
              '--ds-slider-pad': showSteps ? 'var(--ui-spacing-xs)' : '0px',
            } as CSSProperties
          }
          className={cn(
            'relative flex w-full touch-none select-none items-center',
            'h-[var(--ui-height-slider-handle)]',
            /* ds-radix-data-disabled, NOT `data-[disabled]:ds-disabled-state`.
             * That form was broken twice over: a Tailwind variant only composes
             * with a GENERATED utility, so pairing one with a package class
             * emits no rule at all — and `.ds-disabled-state` keys off
             * `:disabled`/`[aria-disabled]`, which a Radix Root <span> carrying
             * `data-disabled` never has. */
            'ds-radix-data-disabled data-[dragging]:cursor-ew-resize',
            /* One transition definition for the handle and both fills, so they
             * settle onto the dot together. Off mid-drag: the handle has to
             * track the pointer 1:1 there, exactly like the continuous slider. */
            showSteps && interacted && !dragging && 'ds-slider-glide',
          )}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-slider-track w-full">
            {/* active pill — hidden at 0% so its rounding doesn't paint a sliver */}
            <div
              aria-hidden
              data-hidden={pct <= 0 || undefined}
              className={cn(
                'ds-slider-part absolute inset-y-0 overflow-hidden data-[hidden]:hidden',
                'rounded-l-tight rounded-r-slider-inner',
                'left-[calc(-1*var(--ds-slider-pad))]',
                'w-[max(0px,calc(var(--slider-pct)/100*(100%-var(--ui-width-slider-handle))-var(--ui-slider-track-gap)+var(--ds-slider-pad)))]',
                'ds-slider-fill',
              )}
            />
            {/* inactive pill — hidden at 100% so its borders don't paint a sliver */}
            <div
              aria-hidden
              data-hidden={pct >= 100 || undefined}
              className={cn(
                'ds-slider-part absolute inset-y-0 overflow-hidden data-[hidden]:hidden',
                'rounded-r-tight rounded-l-slider-inner',
                'right-[calc(-1*var(--ds-slider-pad))]',
                'left-[min(100%,calc(var(--slider-pct)/100*(100%-var(--ui-width-slider-handle))+var(--ui-width-slider-handle)+var(--ui-slider-track-gap)))]',
                'bg-secondary border border-solid border-secondary-border',
              )}
            />
            {/* step dots — centers aligned to the thumb's stop positions */}
            {stepValues.map((v) => (
              <span
                key={v}
                aria-hidden
                data-active={v <= (display[0] ?? min) || undefined}
                className={cn(
                  'absolute top-1/2 size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full',
                  'transition-colors duration-150 motion-reduce:transition-none',
                  'ds-slider-dot',
                )}
                style={{ left: thumbAlignedLeft(pctOf(v, min, max)) }}
              />
            ))}
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            aria-label={ariaLabel ?? 'Value'}
            className={cn(
              'block h-[var(--ui-height-slider-handle)] w-[var(--ui-width-slider-handle)]',
              'rounded-slider-inner ds-focus-visible-ring',
              'cursor-grab active:cursor-ew-resize',
              'bg-[var(--ds-slider-color)]',
            )}
          />
        </SliderPrimitive.Root>
      </div>
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
