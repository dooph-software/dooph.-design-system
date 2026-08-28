// Server-safe pure selection logic — no client APIs, intentionally NO "use client".
//
// The interaction model is RESTART ON CLICK (research doc §10.3): with a range
// committed, the next click anchors a brand-new range and the one after it
// completes. One rule, no discoverable gestures, every selection two clicks.
// Nearest-edge adjustment was evaluated and rejected: it cannot relocate a
// range to a distant window, because no rule based on a single click's
// position can both extend outward in one click and relocate in two.

import type { DateRange } from "./constants";
import { isSameDay, startOfDay } from "./dateUtils";

export type RangeClickResult =
  | { kind: "pending"; anchor: Date }
  | { kind: "commit"; range: DateRange };

/**
 * `onChange` must fire only for a "commit" result. A "pending" result leaves
 * the consumer's committed value untouched, so an incomplete range is never
 * emitted and never rendered.
 */
export function resolveRangeClick(
  clicked: Date,
  pendingAnchor: Date | null,
): RangeClickResult {
  const day = startOfDay(clicked);
  if (!pendingAnchor) {
    return { kind: "pending", anchor: day };
  }
  return { kind: "commit", range: previewRange(pendingAnchor, day) };
}

/** Orders two days into a range. Also drives the hover preview while pending. */
export function previewRange(anchor: Date, hovered: Date): DateRange {
  const a = startOfDay(anchor);
  const b = startOfDay(hovered);
  return a.getTime() <= b.getTime() ? { from: a, to: b } : { from: b, to: a };
}

export type DayRangePosition = "none" | "start" | "middle" | "end" | "single";

/** Drives the band rounding in CalendarGrid — see the layer model in Task 9. */
export function getDayRangePosition(
  day: Date,
  range: DateRange | null,
): DayRangePosition {
  if (!range) return "none";

  const time = startOfDay(day).getTime();
  const from = startOfDay(range.from).getTime();
  const to = startOfDay(range.to).getTime();

  if (time < from || time > to) return "none";
  if (isSameDay(range.from, range.to)) return "single";
  if (time === from) return "start";
  if (time === to) return "end";
  return "middle";
}
