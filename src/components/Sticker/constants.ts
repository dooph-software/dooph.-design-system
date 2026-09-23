// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible sticker variants.
 * Usage: <Sticker variant={StickerVariant.prominent} />
 *
 * A variant selects a pair of paints — the content colour and the wash behind
 * it. They are not the same hue for every variant: secondary washes the
 * secondary button's active border, and danger washes danger-secondary while
 * its content is danger-primary. The wash alpha is `--ui-sticker-bg-opacity`
 * (20%), except the light secondary wash, which uses
 * `--ui-sticker-bg-opacity-secondary`.
 *
 * `custom` has no palette of its own and REQUIRES `color`. The content is that
 * colour and the wash is the same colour at `--ui-sticker-bg-opacity`. The
 * requirement is enforced twice — `StickerProps` is a discriminated union, so
 * omitting `color` is a compile error, and `Sticker` throws if the value
 * arrives anyway (a JavaScript consumer, or a `variant` computed at runtime).
 */
export const StickerVariant = {
  prominent: "prominent",
  alternate: "alternate",
  secondary: "secondary",
  tertiary: "tertiary",
  danger: "danger",
  custom: "custom",
} as const;
export type StickerVariant = (typeof StickerVariant)[keyof typeof StickerVariant];
