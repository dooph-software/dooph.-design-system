// Fixture: the expression system. One violation: a component reads an expression token.
// (styles/tokens.css marks --ui-fixture-expr as an expression token.)
export function ExpressionSystem() {
  return <span style={{ transform: "scale(var(--ui-fixture-expr))" }} />;
}
