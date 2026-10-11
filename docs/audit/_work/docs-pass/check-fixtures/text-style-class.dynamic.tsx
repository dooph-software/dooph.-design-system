// Fixture: text-style classes outside Text components, a name built in a
// template literal. One violation: `text-style-${role}`.
export function TextStyleDynamic({ role }: { role: string }) {
  return <span className={`text-style-${role}`}>x</span>;
}
