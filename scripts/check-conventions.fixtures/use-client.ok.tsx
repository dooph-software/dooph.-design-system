// Support file: listed in allowlists.json and still true. Nothing here may be reported.
"use client";
import { useState } from "react";
export function Listed() {
  const [v] = useState(0);
  return <span>{v}</span>;
}
