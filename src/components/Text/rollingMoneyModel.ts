/*
 * RollingMoneyText — pure model. No React, no DOM, no "use client".
 *
 * Two jobs:
 *   1. Split a US-formatted money string into prefix / integer digits / cents
 *      digits / suffix. Thousands separators are DISCARDED here and re-derived
 *      at render time, so a separator can never be diffed against a digit.
 *   2. Reconcile the previous wheel set against a new digit string, keyed by
 *      PLACE VALUE counting rightward — never by string index. Index-from-left
 *      matching is what made $982.10 -> $1,240.00 compare the tens digit
 *      against a comma and refuse to animate.
 */

export type ParsedMoney = {
  /** Leading run of non-digit characters, e.g. "$" or "-$". */
  prefix: string;
  integerDigits: string[];
  /** Empty when the value has no decimal separator. */
  centsDigits: string[];
  /** Trailing run of non-digit characters, e.g. "M". */
  suffix: string;
};

export type WheelState = {
  /** Place index counting rightward from 0 within its scope. The React key. */
  place: number;
  digit: number;
  /** Rolling to 0 and fading out; unmounts when the fade ends. */
  exiting: boolean;
};

const isDigit = (c: string) => c >= "0" && c <= "9";

/** Peel the leading and trailing non-digit runs off a fragment. */
function peel(fragment: string) {
  let start = 0;
  while (start < fragment.length && !isDigit(fragment[start])) start++;
  let end = fragment.length;
  while (end > start && !isDigit(fragment[end - 1])) end--;
  return {
    lead: fragment.slice(0, start),
    digits: fragment.slice(start, end).split("").filter(isDigit),
    trail: fragment.slice(end),
  };
}

/**
 * The decimal separator is the LAST "." in the string. US format only — see the
 * spec's non-goals; a consumer wanting another format formats upstream.
 */
export function parseMoney(value: string): ParsedMoney {
  const dot = value.lastIndexOf(".");
  if (dot === -1) {
    const head = peel(value);
    return {
      prefix: head.lead,
      integerDigits: head.digits,
      centsDigits: [],
      suffix: head.trail,
    };
  }
  const head = peel(value.slice(0, dot));
  const tail = peel(value.slice(dot + 1));
  return {
    prefix: head.lead,
    integerDigits: head.digits,
    /* No digits after the "." means no cents group is rendered at all, so
     * "$1,234." shows as "$1,234" rather than a dangling separator. */
    centsDigits: tail.digits,
    suffix: tail.trail,
  };
}

/** Resting set for the initial render. Mount never animates. */
export function restingWheels(digits: string[]): WheelState[] {
  return digits.map((d, i) => ({
    place: digits.length - 1 - i,
    digit: Number(d),
    exiting: false,
  }));
}

/**
 * Structural pass, run synchronously when the value changes.
 *
 * - A place that already exists keeps its React identity and simply receives
 *   its new digit — the transition does the rest.
 * - A place that is newly needed is created at 0 and reported in `pending`, so
 *   the caller can retarget it on the next frame once the browser has painted
 *   a from-state. That is the "wheel turns off zero" behavior.
 * - A place that is no longer needed is kept one more render at 0 with
 *   `exiting: true` so it can roll out and fade.
 * - Wheels already exiting are dropped up front: a new value supersedes an
 *   in-flight exit, which also means a stuck wheel self-heals on the next
 *   change rather than persisting as a phantom leading zero.
 *
 * Returned array is sorted by descending place — left-to-right visual order.
 */
export function reconcileWheels(
  prev: WheelState[],
  digits: string[],
): { next: WheelState[]; pending: Map<number, number> } {
  const pending = new Map<number, number>();
  const byPlace = new Map<number, WheelState>();
  for (const w of prev) {
    if (!w.exiting) byPlace.set(w.place, w);
  }

  const next: WheelState[] = [];
  const n = digits.length;
  for (let i = 0; i < n; i++) {
    const place = n - 1 - i;
    const digit = Number(digits[i]);
    if (byPlace.has(place)) {
      next.push({ place, digit, exiting: false });
    } else {
      next.push({ place, digit: 0, exiting: false });
      pending.set(place, digit);
    }
    byPlace.delete(place);
  }
  for (const w of byPlace.values()) {
    next.push({ place: w.place, digit: 0, exiting: true });
  }

  next.sort((a, b) => b.place - a.place);
  return { next, pending };
}

/**
 * Whether a thousands separator precedes the wheel at `index` in a
 * descending-place array. Counts only non-exiting wheels, so a fading wheel
 * off the left edge does not shift the grouping of the live digits.
 */
export function separatorBefore(wheels: WheelState[], index: number): boolean {
  if (index < 0 || index >= wheels.length) return false;
  const live = wheels.reduce((acc, w) => acc + (w.exiting ? 0 : 1), 0);
  let seen = 0;
  for (let i = 0; i < index; i++) {
    if (!wheels[i].exiting) seen++;
  }
  if (wheels[index].exiting || seen === 0) return false;
  return (live - seen) % 3 === 0;
}
