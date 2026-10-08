import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import {
  ToastProvider, useToast, OutlineButton, RollHoverText, BodyText, SplitButton, Sticker, TextDropdownTrigger, CheckIcon, Table, TableHeader, TableHeaderCell, TableRow, TableCell, TableSortDirection,
} from "@dooph-software/design-system";

window.__log = [];
const log = (...a) => { window.__log.push(a.join(" ")); console.log(...a); };

function ToastHarness() {
  const { toast, dismiss } = useToast();
  window.__toast = toast; window.__dismiss = dismiss;
  return null;
}

function App() {
  return (
    <ToastProvider>
      <ToastHarness />
      <div id="ob"><OutlineButton id="OB" className="CONSUMER-CLASS" style={{ outline: "2px solid red" }} data-x="1"
        onMouseMove={() => { window.__consumerMove = (window.__consumerMove || 0) + 1; }}>Find anything</OutlineButton></div>
      <div id="ob2"><OutlineButton id="OB2">Control</OutlineButton></div>
      <div id="rh"><BodyText>Inline in a paragraph hover <RollHoverText>Deploy piggyback</RollHoverText> and confirm.</BodyText></div>
      <div id="sb"><SplitButton>Save</SplitButton></div>
      <div id="st" style={{padding:8}}><Sticker><CheckIcon /> Verified</Sticker></div>
      <div id="st2" style={{padding:8}}><Sticker><CheckIcon /> Verified</Sticker></div>
      <div id="td" style={{padding:8}}><TextDropdownTrigger>Sort by <b>Name</b></TextDropdownTrigger></div>
      <div id="td2" style={{padding:8}}><TextDropdownTrigger>Sort by <b>Name</b></TextDropdownTrigger></div>
      <div id="tb"><Table><TableHeader><TableHeaderCell sortDirection={TableSortDirection.ascending} onSort={() => {}}>Name</TableHeaderCell><TableHeaderCell>Role</TableHeaderCell></TableHeader><TableRow><TableCell>Ada</TableCell><TableCell>Eng</TableCell></TableRow></Table></div>
    </ToastProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
