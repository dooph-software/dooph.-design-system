/** Numbers mean px; strings (any CSS length, incl. `var(--ui-*)` tokens) pass through. */
export const toPxLength = (value: string | number): string =>
  typeof value === "number" ? `${value}px` : value;
