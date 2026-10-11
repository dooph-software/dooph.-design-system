// Fixture: "use client" outside the allowlist, stale reason. One violation:
// allowlists.json says this file needs useState, but it no longer uses it.
"use client";
export function ReasonGone() {
  return null;
}
