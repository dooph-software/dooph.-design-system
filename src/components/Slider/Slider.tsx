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
import { SliderVariant } from './constants';

type RootProps = ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

/* Take the event types from Radix's own handler props rather than naming an
 * element type — Radix renders a span but types these against HTMLDivElement. */
type RootKeyboardEvent = Parameters<NonNullable<RootProps['onKeyDown']>>[0];
type RootPointerEvent = Parameters<NonNullable<RootProps['onPointerDown']>>[0];

/* Paints, split so `custom` can REQUIRE `color` at the type level. Same shape
 * as CalendarProps: a discriminated union on the variant, so the compiler
 * rejects the invalid combination before it can ever reach the runtime guard. */
type SliderPaintProps =
  | {
      /** Paint bundle: default hue, active track opacity, active step colour. */
      variant?: typeof SliderVariant.primary | typeof SliderVariant.prominent;
      /** Overrides the bundle's HUE — the handle, and the active track tinted
       * from it at the bundle's opacity. A DS token name or any CSS color. */
      color?: DsColor;
      /** Overrides the bundle's active STEP DOT. A DS token name or any CSS
       * color. Only visible on a stepped slider. */
      stepColor?: DsColor;
    }
  | {
      variant: typeof SliderVariant.custom;
      /** REQUIRED for `custom`, which has no hue of its own. */
      color: DsColor;
      stepColor?: DsColor;
    };

/** Single thumb. Only `value[0]` / `defaultValue[0]` is drawn and edited; any
 *  further values are passed back unchanged in `onValueChange` / `onValueCommit`. */
export type SliderProps = RootProps & SliderPaintProps;

/* Props that only mean something where step dots are drawn. Kept off
 * `SliderProps` so SliderContinuous, which has no dots, rejects them. */
type SliderStepProps = {
  /** Index of the step to draw tall, counted from the step at `min` (0).
   * Controlled and optional: the slider never sets it, so the consumer
   * decides what it marks, e.g. the last committed value while a drag is in
   * progress. Same width and paint as the other dots; the height change
   * animates. An index with no step (out of range, not an integer) draws
   * every dot normally. Visual only: if the mark carries meaning, also say
   * so in text, e.g. via `aria-valuetext` or a nearby label. */
  highlightedStep?: number;
};

export type SliderSteppedProps = SliderProps & SliderStepProps;

/* Figma tunes three paints together per variant, and they are not derivable
 * from one another: the track is the variant's own hue at a variant-specific
 * alpha, while the step dot is composed from the CONTENT paint so it stays
 * legible ON the filled track. Hence a bundle rather than one colour.
 *
 * `--ds-slider-track-opacity` and `--ds-slider-step-active` are read by
 * `.ds-slider-fill` and `.ds-slider-dot[data-active]`; both fall back to the
 * primary tokens, so the helper classes still render correctly if they are ever
 * applied outside this component. */
const VARIANT_PAINTS = {
  primary: {
    color: 'var(--ui-color-primary)',
    trackOpacity: 'var(--ui-slider-track-primary-active-opacity)',
    stepActive: 'var(--ui-color-slider-step-primary-active)',
  },
  prominent: {
    color: 'var(--ui-color-prominent)',
    trackOpacity: 'var(--ui-slider-track-prominent-active-opacity)',
    stepActive: 'var(--ui-color-slider-step-prominent-active)',
  },
  /* `custom` owns no hue — `color` is required and supplies it. The opacity and
   * step colour fall back to primary's so a slider given only `color` still has
   * sane geometry; pass `stepColor` to complete the palette. `color` here is
   * unreachable in practice (the guard below rejects the omission) and exists
   * only so the fallback argument to resolveDsColor is never undefined. */
  custom: {
    color: 'var(--ui-color-primary)',
    trackOpacity: 'var(--ui-slider-track-primary-active-opacity)',
    stepActive: 'var(--ui-color-slider-step-primary-active)',
  },
} satisfies Record<
  SliderVariant,
  { color: string; trackOpacity: string; stepActive: string }
>;

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
 * The same formula backs `.ds-slider-active-part` / `.ds-slider-inactive-part`
 * in dooph-component-tokens.css; change them together. */
const thumbAlignedLeft = (percent: number) =>
  `calc(${percent} / 100 * (100% - var(--ui-width-slider-handle)) + var(--ui-width-slider-handle) / 2)`;

/* SliderBase takes the WIDENED shape: the union is the public contract, but
 * narrowing it inside the implementation would mean branching on the variant
 * just to read props every branch shares. */
interface SliderBaseProps extends RootProps, SliderStepProps {
  variant?: SliderVariant;
  color?: DsColor;
  stepColor?: DsColor;
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
      stepColor,
      variant = SliderVariant.primary,
      showSteps = false,
      highlightedStep,
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
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
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

    /* Single thumb: Radix is handed only value[0] (Root `value` below), so its
     * callbacks carry one value. Re-attach the consumer's extra values so an
     * `[a, b]` state comes back as `[a', b]`, never truncated, moved or
     * re-sorted by Radix's closest-thumb logic. Extras pass through as given —
     * not snapped — so a value off the step grid stays the consumer's. */
    const withExtras = useCallback(
      (first: number) => [first, ...settled.slice(1)],
      [settled],
    );

    const handleValueChange = useCallback(
      (next: number[]) => {
        if (!showSteps) {
          const merged = withExtras(next[0] ?? min);
          setInternal(merged);
          onValueChange?.(merged);
          return;
        }
        setDrag(next);
        publish(withExtras(snap(next[0] ?? min)));
      },
      [min, onValueChange, publish, showSteps, snap, withExtras],
    );

    const handleValueCommit = useCallback(
      (next: number[]) => {
        setDragging(false);
        if (!showSteps) {
          onValueCommit?.(withExtras(next[0] ?? min));
          return;
        }
        const snapped = withExtras(snap(next[0] ?? min));
        setDrag(null);
        publish(snapped);
        onValueCommit?.(snapped);
      },
      [min, onValueCommit, publish, showSteps, snap, withExtras],
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
       * decrease, matching Radix. PageUp/PageDown and Shift+Arrow move 10 dots,
       * mirroring Radix's own multiplier (`isSkipKey ? 10 : 1`), so both slider
       * variants answer the same keys the same way. */
      const flip = (dir === 'rtl' ? -1 : 1) * (inverted ? -1 : 1);
      const from = snap(display[0] ?? min);
      const isPageKey = event.key === 'PageUp' || event.key === 'PageDown';
      const isSkipKey =
        isPageKey || (event.shiftKey && event.key.startsWith('Arrow'));
      const big = step * (isSkipKey ? 10 : 1);
      let next: number;

      switch (event.key) {
        case 'ArrowLeft':
          next = from - big * flip;
          break;
        case 'ArrowRight':
          next = from + big * flip;
          break;
        case 'ArrowDown':
        case 'PageDown':
          next = from - big;
          break;
        case 'ArrowUp':
        case 'PageUp':
          next = from + big;
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
      const committed = withExtras(snap(Math.min(max, Math.max(min, next))));
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

    /* Unconditional, matching ProgressIndicator's guard on an out-of-range
     * `progress`: `custom` with no hue cannot render anything meaningful, and
     * silently falling back to primary would make an explicit choice look like
     * it had been honoured. TypeScript already rejects this combination — the
     * throw is for JavaScript consumers and for a `variant` computed at run
     * time, where the union cannot help. */
    if (variant === SliderVariant.custom && !color) {
      throw new Error(
        '[Slider] variant="custom" has no palette of its own and requires a ' +
          '`color` prop (and optionally `stepColor`). Use ' +
          'variant="primary" or variant="prominent" for the built-in palettes.',
      );
    }

    const paints = VARIANT_PAINTS[variant];

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
          showSteps && 'px-sm',
          className,
        )}
      >
        <SliderPrimitive.Root
          ref={ref}
          min={min}
          max={max}
          step={showSteps ? step / DRAG_SUBDIVISIONS : step}
          value={[display[0] ?? min]}
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
              '--ds-slider-pct': pct,
              '--ds-slider-color': resolveDsColor(color, paints.color),
              '--ds-slider-track-opacity': paints.trackOpacity,
              '--ds-slider-step-active': resolveDsColor(
                stepColor,
                paints.stepActive,
              ),
              '--ds-slider-pad': showSteps ? 'var(--ui-spacing-sm)' : '0px',
            } as CSSProperties
          }
          className={cn(
            'relative flex w-full touch-none select-none items-center ds-slider-root',
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
                'ds-slider-active-part',
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
                'ds-slider-inactive-part',
                'bg-secondary border border-solid border-secondary-border',
              )}
            />
            {/* step dots — centers aligned to the thumb's stop positions.
             *
             * No colour transition, deliberately. Crossing a step is a discrete
             * event: by the time the dot's state flips the handle has already
             * passed it, so fading the colour at all only makes the dot lag
             * behind the thing that changed it. The handle and fills DO glide
             * (`.ds-slider-glide`), because they settle onto a position; a dot
             * does not move, it just switches sides.
             *
             * The highlighted step is the one exception to "nothing animates
             * here": its HEIGHT eases between dot and tall (`.ds-slider-dot`
             * transitions height only), because which step is highlighted is a
             * consumer state change, not a crossing. Its colour still flips
             * discretely like every other dot. */}
            {stepValues.map((v, i) => (
              <span
                key={v}
                aria-hidden
                data-active={v <= (display[0] ?? min) || undefined}
                data-highlighted={i === highlightedStep || undefined}
                className={cn(
                  'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                  'ds-slider-dot',
                )}
                style={{ left: thumbAlignedLeft(pctOf(v, min, max)) }}
              />
            ))}
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : 'Value')}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            className={cn(
              'block ds-slider-thumb',
              'rounded-slider-inner ds-focus-visible-ring',
              'cursor-grab active:cursor-ew-resize',
            )}
          />
        </SliderPrimitive.Root>
      </div>
    );
  },
);
SliderBase.displayName = 'SliderBase';

/** `className` styles the outer box, which owns the width; `ref`, `style` and
 * every other prop go to the Radix Root inside it. */
const SliderContinuous = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>((props, ref) => <SliderBase ref={ref} showSteps={false} {...props} />);
SliderContinuous.displayName = 'SliderContinuous';

/** `className` styles the outer box, which owns the width and the end-dot
 * inset; `ref`, `style` and every other prop go to the Radix Root inside it. */
const SliderStepped = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  SliderSteppedProps
>((props, ref) => <SliderBase ref={ref} showSteps {...props} />);
SliderStepped.displayName = 'SliderStepped';

/* A type alias, not an interface: an interface cannot extend a union, and
 * SliderProps is one. The intersection distributes over both arms, so `custom`
 * still requires `color` here too. */
export type SliderLabeledProps = SliderProps & {
  stepped?: boolean;
  labels: { start: string; end: string };
  /** Index of the step to draw tall; see SliderStepped. Only drawn when
   * `stepped`, since a continuous slider has no step dots. */
  highlightedStep?: number;
};

/** `className` styles the outer column (track + labels); `ref`, `style` and
 * every other prop go to the slider's Radix Root. */
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
