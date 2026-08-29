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

/* Generous relative to the 180ms token default, and a backstop only — an
 * exiting wheel is normally removed by its own `transitionend` on both the
 * normal-motion and reduced-motion paths (index.css keeps the opacity fade
 * running under `prefers-reduced-motion: reduce` specifically so that fires).
 * Any survivor is also dropped by the next reconcile regardless.
 *
 * This constant is a hardcoded motion timing whose sibling
 * `--ui-rolling-money-duration` is a token. It is NOT derived from that
 * token: a consumer who raises `--ui-rolling-money-duration` past 600ms will
 * get exiting wheels culled mid-fade by this timer before their transition
 * completes. That is a known limitation, not a bug to silently work around —
 * fixing it means reading the token's computed value in JS, which is a
 * bigger change than this constant is worth today. */
const EXIT_FALLBACK_MS = 600;

/* Stage-one durations, mirroring the CSS. A growth waits out the new wheel's
 * fade (`--ui-rolling-money-fade-duration`) before rolling; a shrink waits out
 * the roll (`--ui-rolling-money-duration`) before fading the departing wheel.
 * Same caveat as EXIT_FALLBACK_MS above: these mirror the tokens rather than
 * deriving from them, so a consumer who retimes those tokens should retime
 * these too. Keeping them slightly SHORT of the CSS would overlap the stages;
 * keeping them long would leave a visible pause. */
const ENTER_STAGE_MS = 160;
const ROLL_STAGE_MS = 240;

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

    /* Under `prefers-reduced-motion: reduce` there is no transition to give
     * the "mount at 0, retarget next frame" odometer behavior any meaning —
     * it would just be a literal 0 flashed in that place for a couple of
     * frames (e.g. "$982.10" -> "$12,450.00" briefly reading "$00,450.00").
     * Skip the rAF choreography entirely and commit the real digit
     * synchronously. Guarded for environments without `matchMedia` (older
     * browsers, non-browser SSR-adjacent contexts). */
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      /* `entering` must be cleared here too, not just retargeted: it drives an
       * opacity-0 rule, and with no transition to lift it the wheel would
       * simply stay invisible forever. */
      const settled = next.map((w) => ({
        ...w,
        entering: false,
        digit: pending.has(w.place) ? pending.get(w.place)! : w.digit,
      }));
      setWheels(settled);

      if (settled.every((w) => !w.exiting)) return;

      const timer = window.setTimeout(
        () => setWheels((cur) => (cur.some((w) => w.exiting) ? cur.filter((w) => !w.exiting) : cur)),
        EXIT_FALLBACK_MS,
      );
      return () => window.clearTimeout(timer);
    }

    /* The change is choreographed in stages rather than all at once, because
     * doing it all at once reads as a flash: the figure's width jumps, a digit
     * appears from nowhere, and everything rolls, in the same frame.
     *
     * GROWTH ($982 -> $1,240): hold every surviving wheel at its OLD digit, so
     * the only motion in stage one is the figure widening and the new wheel
     * fading up from 0. Once it has landed, everything rolls together.
     *
     * SHRINK ($1,240 -> $982): the mirror. Survivors roll first while the
     * departing wheel stays put at its old digit and full opacity, so the
     * figure does not collapse underneath a roll in progress; only afterwards
     * does it fade out and unmount. */
    const prevDigits = new Map(
      wheels.filter((w) => !w.exiting).map((w) => [w.place, w.digit] as const),
    );
    const hasEnter = next.some((w) => w.entering);
    const exitPlaces = next.filter((w) => w.exiting).map((w) => w.place);

    const staged = next.map((w) => {
      if (w.entering) return w;
      if (w.exiting) return { ...w, exiting: false };
      return hasEnter ? { ...w, digit: prevDigits.get(w.place) ?? w.digit } : w;
    });
    setWheels(staged);

    const finalDigits = new Map(next.map((w) => [w.place, w.digit] as const));
    pending.forEach((digit, place) => finalDigits.set(place, digit));

    let raf = 0;
    let stageTimer = 0;
    let exitTimer = 0;

    /* Stage two of a growth: drop `entering`, which is what starts the
     * opacity fade. A single rAF is not enough — the from-state is a React
     * render committed from inside this passive effect, not a direct DOM
     * write, and nothing guarantees that commit paints before the very next
     * frame's callbacks. The second frame is guaranteed to follow the paint. */
    if (hasEnter) {
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

    if (hasEnter || exitPlaces.length > 0) {
      /* Wait for whichever stage-one motion is actually running: a growth
       * waits out the fade, a shrink waits out the roll. */
      const stageMs = hasEnter ? ENTER_STAGE_MS : ROLL_STAGE_MS;

      stageTimer = window.setTimeout(() => {
        setWheels((cur) =>
          cur.map((w) => ({
            ...w,
            /* Also clears `entering`, which stage two normally does. That is
             * deliberate belt-and-braces: stage two runs from a rAF, and rAF
             * does not fire in a backgrounded tab, whereas this timer does.
             * Without it a wheel added while the tab was hidden could sit at
             * opacity 0 indefinitely. */
            entering: false,
            digit: finalDigits.get(w.place) ?? w.digit,
            exiting: exitPlaces.includes(w.place),
          })),
        );
      }, stageMs);

      if (exitPlaces.length > 0) {
        /* Backstop only — `onTransitionEnd` normally unmounts the wheel. The
         * clock starts at stage two, since that is when the fade begins. */
        exitTimer = window.setTimeout(
          () =>
            setWheels((cur) =>
              cur.some((w) => w.exiting) ? cur.filter((w) => !w.exiting) : cur,
            ),
          stageMs + EXIT_FALLBACK_MS,
        );
      }
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (stageTimer) window.clearTimeout(stageTimer);
      if (exitTimer) window.clearTimeout(exitTimer);
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
