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
 *   from the right. A newly needed wheel turns off zero; a departing one rolls
 *   to zero and fades.
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

/* Generous relative to the 180ms token default. Only a backstop: an exiting
 * wheel is already invisible via the opacity transition, and any survivor is
 * dropped by the next reconcile regardless. */
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

    const { next, pending } = reconcileWheels(wheels, joined.split(""));
    setWheels(next);

    /* Retarget brand-new wheels on the NEXT frame. They mount showing 0; the
     * browser has to paint that from-state before a transition to the real
     * digit can run, otherwise the wheel simply appears at its final value. */
    let raf = 0;
    if (pending.size > 0) {
      raf = requestAnimationFrame(() => {
        setWheels((cur) =>
          cur.map((w) =>
            pending.has(w.place) ? { ...w, digit: pending.get(w.place)! } : w,
          ),
        );
      });
    }

    const timer = window.setTimeout(
      () => setWheels((cur) => cur.filter((w) => !w.exiting)),
      EXIT_FALLBACK_MS,
    );

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
    /* `wheels` is read but deliberately not a dependency: this effect must run
     * once per VALUE change, and depending on the state it sets would loop. */
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

  const hasCents = parsed.centsDigits.length > 0;
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
