// Fixture: text-style classes outside Text components, a name built by string
// concatenation. One violation: "text-style-" + role.
export function TextStyleConcat({ role }: { role: string }) {
  return <span className={"text-style-" + role}>x</span>;
}
