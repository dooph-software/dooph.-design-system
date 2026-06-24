"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../Button/Button";
import { ButtonSize, ButtonVariant } from "../Button/constants";
import { ChevronDownIcon } from "../Icons/ChevronDownIcon";
import { ChevronsUpDownIcon } from "../Icons/ChevronsUpDownIcon";
import { ChevronUpIcon } from "../Icons/ChevronUpIcon";
import { ButtonText } from "../Text/BaseText";

export const TableSortDirection = {
  none: "none",
  ascend: "ascend",
  descend: "descend",
} as const;
export type TableSortDirection =
  (typeof TableSortDirection)[keyof typeof TableSortDirection];

/* ── Table ─────────────────────────────────────────────────────────────── */

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  columns: string;
  rowHeight?: string;
}

const Table = forwardRef<HTMLDivElement, TableProps>(
  ({ className, columns, rowHeight, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col w-full border border-border rounded-standard",
        className,
      )}
      style={
        {
          "--table-cols": columns,
          ...(rowHeight ? { "--table-row-height": rowHeight } : {}),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  ),
);
Table.displayName = "Table";

/* ── TableHeader ───────────────────────────────────────────────────────── */

const TableHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid border-b border-border py-xs px-xxs", className)}
      style={{ gridTemplateColumns: "var(--table-cols)" }}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

/* ── TableHeaderCell ───────────────────────────────────────────────────── */

export interface TableHeaderCellProps extends HTMLAttributes<HTMLDivElement> {
  sortDirection?: TableSortDirection;
  onSort?: () => void;
}

const SortIcon = ({ direction }: { direction: TableSortDirection }) => {
  if (direction === TableSortDirection.ascend) return <ChevronUpIcon />;
  if (direction === TableSortDirection.descend) return <ChevronDownIcon />;
  return <ChevronsUpDownIcon />;
};

const TableHeaderCell = forwardRef<HTMLDivElement, TableHeaderCellProps>(
  ({ className, sortDirection, onSort, children, ...props }, ref) => {
    if (sortDirection !== undefined) {
      return (
        <div
          ref={ref}
          className={cn("flex items-center", className)}
          {...props}
        >
          <Button
            variant={ButtonVariant.text}
            size={ButtonSize.default}
            className="w-full justify-start gap-1 text-text-primary"
            onClick={onSort}
          >
            <ButtonText>{children}</ButtonText>
            <SortIcon direction={sortDirection} />
          </Button>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center px-rg py-xs", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TableHeaderCell.displayName = "TableHeaderCell";

/* ── TableRow ──────────────────────────────────────────────────────────── */

const TableRow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid border-b border-border",
        "not-last:border-b",
        "hover:bg-ghost-hover transition-colors duration-100",
        className,
      )}
      style={{
        gridTemplateColumns: "var(--table-cols)",
        height: "var(--table-row-height, auto)",
      }}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

/* ── TableCell ─────────────────────────────────────────────────────────── */

const TableCell = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col justify-center overflow-hidden px-4 py-3",
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

/* ── TablePlaceholder ──────────────────────────────────────────────────── */

const TablePlaceholder = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 items-center justify-center py-8", className)}
    {...props}
  />
));
TablePlaceholder.displayName = "TablePlaceholder";

export {
  Table,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TablePlaceholder,
  TableRow,
};
