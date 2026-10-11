// Fixture: Tailwind default radii and shadows, multi-line class string. One
// violation: `rounded` at the end of a line inside a template literal.
// Not reported: `rounded` as an object key or an argument.
export const options = { rounded: true };
export function pick(rounded: boolean) {
  return rounded
    ? `
      px-md
      rounded
    `
    : "";
}
