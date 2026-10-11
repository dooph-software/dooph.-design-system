// Fixture: motion timing literals outside tokens.css, a Tailwind delay. One
// violation: delay-150. Not reported: a ds-* helper whose name contains -delay-.
import { cn } from "../../src/utils/cn";
export function MotionDelay() {
  return <div className={cn("ds-motion-delay-in", "delay-150")} />;
}
