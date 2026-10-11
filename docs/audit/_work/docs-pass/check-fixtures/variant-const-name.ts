// Fixture: variant constants named *Type. One violation: FixtureType.
// Not reported: *Variant, and DropdownMenuSelectType (the const for the
// sanctioned `selectType` prop).
export const FixtureType = { a: "a" } as const;
export const FixtureVariant = { a: "a" } as const;
export const DropdownMenuSelectType = { single: "single", multi: "multi" } as const;
