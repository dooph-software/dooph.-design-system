// Fixture: raw var(--ui-*) in className brackets or (--ui-*) shorthand, the
// Tailwind v4 parenthesis shorthand. One violation: p-(--ui-spacing-md).
// Not reported: the theme utility (p-md), and a consumer's own variable.
export function RawUiVarShorthand() {
  return <div className="p-(--ui-spacing-md) p-md w-(--my-width)" />;
}
