### PopoverContent uses the shared floating-panel look [F-071, WI-112]
- files: `src/components/Popover/Popover.tsx` (no header contract in this file)
- what changed: the panel surface now matches the menus (`menuPanelClassName`):
  `border-border-primary` → `border-border-popovers`, `bg-surface-primary` →
  `bg-modal-surface`, `shadow-button` → `shadow-menu`. Default `sideOffset`
  4 → 6 (still consumer-overridable). Motion (`ds-motion-overlay`), the
  transform-origin helper, `overflow-hidden`, `rounded-normal` and the radix
  animate classes are unchanged. No menu padding/gap copied; DropdownMenu untouched.
- consumer impact: every PopoverContent and the DatePicker panel get the new
  border, background (dark: #000000 → #212124) and shadow, and sit 2px further
  from the trigger. A consumer `className` or `sideOffset` still wins.
- breaking: no
- verified: server render of PopoverContent and of an open DatePicker shows the
  new surface classes on the panel; the Calendar inside still carries its own
  `flex flex-col gap-rg p-md ds-calendar-panel-w` (padding/size unchanged, only
  surface paint changed). Lint exit 0. Scoreboard before/after identical.
- docs owed: `src/styles/tokens.css:122-123` comment (Popover now one of the
  floating-panel users), `skills/dooph-design-system-theming/references/token-contract.md:40`,
  CHANGELOG `[Unreleased]` entry (minor: visible surface change on Popover and DatePicker).

## DONE
