// No "use client": no hooks, and onSort is a consumer-supplied passthrough.
// Neutral module — it renders in either graph. It may import client components
// (Button); that is normal composition, not a client boundary for this file.
import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { Button, type ButtonProps } from "../Button/Button";
import { ButtonSize, ButtonVariant } from "../Button/constants";
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from "../Icons";
import { ButtonText } from "../Text";
import { TableSortDirection } from "./constants";

/* ── Table ─────────────────────────────────────────────────────────────── */

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  columns: string;
  rowHeight?: string;
}

const Table = forwardRef<HTMLDivElement, TableProps>(
  ({ className, columns, rowHeight, style, ...props }, ref) => (
    <div
      ref={ref}
      role="table"
      className={cn(
        "flex flex-col w-full border border-border-primary rounded-normal",
        className,
      )}
      style={
        {
          "--table-cols": columns,
          ...(rowHeight ? { "--table-row-height": rowHeight } : {}),
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  ),
);
Table.displayName = "Table";

/* ── TableHeader ───────────────────────────────────────────────────────── */

const TableHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      role="row"
      className={cn("grid border-b border-border-primary py-sm px-xxs", className)}
      style={{ gridTemplateColumns: "var(--table-cols)", ...style }}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

/* ── TableHeaderCell ───────────────────────────────────────────────────── */

export interface TableHeaderCellProps extends HTMLAttributes<HTMLDivElement> {
  sortDirection?: TableSortDirection;
  onSort?: () => void;
  /** Props for the sort button (sortable headers only): `aria-*`, `id`,
   *  `onKeyDown`, `className`, … The click is always `onSort`, and the
   *  header owns the button's `variant`/`size`. */
  buttonProps?: Omit<
    ButtonProps,
    "children" | "onClick" | "asChild" | "variant" | "size"
  >;
}

/* TableSortDirection values are not ARIA tokens; this is the translation. */
const ARIA_SORT = {
  [TableSortDirection.none]: "none",
  [TableSortDirection.ascend]: "ascending",
  [TableSortDirection.descend]: "descending",
} as const;

const SortIcon = ({ direction }: { direction: TableSortDirection }) => {
  if (direction === TableSortDirection.ascend) return <ChevronUpIcon />;
  if (direction === TableSortDirection.descend) return <ChevronDownIcon />;
  return <ChevronsUpDownIcon />;
};

const TableHeaderCell = forwardRef<HTMLDivElement, TableHeaderCellProps>(
  ({ className, sortDirection, onSort, buttonProps, children, ...props }, ref) => {
    if (sortDirection !== undefined) {
      return (
        <div
          ref={ref}
          role="columnheader"
          aria-sort={ARIA_SORT[sortDirection]}
          className={cn("flex items-center", className)}
          {...props}
        >
          <Button
            variant={ButtonVariant.text}
            size={ButtonSize.standard}
            {...buttonProps}
            className={cn(
              "w-full justify-start gap-xxs text-text",
              buttonProps?.className,
            )}
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
        role="columnheader"
        className={cn("flex items-center px-md py-sm", className)}
        {...props}
      >
        <ButtonText>{children}</ButtonText>
      </div>
    );
  },
);
TableHeaderCell.displayName = "TableHeaderCell";

/* ── TableRow ──────────────────────────────────────────────────────────── */

const TableRow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      role="row"
      className={cn(
        "grid border-border-primary",
        "not-last:border-b",
        "hover:bg-ghost-hover ds-motion-state",
        className,
      )}
      style={{
        gridTemplateColumns: "var(--table-cols)",
        height: "var(--table-row-height, auto)",
        ...style,
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
      role="cell"
      className={cn(
        "flex flex-col justify-center overflow-hidden px-lg py-md",
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
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    role="row"
    className={cn("flex flex-1 items-center justify-center py-table-placeholder-y", className)}
    {...props}
  >
    {/* A row must own cells; `contents` keeps the flex centring unchanged. */}
    <div role="cell" className="contents">
      {children}
    </div>
  </div>
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
