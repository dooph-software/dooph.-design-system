"use client";
// Fixture: "use client" outside the allowlist, behind a byte-order mark. One
// violation: the directive still counts although the file starts with a BOM.
import { useState } from "react";
export function UseClientBom() {
  const [v] = useState(0);
  return <span>{v}</span>;
}
