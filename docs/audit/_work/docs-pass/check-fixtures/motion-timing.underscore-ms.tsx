// Fixture: motion timing literals outside tokens.css, an underscore-separated
// millisecond value. One violation: 200ms in transition-[transform_200ms].
export function MotionUnderscoreMs() {
  return <div className="transition-[transform_200ms]" />;
}
