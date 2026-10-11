// Support file: listed in allowlists.json with one call site, and still true.
export function revert(fn: () => void) {
  return setTimeout(fn, 1000);
}
