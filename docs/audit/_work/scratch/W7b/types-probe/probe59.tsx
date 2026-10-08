// WI-C7-59 type probe (F-113 item 9). Retarget the two dist paths in tsconfig.59.json to a scratch-worktree build.
// Today: TS2322 — DatePicker has no `defaultOpen` (it re-implements Popover's open state and cannot take one).
import { DatePicker, DatePickerMode } from "@dooph-software/design-system";
export const uncontrolledOpen = (
  <DatePicker mode={DatePickerMode.singleDay} value={new Date(2026, 0, 1)} onChange={() => {}} defaultOpen />
);
export const controlled = (
  <DatePicker mode={DatePickerMode.singleDay} value={new Date(2026, 0, 1)} onChange={() => {}} open onOpenChange={() => {}} />
);
