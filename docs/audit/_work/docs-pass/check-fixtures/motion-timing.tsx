// Fixture: motion timing literals outside tokens.css. One violation: duration-200.
// A comment may say duration-300, ease-in-out or 250ms; comments are stripped.
export function MotionTiming() {
  return <div className="transition-opacity duration-200" />;
}
