// Fixture: Tailwind variant on a DS package class. One violation: hover:ds-disabled-state.
// Not reported: the bare package class, and a variant on a Tailwind utility.
export function VariantOnPackageClass() {
  return <div className="ds-disabled-state hover:bg-primary hover:ds-disabled-state" />;
}
