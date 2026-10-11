// Fixture: motion timing literals outside tokens.css, an underscore-separated
// bracket value. One violation: .2s in transition-[opacity_.2s].
// Not reported: a bracket value with no time in it (grid-cols-[1fr_2fr]).
export function MotionUnderscore() {
  return <div className="transition-[opacity_.2s] grid-cols-[1fr_2fr]" />;
}
