// Fixture: typography utilities or inline font styles. One violation: font-bold.
// Not reported: colour utilities that share the text- prefix.
export function TypographyUtility() {
  return <span className="font-bold text-text text-text-secondary">x</span>;
}
