// Fixture: numeric Tailwind spacing, a logical (start/end) prefix. One
// violation: ps-2. Not reported: a zero reset (me-0) and a DS scale name (pe-md).
import { cn } from "../../src/utils/cn";
export function NumericLogical() {
  return <div className={cn("ps-2", "me-0", "pe-md")} />;
}
