// Fixture: motion timing literals outside tokens.css, an inline-style seconds
// value. One violation: "0.3s". Not reported: the motion-scale var().
export function MotionInline() {
  return (
    <div
      style={{
        transitionDuration: "0.3s",
        transitionTimingFunction: "var(--ui-motion-ease-standard)",
      }}
    />
  );
}
