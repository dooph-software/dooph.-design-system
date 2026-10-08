// Server-safe constants — no "use client" so RSC code can read them.

export const DropdownCaretVariant = {
  /** DropdownTrigger: squircle closed, pixircle open. */
  dropdown: "dropdown",
  /** TypeableDropdownTrigger: clover closed, puff open. */
  typeable: "typeable",
} as const;
export type DropdownCaretVariant = (typeof DropdownCaretVariant)[keyof typeof DropdownCaretVariant];
