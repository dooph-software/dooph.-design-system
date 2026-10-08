import React from "react";
import { createRoot } from "react-dom/client";
import {
  Sticker, TextDropdownTrigger, CheckIcon,
  Table, TableHeader, TableHeaderCell, TableRow, TableCell, TableSortDirection,
} from "@dooph-software/design-system";

function App() {
  return (
    <div style={{ padding: 16 }}>
      <div id="st" style={{ padding: 8 }}><Sticker><CheckIcon /> Verified</Sticker></div>
      <div id="st2" style={{ padding: 8 }}><Sticker><CheckIcon /> Verified</Sticker></div>
      <div id="td" style={{ padding: 8 }}><TextDropdownTrigger>Sort by <b>Name</b></TextDropdownTrigger></div>
      <div id="td2" style={{ padding: 8 }}><TextDropdownTrigger>Sort by <b>Name</b></TextDropdownTrigger></div>
      <div id="td3" style={{ padding: 8 }}><TextDropdownTrigger>Plain</TextDropdownTrigger></div>
      <div id="td4" style={{ padding: 8 }}><TextDropdownTrigger>Plain</TextDropdownTrigger></div>
      <div id="tb">
        <Table columns="1fr 1fr">
          <TableHeader>
            <TableHeaderCell sortDirection={TableSortDirection.ascend} onSort={() => {}}>Name</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
          </TableHeader>
          <TableRow><TableCell>Ada</TableCell><TableCell>Eng</TableCell></TableRow>
        </Table>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
