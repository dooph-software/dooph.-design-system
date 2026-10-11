// Fixture: var() in SVG geometry attributes. One violation: <rect width="var(--...)">.
// Not reported: a `width` PROP on a component (DropdownMenuSection in a story),
// a numeric attribute, and var() through style.
declare function DropdownMenuSection(props: { width?: string; children?: unknown }): null;
export function SvgVarAttribute() {
  return (
    <>
      <DropdownMenuSection width="var(--ui-min-w-menu)">x</DropdownMenuSection>
      <svg width="24" height="24" style={{ width: "var(--ui-icon-md)" }}>
        <rect width="var(--ui-icon-md)" height="4" />
      </svg>
    </>
  );
}
