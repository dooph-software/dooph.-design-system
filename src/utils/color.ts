/* Shared color resolution for components that take a free-form `color` prop
 * (Slider, LinearProgressIndicator).
 *
 * Deliberately server-safe (no "use client") so the token map can be read from
 * RSC code, the same reason the dot-accessible enums live in constants modules.
 *
 * Two accepted shapes, because both are real usage:
 *   color="text"                 -> a DS token name, resolved to its CSS var
 *   color={model.providerColor}  -> any CSS color, passed through untouched
 *
 * Anything not in the map is emitted as-is, so hex, rgb(), oklch(), color-mix(),
 * and a consumer's own `var(--app-*)` all work. The tradeoff is that a typo'd
 * token name ("txt") becomes an invalid CSS color and the declaration is simply
 * dropped by the browser — the type below keeps that to a typo, not a surprise.
 */

/** DS token names accepted by `color`, mapped to the custom property they read. */
export const DS_COLOR_TOKENS = {
  primary: 'var(--ui-color-primary)',
  secondary: 'var(--ui-color-secondary)',
  prominent: 'var(--ui-color-prominent)',
  danger: 'var(--ui-color-danger-primary)',
  'danger-primary': 'var(--ui-color-danger-primary)',
  'danger-secondary': 'var(--ui-color-danger-secondary)',
  text: 'var(--ui-color-text)',
  'text-secondary': 'var(--ui-color-text-secondary)',
  'text-tertiary': 'var(--ui-color-text-tertiary)',
  'border-primary': 'var(--ui-color-border-primary)',
  'border-secondary': 'var(--ui-color-border-secondary)',
  'surface-primary': 'var(--ui-color-surface-primary)',
  'surface-secondary': 'var(--ui-color-surface-secondary)',
  'surface-page': 'var(--ui-color-surface-page)',
  /* The prominent IDENTITY colour (logo tint), distinct from `prominent`
   * above, which is the prominent *button* fill. */
  'prominent-color': 'var(--ui-prominent-color)',
  'prominent-color-alt': 'var(--ui-prominent-color-alt)',
  'prominent-color-ter': 'var(--ui-prominent-color-ter)',
} as const;

export type DsColorToken = keyof typeof DS_COLOR_TOKENS;

/* `(string & {})` keeps the token names in autocomplete without narrowing the
 * type to them — an arbitrary CSS color stays assignable. */
export type DsColor = DsColorToken | (string & {});

/**
 * Resolve a `color` prop to a CSS color value.
 *
 * @param color    Token name, CSS color, or undefined.
 * @param fallback Value used when `color` is undefined.
 */
export const resolveDsColor = (
  color: DsColor | undefined,
  fallback: string,
): string => {
  if (!color) return fallback;
  return DS_COLOR_TOKENS[color as DsColorToken] ?? color;
};
