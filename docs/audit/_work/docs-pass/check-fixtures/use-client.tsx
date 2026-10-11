// Fixture: "use client" outside the allowlist. One violation: this file is not listed.
"use client";
import { useState } from "react";
export function UseClient() {
  const [v] = useState(0);
  return <span>{v}</span>;
}
