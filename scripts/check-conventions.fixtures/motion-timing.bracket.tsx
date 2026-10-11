// Fixture: motion timing literals outside tokens.css, a bracketed duration. One
// violation: duration-[0.2s]. Not reported: a word ending in s ("items").
export function MotionBracket() {
  return <div className="transition-opacity duration-[0.2s]" aria-label="3 items" />;
}
