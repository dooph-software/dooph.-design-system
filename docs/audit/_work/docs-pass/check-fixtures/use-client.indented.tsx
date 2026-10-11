// Fixture: "use client" outside the allowlist, indented. One violation: an
// indented directive is still a directive.
  "use client";
import { useState } from "react";
export function UseClientIndented() {
  const [v] = useState(0);
  return <span>{v}</span>;
}
