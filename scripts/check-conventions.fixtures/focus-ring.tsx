// Fixture: hand-rolled focus rings. One violation: focus-visible:ring-2.
// Not reported: the shared ds-focus-visible-ring helper.
export function FocusRing() {
  return <button className="ds-focus-visible-ring focus-visible:ring-2" />;
}
