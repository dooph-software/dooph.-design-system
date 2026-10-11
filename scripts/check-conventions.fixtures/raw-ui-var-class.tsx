// Fixture: raw var(--ui-*) in className brackets or (--ui-*) shorthand. One violation.
// Not reported: the theme utility, and var() in an inline style.
export function RawUiVarClass() {
  return (
    <div
      className="bg-[var(--ui-color-primary)] bg-primary"
      style={{ width: "var(--ui-size-avatar)" }}
    />
  );
}
