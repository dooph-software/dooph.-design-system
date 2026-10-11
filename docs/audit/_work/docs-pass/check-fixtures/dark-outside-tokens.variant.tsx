// Fixture: dark-mode rules or hex colours outside tokens.css, a dark: variant
// in a class string. One violation: dark:bg-primary. Not reported: an object
// key named dark (`dark: "…"`).
export const PAINT = { light: "a", dark: "b" };
export function DarkVariant() {
  return <div className="bg-secondary dark:bg-primary" />;
}
