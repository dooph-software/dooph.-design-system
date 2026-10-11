// Fixture: runtime theme detection. One violation: matchMedia(prefers-color-scheme).
export function useIsDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
