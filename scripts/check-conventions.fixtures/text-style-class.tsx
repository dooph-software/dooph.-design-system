// Fixture: text-style classes outside Text components. One violation.
// A header contract may name text-style-body here; comments are stripped.
/* Nor is text-style-label in a block comment reported. */
export function TextStyleClass() {
  return <span className="text-style-body">x</span>;
}
