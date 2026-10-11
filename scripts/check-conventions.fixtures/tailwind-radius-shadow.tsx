// Fixture: Tailwind default radii and shadows. One violation: rounded-md.
// Not reported: DS radius tokens, and the TypeScript word `rounded` used as a
// variable (as in ProgressIndicator/waveGeometry.ts).
export function format(value: number) {
  const rounded = Math.abs(value) < 0.0005 ? 0 : Number(value.toFixed(3));
  return String(rounded);
}
export function TailwindRadius() {
  return <div className="rounded-md rounded-tight rounded-full" />;
}
