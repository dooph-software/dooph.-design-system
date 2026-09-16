// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible slider color variants.
 * Usage: <SliderStepped variant={SliderVariant.prominent} />
 *
 * A variant selects a BUNDLE of three paints — the default hue, the active
 * track's opacity, and the active step dot's colour — because Figma tunes all
 * three together per variant and they are not derivable from one another (the
 * step dot is composed from the CONTENT paint, not from the track's hue).
 *
 * `color` and `stepColor` then override the hue and the dot independently, on
 * top of whichever bundle is in play.
 *
 * `custom` is the variant with no palette of its own: it carries primary's
 * opacity and step colour as a floor, and REQUIRES `color`. That requirement is
 * enforced twice over — `SliderProps` is a discriminated union, so omitting it
 * is a compile error, and `SliderBase` throws if the value arrives anyway (a
 * JavaScript consumer, or a `variant` computed at runtime).
 */
export const SliderVariant = {
  primary: "primary",
  prominent: "prominent",
  custom: "custom",
} as const;
export type SliderVariant = (typeof SliderVariant)[keyof typeof SliderVariant];
