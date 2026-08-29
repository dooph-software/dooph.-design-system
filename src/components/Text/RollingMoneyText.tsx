/*
 * RollingMoneyText — per-digit 2D roll for US-formatted money strings, on change.
 *
 * ## behavior
 * - Accepts a pre-formatted string (`$1,234.56`). Each digit is a wheel that
 *   transitions to its new position when the value changes; `$`, `,` and `.`
 *   swap without rolling. Mount never animates.
 * - `smallCents` splits on the last `.` and renders `.` plus the cents through
 *   the required `smallCentsComponent` (e.g. LabelText), raised and to the
 *   right. Those cents are ordinary wheels and roll on the same terms.
 * - Wheels are keyed by PLACE VALUE, not string index, so the figure aligns
 *   from the right. A newly needed wheel fades in already showing its digit; a
 *   departing one fades out where it stands. Both run concurrently with the
 *   roll of the wheels that were already on screen.
 *
 * ## constraints
 * - US format only (`.` decimal, `,` thousands). Do not localize separators.
 * - A wrapper like RollChangeText — inherits typography from the enclosing role
 *   text. No 3D, no blur; that treatment belongs to RollHoverText.
 * - The roll is a CSS transition, never a keyframe animation. Re-applying an
 *   animation class that is already present does not restart it, which is why
 *   the previous version fired on roughly every other change.
 * - `smallCentsComponent` is required when `smallCents` is true — enforced by
 *   the discriminated union below, never by a runtime throw.
 */
"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import {
  parseMoney,
  reconcileWheels,
  restingWheels,
  separatorBefore,
  type WheelState,
} from "./rollingMoneyModel";

type SmallCentsComponent = ComponentType<{
  children?: ReactNode;
  className?: string;
}>;

type RollingMoneyTextBaseProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  /** A pre-formatted US money string. The component does not format. */
  children: string;
};

export type RollingMoneyTextProps =
  | (RollingMoneyTextBaseProps & {
      smallCents?: false;
      smallCentsComponent?: never;
    })
  | (RollingMoneyTextBaseProps & {
      smallCents: true;
      /** Required when `smallCents` is true — e.g. `LabelText`. */
      smallCentsComponent: SmallCentsComponent;
    });

const DIGIT_COLUMN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/* Backstop only. An entering wheel is normally revealed by a rAF and an exiting
 * one removed by its own `transitionend` (index.css keeps the opacity fade
 * running under `prefers-reduced-motion: reduce` specifically so that fires).
 * This timer covers the case neither can: a backgrounded tab, where rAF does
 * not run at all. Any survivor is also dropped by the next reconcile.
 *
 * It is a hardcoded motion timing whose sibling `--ui-rolling-money-*`
 * durations are tokens, and is deliberately generous rather than derived —
 * a consumer who raises those tokens past 600ms would get exiting wheels
 * culled mid-fade. Known limitation, not silently worked around. */
const EXIT_FALLBACK_MS = 600;

function Wheel({
  state,
  onExited,
}: {
  state: WheelState;
  onExited: (place: number) => void;
}) {
  return (
    <span
      className="ds-rolling-money-wheel"
      data-exiting={state.exiting ? "" : undefined}
      data-entering={state.entering ? "" : undefined}
      style={{ "--ds-money-place": state.place } as CSSProperties}
      onTransitionEnd={(e) => {
        if (state.exiting && e.propertyName === "opacity") {
          onExited(state.place);
        }
      }}
    >
      <span className="ds-rolling-money-clip">
        <span
          className="ds-rolling-money-col"
          style={{ "--ds-money-digit": state.digit } as CSSProperties}
        >
          {DIGIT_COLUMN.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </span>
      </span>
      {/* Sets width and baseline. Never visible. */}
      <span className="ds-rolling-money-space">0</span>
    </span>
  );
}

function Strip({
  wheels,
  scope,
  separators,
  onExited,
}: {
  wheels: WheelState[];
  scope: string;
  separators: boolean;
  onExited: (place: number) => void;
}) {
  return (
    <>
      {wheels.map((w, i) => (
        <span key={`${scope}:${w.place}`} className="contents">
          {separators && separatorBefore(wheels, i) ? (
            <span className="ds-rolling-money-sep">,</span>
          ) : null}
          <Wheel state={w} onExited={onExited} />
        </span>
      ))}
    </>
  );
}

/**
 * Drives one scope's wheel set. Kept as a hook so the integer and cents strips
 * are genuinely independent — a change confined to the cents must not disturb
 * the dollars' wheels or vice versa.
 *
 * Every part of a change runs CONCURRENTLY: survivors roll, an added wheel
 * fades in already showing its digit, a departing one fades out where it
 * stands. An earlier version staged these against each other with timers that
 * mirrored the CSS durations, which desynced by the two frames the enter fade
 * costs — the roll started while the new digit was still translucent. Motion
 * that needs to agree with a CSS duration is expressed in CSS, not mirrored in
 * a constant here.
 */
function useWheels(digits: string[]) {
  const joined = digits.join("");
  const [wheels, setWheels] = useState<WheelState[]>(() =>
    restingWheels(digits),
  );
  const prevRef = useRef(joined);

  useEffect(() => {
    if (prevRef.current === joined) return;
    prevRef.current = joined;

    const next = reconcileWheels(wheels, joined.split(""));
    setWheels(next);

    const hasEntering = next.some((w) => w.entering);
    const hasExiting = next.some((w) => w.exiting);
    if (!hasEntering && !hasExiting) return;

    let raf = 0;

    /* Drop `entering`, which is what starts the fade. A single rAF is not
     * enough: the from-state is a React render committed from inside this
     * passive effect, not a direct DOM write, and nothing guarantees that
     * commit paints before the very next frame's callbacks. The second frame
     * is guaranteed to follow the paint. */
    if (hasEntering) {
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          setWheels((cur) =>
            cur.some((w) => w.entering)
              ? cur.map((w) => (w.entering ? { ...w, entering: false } : w))
              : cur,
          );
        });
      });
    }

    /* One backstop for both directions — see EXIT_FALLBACK_MS. */
    const settle = window.setTimeout(() => {
      setWheels((cur) => {
        if (!cur.some((w) => w.entering || w.exiting)) return cur;
        return cur
          .filter((w) => !w.exiting)
          .map((w) => (w.entering ? { ...w, entering: false } : w));
      });
    }, EXIT_FALLBACK_MS);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
    /* `wheels` is read but deliberately not a dependency: this effect must run
     * once per VALUE change, and depending on the state it sets would loop.
     * Reading the possibly-stale closed-over `wheels` here is safe only
     * because `setWheels(next)` is a plain value, which discards any `wheels`
     * update enqueued between the render commit and this passive-effect
     * flush — and every such lost update is harmless under the model's
     * current behavior: `reconcileWheels` drops already-exiting wheels up
     * front, so a lost update is either re-derived from `prev` or a removal
     * that happens anyway. If `reconcileWheels` ever stops dropping exiting
     * wheels up front, this becomes a real lost-update bug. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);

  const handleExited = (place: number) =>
    setWheels((cur) => cur.filter((w) => !(w.exiting && w.place === place)));

  return { wheels, handleExited };
}

const RollingMoneyTextBase = forwardRef<
  HTMLSpanElement,
  RollingMoneyTextProps
>((props, ref) => {
  const {
    children,
    smallCents = false,
    smallCentsComponent: SmallCents,
    className,
    style,
    ...rest
  } = props as RollingMoneyTextBaseProps & {
    smallCents?: boolean;
    smallCentsComponent?: SmallCentsComponent;
    className?: string;
  };

  const parsed = useMemo(() => parseMoney(children), [children]);
  const intStrip = useWheels(parsed.integerDigits);
  const centsStrip = useWheels(parsed.centsDigits);

  /* Gated on the union of the incoming value and outstanding wheel state, not
   * `parsed.centsDigits` alone: `centsStrip.wheels` lags one render behind
   * `parsed` (it only catches up once the reconcile effect flushes), so on a
   * change like "$5.25" -> "$5" the incoming value alone would unmount this
   * whole group — separator included — before the cents wheels it owns ever
   * get to roll to zero and fade. Staying mounted as long as either side has
   * something to show keeps that exit visible. */
  const hasCents = parsed.centsDigits.length > 0 || centsStrip.wheels.length > 0;
  const centsBody = (
    <>
      <span className="ds-rolling-money-sep">.</span>
      <Strip
        wheels={centsStrip.wheels}
        scope="cents"
        separators={false}
        onExited={centsStrip.handleExited}
      />
    </>
  );

  return (
    <span
      ref={ref}
      className={cn("ds-rolling-money", className)}
      style={style}
      {...rest}
    >
      {/* Ten glyphs per wheel would be announced as "0123456789" once per
       * digit, so the figure is hidden and the real value is exposed here.
       * No aria-live: a total driven by row hover must not narrate. */}
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="ds-rolling-money-figure">
        {parsed.prefix}
        <Strip
          wheels={intStrip.wheels}
          scope="int"
          separators
          onExited={intStrip.handleExited}
        />
        {hasCents ? (
          smallCents && SmallCents ? (
            <span className="ds-rolling-money-cents">
              <SmallCents>{centsBody}</SmallCents>
            </span>
          ) : (
            centsBody
          )
        ) : null}
        {parsed.suffix}
      </span>
    </span>
  );
});
RollingMoneyTextBase.displayName = "RollingMoneyText";

/* forwardRef collapses the discriminated union when props are destructured, so
 * the public identifier is cast back to it — the same technique BaseText uses
 * to restore its polymorphic typing. */
const RollingMoneyText = RollingMoneyTextBase as (
  props: RollingMoneyTextProps & { ref?: React.Ref<HTMLSpanElement> },
) => ReactNode;

export { RollingMoneyText };
