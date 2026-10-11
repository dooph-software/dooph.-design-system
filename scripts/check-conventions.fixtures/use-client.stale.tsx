// Fixture: "use client" outside the allowlist, stale entry. One violation:
// allowlists.json lists this file, but it no longer carries the directive.
export function NoLongerClient() {
  return null;
}
