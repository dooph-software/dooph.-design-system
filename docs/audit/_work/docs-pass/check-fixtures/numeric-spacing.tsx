// Fixture: numeric Tailwind spacing. One violation: p-2.
// Not reported: zero resets (p-0, m-0, gap-0) and DS scale names (px-md, gap-sm).
export function NumericSpacing() {
  return <div className="p-2 p-0 m-0 gap-0 px-md gap-sm" />;
}
