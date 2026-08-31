/*
 * RollingDigitsText — pure model. No React, no DOM, no "use client".
 *
 * ## behavior
 * Two jobs, both total functions:
 *   1. Split a formatted numeric string into prefix / integer digits / decimal
 *      digits / suffix. Grouping separators are DISCARDED here and re-derived
 *      at render time, so a separator can never be diffed against a digit.
 *   2. Reconcile the previous wheel set against a new digit string, keyed by
 *      PLACE VALUE counting rightward — never by string index. Index-from-left
 *      matching is what made $982.10 -> $1,240.00 compare the tens digit
 *      against a comma and refuse to animate.
 *
 * ## constraints
 * - Stays free of React and of the DOM. Everything here must be callable during
 *   render, because the component reconciles in the render phase.
 * - US format only (`.` decimal, `,` thousands). A consumer wanting another
 *   format formats upstream.
 * - `place` is scope-local: the integer strip and the decimals strip each count
 *   their own places from 0. They are reconciled independently so a change
 *   confined to one cannot disturb the other.
 *
 * ## updating
 * `reconcileWheels` is the only stateful-looking thing here and it is still
 * pure: `epoch` is supplied by the caller purely to mint unique keys for
 * departing wheels. If you change it to keep already-exiting wheels rather than
 * dropping them, the component's render-phase reconcile stops being safe — read
 * the note there first.
 */

export type ParsedDigits = {
  /** Leading run of non-digit characters, e.g. "$" or "-$". */
  prefix: string;
  integerDigits: string[];
  /** Empty when the value has no decimal separator. */
  decimalsDigits: string[];
  /** Trailing run of non-digit characters, e.g. "M". */
  suffix: string;
};

export type WheelState = {
  /** React key. Stable for a live wheel, unique per departure for an exiting one. */
  key: string;
  /** Place index counting rightward from 0 within its scope. */
  place: number;
  digit: number;
  /** Fading and collapsing to zero width; unmounts when the animation ends. */
  exiting: boolean;
  /** Mounted this change: opens from zero width. Never cleared — see below. */
  entering: boolean;
};

const isDigit = (c: string) => c >= '0' && c <= '9';

/** Peel the leading and trailing non-digit runs off a fragment. */
function peel(fragment: string) {
  let start = 0;
  while (start < fragment.length && !isDigit(fragment[start])) start++;
  let end = fragment.length;
  while (end > start && !isDigit(fragment[end - 1])) end--;
  return {
    lead: fragment.slice(0, start),
    digits: fragment.slice(start, end).split('').filter(isDigit),
    trail: fragment.slice(end),
  };
}

/**
 * The decimal separator is the LAST "." in the string. US format only — a
 * consumer wanting another format formats upstream.
 */
export function parseDigitsString(value: string): ParsedDigits {
  const dot = value.lastIndexOf('.');
  if (dot === -1) {
    const head = peel(value);
    return {
      prefix: head.lead,
      integerDigits: head.digits,
      decimalsDigits: [],
      suffix: head.trail,
    };
  }
  const head = peel(value.slice(0, dot));
  const tail = peel(value.slice(dot + 1));
  return {
    prefix: head.lead,
    integerDigits: head.digits,
    /* No digits after the "." means no decimals group is rendered at all, so
     * "$1,234." shows as "$1,234" rather than a dangling separator. */
    decimalsDigits: tail.digits,
    suffix: tail.trail,
  };
}

/** Key for a wheel currently in the figure. Stable, so the roll keeps identity. */
const liveKey = (place: number) => `p${place}`;

/** Resting set for the initial render. Mount never animates. */
export function restingWheels(digits: string[]): WheelState[] {
  return digits.map((d, i) => {
    const place = digits.length - 1 - i;
    return {
      key: liveKey(place),
      place,
      digit: Number(d),
      exiting: false,
      entering: false,
    };
  });
}

/**
 * Structural pass, run during render when the value changes.
 *
 * - A place that already exists keeps its React identity and simply receives
 *   its new digit — the roll transition does the rest.
 * - A place that is newly needed is created at its FINAL digit and marked
 *   `entering`, which opens its slot from zero width. It is created at the real
 *   digit rather than at 0 because a wheel that opens AND rolls at the same
 *   time reads as a smear; the roll belongs to wheels already on screen.
 * - A place that is no longer needed is kept with `exiting` and its CURRENT
 *   digit — not 0. It collapses where it stands; rolling a departing wheel to
 *   zero on the way out was the goofy part.
 * - Wheels already exiting are DROPPED up front. A new value supersedes an
 *   in-flight exit, which is also what makes a wheel stranded by a throttled
 *   background tab self-heal instead of persisting as a phantom. It is what
 *   makes reconciling in the render phase safe, too: the pass never depends on
 *   the exit lifecycle having completed.
 * - `entering` is never cleared. The flag drives a CSS animation that runs once
 *   on mount; a finished animation leaves the element at its natural style, and
 *   re-rendering an identical attribute does not restart it. Clearing it would
 *   need the frame-scheduling this design exists to delete.
 *
 * `epoch` only mints keys. A departing wheel must not share a key with a live
 * wheel at the same place, or React reuses the node and a place that leaves and
 * immediately returns cannot replay its entrance.
 *
 * Returned array is sorted by descending place — left-to-right visual order.
 */
export function reconcileWheels(
  prev: WheelState[],
  digits: string[],
  epoch: number,
): WheelState[] {
  const byPlace = new Map<number, WheelState>();
  for (const w of prev) {
    if (!w.exiting) byPlace.set(w.place, w);
  }

  const next: WheelState[] = [];
  const n = digits.length;
  for (let i = 0; i < n; i++) {
    const place = n - 1 - i;
    next.push({
      key: liveKey(place),
      place,
      digit: Number(digits[i]),
      exiting: false,
      entering: !byPlace.has(place),
    });
    byPlace.delete(place);
  }
  for (const w of byPlace.values()) {
    next.push({
      key: `x${w.place}-${epoch}`,
      place: w.place,
      digit: w.digit,
      exiting: true,
      entering: false,
    });
  }

  next.sort((a, b) => b.place - a.place);
  return next;
}

/**
 * Whether the wheel at `place` carries a TRAILING grouping separator.
 *
 * A pure function of the place alone — places 3, 6, 9 always do — which is why
 * the comma belongs to a wheel rather than sitting between two of them. Owning
 * it means a departing wheel takes its comma with it: $1,000 -> $999 collapses
 * both together instead of leaving the comma to pop out of existence. The
 * previous version counted live wheels to decide where separators fell, which
 * could not express that at all.
 */
export function hasTrailingSeparator(place: number): boolean {
  return place > 0 && place % 3 === 0;
}
