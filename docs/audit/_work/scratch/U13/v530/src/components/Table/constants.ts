// Server-safe constants — no "use client" so React Server Components can read
// these values. Re-exported via index.ts; Table.tsx imports them.

export const TableSortDirection = {
  none: "none",
  ascend: "ascend",
  descend: "descend",
} as const;
export type TableSortDirection =
  (typeof TableSortDirection)[keyof typeof TableSortDirection];
