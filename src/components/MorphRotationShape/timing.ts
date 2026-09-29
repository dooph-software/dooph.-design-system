/** A CSS time. Numbers are milliseconds. */
export type CssTime = number | `${number}ms` | `${number}s`;

export interface MorphRotationShapeStepTiming {
  /** Length of one step. Overrides --ui-shape-morph-duration. */
  duration?: CssTime;
  /** Any CSS easing. Overrides --ui-shape-morph-ease (the generated spring). */
  ease?: string;
}

export interface MorphRotationShapeAutoplayTiming extends MorphRotationShapeStepTiming {
  /** Time between step starts. Overrides --ui-shape-morph-interval. */
  interval?: CssTime;
  /** One passive revolution. Overrides --ui-shape-morph-passive-spin-duration. */
  passiveSpinDuration?: CssTime;
}

const toTime = (v: CssTime) => (typeof v === "number" ? `${v}ms` : v);

/** `timing` prop -> inline custom properties, which beat the tokens for this instance. */
export function timingVars(timing?: MorphRotationShapeAutoplayTiming): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!timing) return vars;
  if (timing.duration !== undefined) vars["--ui-shape-morph-duration"] = toTime(timing.duration);
  if (timing.ease !== undefined) vars["--ui-shape-morph-ease"] = timing.ease;
  if (timing.interval !== undefined) vars["--ui-shape-morph-interval"] = toTime(timing.interval);
  if (timing.passiveSpinDuration !== undefined) {
    vars["--ui-shape-morph-passive-spin-duration"] = toTime(timing.passiveSpinDuration);
  }
  return vars;
}
