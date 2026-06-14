import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { BodyText, ButtonText } from "../Text/BaseText";
import {
  Table,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TablePlaceholder,
  TableRow,
  TableSortDirection,
} from "./Table";

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const COLUMNS = "140px 130px 110px 1fr 170px";

/* ── Full composed table ───────────────────────────────────────────────── */

const SortableHeader = () => {
  const cycle = (d: TableSortDirection): TableSortDirection => {
    if (d === TableSortDirection.none) return TableSortDirection.ascend;
    if (d === TableSortDirection.ascend) return TableSortDirection.descend;
    return TableSortDirection.none;
  };

  const [sort, setSort] = useState<TableSortDirection>(TableSortDirection.none);

  return (
    <Table
      columns={COLUMNS}
      className="h-[420px] border border-border rounded-soft"
    >
      <TableHeader>
        <TableHeaderCell
          sortDirection={sort}
          onSort={() => setSort((s) => cycle(s))}
        >
          Name
        </TableHeaderCell>
        <TableHeaderCell>
          <ButtonText>Status</ButtonText>
        </TableHeaderCell>
        <TableHeaderCell>
          <ButtonText>Role</ButtonText>
        </TableHeaderCell>
        <TableHeaderCell>
          <ButtonText>Email</ButtonText>
        </TableHeaderCell>
        <TableHeaderCell>
          <ButtonText>Joined</ButtonText>
        </TableHeaderCell>
      </TableHeader>

      <TableRow>
        <TableCell>
          <BodyText>Alice Park</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>Active</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>Admin</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>alice@example.com</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>Jan 12, 2025</BodyText>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell>
          <div>
            <BodyText>Bob Chen</BodyText>
            <BodyText className="text-text-secondary">Engineering</BodyText>
          </div>
        </TableCell>
        <TableCell>
          <BodyText>Invited</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>Member</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>bob@example.com</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>Mar 4, 2025</BodyText>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell>
          <div>
            <BodyText>Carol Wu</BodyText>
            <BodyText className="text-text-secondary">Design</BodyText>
          </div>
        </TableCell>
        <TableCell>
          <BodyText>Active</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>Viewer</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>carol@example.com</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>May 20, 2025</BodyText>
        </TableCell>
      </TableRow>

      <TablePlaceholder>
        <BodyText className="text-text-tertiary">End of list</BodyText>
      </TablePlaceholder>
    </Table>
  );
};

export const Default: Story = {
  args: { columns: COLUMNS },
  render: () => <SortableHeader />,
};

/* ── TableHeader ───────────────────────────────────────────────────────── */

export const Header: Story = {
  args: { columns: "1fr 1fr 1fr" },
  render: () => (
    <Table columns="1fr 1fr 1fr">
      <TableHeader>
        <TableHeaderCell>
          <BodyText>Column A</BodyText>
        </TableHeaderCell>
        <TableHeaderCell>
          <BodyText>Column B</BodyText>
        </TableHeaderCell>
        <TableHeaderCell>
          <BodyText>Column C</BodyText>
        </TableHeaderCell>
      </TableHeader>
    </Table>
  ),
};

/* ── TableHeaderCell — sort states ─────────────────────────────────────── */

export const HeaderCellSortStates: Story = {
  args: { columns: "1fr 1fr 1fr" },
  render: () => (
    <Table columns="1fr 1fr 1fr">
      <TableHeader>
        <TableHeaderCell
          sortDirection={TableSortDirection.none}
          onSort={() => {}}
        >
          Unsorted
        </TableHeaderCell>
        <TableHeaderCell
          sortDirection={TableSortDirection.ascend}
          onSort={() => {}}
        >
          Ascending
        </TableHeaderCell>
        <TableHeaderCell
          sortDirection={TableSortDirection.descend}
          onSort={() => {}}
        >
          Descending
        </TableHeaderCell>
      </TableHeader>
    </Table>
  ),
};

/* ── TableRow — hover behaviour ────────────────────────────────────────── */

export const Rows: Story = {
  args: { columns: "1fr 1fr" },
  render: () => (
    <Table columns="1fr 1fr">
      <TableHeader>
        <TableHeaderCell>
          <ButtonText>Name</ButtonText>
        </TableHeaderCell>
        <TableHeaderCell>
          <ButtonText>Value</ButtonText>
        </TableHeaderCell>
      </TableHeader>
      <TableRow>
        <TableCell>
          <BodyText>Row one</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>100</BodyText>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <BodyText>Row two</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>200</BodyText>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <BodyText>Row three</BodyText>
        </TableCell>
        <TableCell>
          <BodyText>300</BodyText>
        </TableCell>
      </TableRow>
    </Table>
  ),
};

/* ── TableCell — stacked content ───────────────────────────────────────── */

export const CellStackedContent: Story = {
  args: { columns: "1fr 1fr" },
  render: () => (
    <Table columns="1fr 1fr">
      <TableHeader>
        <TableHeaderCell>
          <BodyText>Person</BodyText>
        </TableHeaderCell>
        <TableHeaderCell>
          <BodyText>Contact</BodyText>
        </TableHeaderCell>
      </TableHeader>
      <TableRow>
        <TableCell>
          <div>
            <BodyText>Dana Lee</BodyText>
            <BodyText className="text-text-secondary">Product</BodyText>
          </div>
        </TableCell>
        <TableCell>
          <div>
            <BodyText>dana@example.com</BodyText>
            <BodyText className="text-text-secondary">+1 555-0123</BodyText>
          </div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <div>
            <BodyText>Evan Ruiz</BodyText>
            <BodyText className="text-text-secondary">Engineering</BodyText>
          </div>
        </TableCell>
        <TableCell>
          <div>
            <BodyText>evan@example.com</BodyText>
            <BodyText className="text-text-secondary">+1 555-0456</BodyText>
          </div>
        </TableCell>
      </TableRow>
    </Table>
  ),
};

/* ── TablePlaceholder — empty / end-of-list states ─────────────────────── */

export const Placeholder: Story = {
  args: { columns: "1fr 1fr" },
  render: () => (
    <Table columns="1fr 1fr" className="h-[300px]">
      <TableHeader>
        <TableHeaderCell>
          <BodyText>Name</BodyText>
        </TableHeaderCell>
        <TableHeaderCell>
          <BodyText>Status</BodyText>
        </TableHeaderCell>
      </TableHeader>
      <TablePlaceholder>
        <BodyText className="text-text-tertiary">No results found</BodyText>
      </TablePlaceholder>
    </Table>
  ),
};
