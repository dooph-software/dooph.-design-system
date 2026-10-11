// Fixture: JS timers and animation loops outside the allowlist. One violation.
// Not reported: a timer named in a comment, setTimeout(300), or a type that mentions one.
export type Handle = ReturnType<typeof setTimeout>;
export function startLoop(step: () => void) {
  return requestAnimationFrame(step);
}
