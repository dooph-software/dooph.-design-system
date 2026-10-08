/*
 * RollingDigitsText — per-digit 2D roll for formatted numbers, on change.
 *
 * ## behavior
 * - Accepts a pre-formatted string (`$1,234.56`, `1.2M`, `98%`). Each digit is a
 *   wheel that rolls to its new position when the value changes; the prefix and
 *   suffix swap without rolling. Mount never animates.
 * - Wheels are keyed by PLACE VALUE, not string index, so the figure aligns from
 *   the right. A place that is newly needed OPENS from zero width while it fades
 *   in; a departing one collapses to zero width where it stands. Both run
 *   concurrently with the roll of the wheels already on screen, so a change of
 *   magnitude never snaps the figure's width.
 * - Grouping separators are re-derived from place value, never parsed, and each
 *   belongs to the wheel it trails — so it opens and collapses with that wheel.
 * - `smallDecimals` splits on the last `.` and renders the decimals through the
 *   required `smallDecimalsComponent` (e.g. LabelText), raised and to the right.
 *   Those decimals are ordinary wheels and roll on the same terms.
 *
 * ## constraints
 * - US format only (`.` decimal, `,` thousands). Do not localize separators.
 * - Tabular figures are NOT optional and there is no prop to turn them off: the
 *   slot geometry gives every wheel one fixed width
 *   (--ui-rolling-digits-digit-width), which is only correct while every digit
 *   shares one advance. `.ds-rolling-digits-figure` sets it.
 * - A wrapper like RollChangeText — inherits typography from the enclosing role
 *   text. No 3D, no blur; that treatment belongs to RollHoverText.
 * - `smallDecimalsComponent` is required when `smallDecimals` is true —
 *   enforced by the discriminated union below, never by a runtime throw.
 *
 * ## updating
 * - Motion lives in CSS and in tokens (`--ui-rolling-digits-*`). Nothing here
 *   may hold a duration: an earlier version mirrored the CSS timings in JS
 *   constants to stage the fade against the roll, and the mirror desynced.
 * - There is no timer, no requestAnimationFrame and no transitionend in this
 *   file, and adding one is almost always the wrong fix. Entry is a mount
 *   animation, which needs no scheduling; exit is a single `animationend`.
 * - The reconcile runs in the RENDER phase (React's documented "adjusting state
 *   when props change"). Do not move it into an effect — that reintroduces a
 *   frame of lag between the value and the wheels, which is what forced the old
 *   `hasCents` union hack.
 */
"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import {
  hasTrailingSeparator,
  parseDigitsString,
  reconcileWheels,
  restingWheels,
  type WheelState,
} from "./rollingDigitsModel";

type SmallDecimalsComponent = ComponentType<{
  children?: ReactNode;
  className?: string;
}>;

type RollingDigitsTextBaseProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  /** A pre-formatted numeric string. The component does not format. */
  children: string;
};

export type RollingDigitsTextProps =
  | (RollingDigitsTextBaseProps & {
      smallDecimals?: false;
      smallDecimalsComponent?: never;
    })
  | (RollingDigitsTextBaseProps & {
      smallDecimals: true;
      /** Required when `smallDecimals` is true — e.g. `LabelText`. */
      smallDecimalsComponent: SmallDecimalsComponent;
    });

const DIGIT_COLUMN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** A separator slot: `,` between groups, `.` before the decimals. */
function Separator({
  children,
  entering,
  exiting,
}: {
  children: string;
  entering?: boolean;
  exiting?: boolean;
}) {
  return (
    <span
      className="ds-rolling-digits-sep"
      data-entering={entering ? "" : undefined}
      data-exiting={exiting ? "" : undefined}
    >
      {children}
    </span>
  );
}

function Wheel({
  state,
  onExited,
}: {
  state: WheelState;
  onExited: (key: string) => void;
}) {
  return (
    <span
      className="ds-rolling-digits-wheel"
      data-entering={state.entering ? "" : undefined}
      data-exiting={state.exiting ? "" : undefined}
      style={
        {
          "--ds-digit": state.digit,
          "--ds-place": state.place,
        } as CSSProperties
      }
      /* Only the wheel reports; its separator is a sibling that unmounts with
       * it. Guarded on the target because the roll's own transitionend and any
       * animation a consumer puts on the content would otherwise both land
       * here. */
      onAnimationEnd={(e) => {
        if (state.exiting && e.target === e.currentTarget) onExited(state.key);
      }}
    >
      <span className="ds-rolling-digits-clip">
        <span className="ds-rolling-digits-col">
          {DIGIT_COLUMN.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </span>
      </span>
      {/* Sets the baseline. Never visible, never out of flow. */}
      <span className="ds-rolling-digits-space">0</span>
    </span>
  );
}

function Strip({
  wheels,
  grouped,
  onExited,
}: {
  wheels: WheelState[];
  /** Integer strips group in threes; decimals never do. */
  grouped: boolean;
  onExited: (key: string) => void;
}) {
  return (
    <>
      {wheels.map((w) => (
        <span key={w.key} className="contents">
          <Wheel state={w} onExited={onExited} />
          {grouped && hasTrailingSeparator(w.place) ? (
            <Separator entering={w.entering} exiting={w.exiting}>
              ,
            </Separator>
          ) : null}
        </span>
      ))}
    </>
  );
}

/**
 * Drives one scope's wheel set. Kept as a hook so the integer and decimals
 * strips are genuinely independent — a change confined to the decimals must not
 * disturb the integer wheels or vice versa.
 *
 * The reconcile runs during render rather than in an effect. That is React's
 * documented pattern for adjusting state when props change, and it buys two
 * things this component needs: the updater form always sees current state (the
 * previous version read a deliberately stale closure and carried a fifteen-line
 * comment arguing it was safe), and the wheels are correct in the SAME render as
 * the incoming value, so callers can gate on `wheels.length` directly.
 */
function useWheels(digits: string[]) {
  const joined = digits.join("");

  /* One state object, not three. The source string, the epoch that mints exit
   * keys and the wheels themselves are only ever meaningful together, and
   * keeping them in one atom is what makes the render-phase update idempotent —
   * required, since React may render twice (StrictMode, concurrent replays).
   * Tracking `source` in a ref instead would mutate during render and make the
   * second pass disagree with the first. */
  const [state, setState] = useState(() => ({
    source: joined,
    epoch: 0,
    wheels: restingWheels(digits),
  }));

  if (state.source !== joined) {
    setState((cur) => {
      if (cur.source === joined) return cur;
      const epoch = cur.epoch + 1;
      return {
        source: joined,
        epoch,
        wheels: reconcileWheels(cur.wheels, joined.split(""), epoch),
      };
    });
  }

  const handleExited = useCallback(
    (key: string) =>
      setState((cur) => {
        const wheels = cur.wheels.filter((w) => w.key !== key);
        return wheels.length === cur.wheels.length ? cur : { ...cur, wheels };
      }),
    [],
  );

  return { wheels: state.wheels, handleExited };
}

const RollingDigitsTextBase = forwardRef<
  HTMLSpanElement,
  RollingDigitsTextProps
>((props, ref) => {
  const {
    children,
    smallDecimals = false,
    smallDecimalsComponent: SmallDecimals,
    className,
    style,
    ...rest
  } = props as RollingDigitsTextBaseProps & {
    smallDecimals?: boolean;
    smallDecimalsComponent?: SmallDecimalsComponent;
    className?: string;
  };

  const parsed = useMemo(() => parseDigitsString(children), [children]);
  const integers = useWheels(parsed.integerDigits);
  const decimals = useWheels(parsed.decimalsDigits);

  /* The group outlives the value: it stays mounted while its wheels collapse,
   * so "$5.25" -> "$5" is a visible exit rather than an unmount. The decimal
   * point is told to leave as soon as the value drops its decimals, and is
   * carried off with the group when the last wheel finishes. */
  const decimalsLeaving = parsed.decimalsDigits.length === 0;
  /* The point opens with the group. Every wheel being `entering` is exactly the
   * condition "this group is new", since `entering` only survives until a place
   * is reconciled against an existing one. */
  const decimalsArriving =
    decimals.wheels.length > 0 && decimals.wheels.every((w) => w.entering);
  const decimalsBody = decimals.wheels.length > 0 && (
    <>
      <Separator entering={decimalsArriving} exiting={decimalsLeaving}>
        .
      </Separator>
      <Strip
        wheels={decimals.wheels}
        grouped={false}
        onExited={decimals.handleExited}
      />
    </>
  );

  return (
    <span
      ref={ref}
      className={cn("ds-rolling-digits", className)}
      style={style}
      {...rest}
    >
      {/* Ten glyphs per wheel would be announced as "0123456789" once per digit,
       * so the figure is hidden and the real value is exposed here. No
       * aria-live: a total driven by row hover must not narrate. */}
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="ds-rolling-digits-figure">
        {parsed.prefix}
        <Strip
          wheels={integers.wheels}
          grouped
          onExited={integers.handleExited}
        />
        {decimalsBody &&
          (smallDecimals && SmallDecimals ? (
            <span className="ds-rolling-digits-decimals">
              <SmallDecimals>{decimalsBody}</SmallDecimals>
            </span>
          ) : (
            decimalsBody
          ))}
        {parsed.suffix}
      </span>
    </span>
  );
});
RollingDigitsTextBase.displayName = "RollingDigitsText";

/* forwardRef collapses the discriminated union when props are destructured, so
 * the public identifier is cast back to it — the same technique BaseText uses
 * to restore its polymorphic typing. */
const RollingDigitsText = RollingDigitsTextBase as (
  props: RollingDigitsTextProps & { ref?: React.Ref<HTMLSpanElement> },
) => ReactNode;

export { RollingDigitsText };
