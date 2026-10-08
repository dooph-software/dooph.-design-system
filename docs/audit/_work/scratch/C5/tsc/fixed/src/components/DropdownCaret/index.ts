// probe stub
export const DropdownCaretVariant = { dropdown: "dropdown", typeable: "typeable" } as const;
export type DropdownCaretVariant = (typeof DropdownCaretVariant)[keyof typeof DropdownCaretVariant];
export const DropdownCaret = (_p: { variant?: DropdownCaretVariant }) => null;
