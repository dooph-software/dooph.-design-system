// Fixture: JS timers outside the allowlist, extra call site. One violation:
// allowlists.json records one call site here, but the file now has two.
export function twoTimers(fn: () => void) {
  setTimeout(fn, 1000);
  return setInterval(fn, 1000);
}
