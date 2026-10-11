// Fixture: raw var(--ui-*) in className brackets or (--ui-*) shorthand, the
// shorthand with a type hint. One violation: bg-(color:--ui-color-primary).
export function RawUiVarTyped() {
  return <div className="bg-(color:--ui-color-primary) bg-primary" />;
}
