// WI-C7-58 type probe (F-115 item 8). Retarget the two dist paths in tsconfig.58.json to a scratch-worktree build.
// Today: TS2305/TS2724 "has no exported member" for the three props types.
import type {
  DropdownMenuProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
} from "@dooph-software/design-system";
import { DropdownMenuSelectType, DropdownMenuItemVariant } from "@dooph-software/design-system";
export const root: DropdownMenuProps = { selectType: DropdownMenuSelectType.multi, modal: true };
export const content: DropdownMenuContentProps = { focusOnOpen: false, matchTriggerWidth: false, portal: false, dismissOnFocusLoss: true };
export const item: DropdownMenuItemProps = { variant: DropdownMenuItemVariant.danger, onSelect: () => {} };
