// Fixture: hand-rolled disabled looks. One violation: disabled:cursor-not-allowed.
// Not reported: the ds-disabled-state helper, and the disabled:opacity-100 reset
// that cancels a double fade on a nested control.
export function DisabledLook() {
  return (
    <button className="ds-disabled-state disabled:opacity-100 disabled:cursor-not-allowed" />
  );
}
