// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

/**
 * Dot-accessible Input variants, mirroring Figma's `Input` component 1:1.
 * Usage: <Input variant={InputVariant.iconNumber} icon={<HashIcon />} />
 *
 * text       — body text, fills its container (the default)
 * number     — mono figures, left-aligned; fills its container like `text`
 *              (never narrower than a square). `autoWidth` hugs the value.
 * iconText   — `text` with a leading icon (requires `icon`)
 * iconNumber — `number` with a leading icon (requires `icon`)
 */
export const InputVariant = {
  text: "text",
  number: "number",
  iconText: "icon-text",
  iconNumber: "icon-number",
} as const;
export type InputVariant = (typeof InputVariant)[keyof typeof InputVariant];
