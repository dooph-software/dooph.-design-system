# WI-C7 — work items

### WI-C7-01: Give SliderStepped's keyboard handler Radix's x10 PageUp/PageDown/Shift+Arrow jumps, and record the preventDefault sanction
- status: todo
- addresses: [F-022]
- depends_on: []
- phase: P3
- risk: low — keyboard-only behaviour on stepped sliders. PageUp/PageDown and Shift+Arrow now move 10 dots instead of 1; on a slider with fewer than 10 dots they clamp to the end, through the existing clamp at :251. Plain Arrow, Home and End keep their behaviour. Drag is untouched (Root still runs at `step / DRAG_SUBDIVISIONS`).
- semver: patch
- files:
  - modify: `src/components/Slider/Slider.tsx:217-239 @ b436647`
  - modify: `src/components/Slider/Slider.stories.tsx:304 @ b436647`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:186 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:296-297 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // Slider.tsx:217-239
        /* The fine drag step would otherwise make an arrow press move a hundredth
         * of a dot, so stepped keyboard interaction is handled here instead.
         * Left/Right follow the visual direction; Up/Down are always increase or
         * decrease, matching Radix. */
        const flip = (dir === 'rtl' ? -1 : 1) * (inverted ? -1 : 1);
        const from = snap(display[0] ?? min);
        let next: number;

        switch (event.key) {
          case 'ArrowLeft':
            next = from - step * flip;
            break;
          case 'ArrowRight':
            next = from + step * flip;
            break;
          case 'ArrowDown':
          case 'PageDown':
            next = from - step;
            break;
          case 'ArrowUp':
          case 'PageUp':
            next = from + step;
            break;
  ```
- why: On SliderContinuous, PageUp/PageDown and Shift+Arrow move 10 steps because Radix applies a x10 multiplier. On SliderStepped every one of those keys moves one dot, because the DS handler pre-empts Radix (`event.preventDefault()` at :250) and never applies the multiplier. Two sliders on one page answer the same keys differently. The pre-emption is load-bearing, but arch:186 bans it and no rule sanctions it (F-022).
- steps:
  - [ ] 1. Reproduce (fails today). Run Storybook, open `Inputs/Slider` → "Keyboard interaction", and run this in the preview iframe's console:
    ```js
    const s = [...document.querySelectorAll('[role="slider"]')]; // [0] continuous (50), [1] stepped 0..4 (2)
    const press = (el, key, shiftKey = false) => { el.focus(); el.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true })); };
    press(s[0], 'PageUp'); press(s[1], 'PageUp');
    await new Promise((r) => setTimeout(r, 50));
    [s[0].getAttribute('aria-valuenow'), s[1].getAttribute('aria-valuenow')]
    ```
    → today `["60", "3"]`: the continuous slider jumps 10, the stepped one moves a single dot. Reload the story. `press(s[1], 'ArrowLeft', true)` → today `aria-valuenow` is `"1"`.
  - [ ] 2. Slider.tsx — apply Radix's multiplier in `handleKeyDown`:
    ```diff
           /* The fine drag step would otherwise make an arrow press move a hundredth
            * of a dot, so stepped keyboard interaction is handled here instead.
            * Left/Right follow the visual direction; Up/Down are always increase or
    -       * decrease, matching Radix. */
    +       * decrease, matching Radix. PageUp/PageDown and Shift+Arrow move 10 dots,
    +       * mirroring Radix's own multiplier (`isSkipKey ? 10 : 1`), so both slider
    +       * variants answer the same keys the same way. */
           const flip = (dir === 'rtl' ? -1 : 1) * (inverted ? -1 : 1);
           const from = snap(display[0] ?? min);
    +      const isPageKey = event.key === 'PageUp' || event.key === 'PageDown';
    +      const big = step * (isPageKey || (event.shiftKey && event.key.startsWith('Arrow')) ? 10 : 1);
           let next: number;

           switch (event.key) {
             case 'ArrowLeft':
    -          next = from - step * flip;
    +          next = from - big * flip;
               break;
             case 'ArrowRight':
    -          next = from + step * flip;
    +          next = from + big * flip;
               break;
             case 'ArrowDown':
             case 'PageDown':
    -          next = from - step;
    +          next = from - big;
               break;
             case 'ArrowUp':
             case 'PageUp':
    -          next = from + step;
    +          next = from + big;
               break;
    ```
    The clamp at :251 (`snap(Math.min(max, Math.max(min, next)))`) keeps the result in range, so leave it as it is.
  - [ ] 3. Slider.stories.tsx:304 — replace the story description with:
    ```ts
              'Focus the handle (Tab) then use Left/Right (or Up/Down) to move by one step; PageUp/PageDown and Shift+Arrow move 10 steps (clamped to the ends); Home/End jump to min/max. The continuous slider gets this from Radix. The stepped slider handles it itself, mirroring Radix\'s keys, because Radix is driven at a much finer step there to keep dragging smooth — so a key press must still move whole dots.',
    ```
  - [ ] 4. arch SKILL.md — record the sanction. After :186 (`- \`e.stopPropagation()\` / \`e.preventDefault()\` on Radix internal event handlers`), add a sub-bullet:
    ```md
      - Sanctioned exception: `SliderBase`'s `handleKeyDown` (stepped sliders) is composed ahead of Radix as the consumer `onKeyDown` and calls `event.preventDefault()` for the step keys, because Root runs at `step / DRAG_SUBDIVISIONS` for smooth drag. It must mirror Radix's key semantics exactly: Arrow ±1 step (Left/Right follow `dir`/`inverted`), PageUp/PageDown and Shift+Arrow ±10, Home/End to min/max.
    ```
    codebase SKILL.md:296-297 — change `Keyboard is handled\n  explicitly for that reason (a fine step would move a hundredth of a dot).` to `Keyboard is handled\n  explicitly for that reason (a fine step would move a hundredth of a dot), and\n  mirrors Radix's keys: PageUp/PageDown and Shift+Arrow move 10 dots.` (The audit's rulebook R2.10 is derived from arch:186, so the arch edit is the rule-text change.)
  - [ ] 5. CHANGELOG.md `## [Unreleased]` — add a `### Fixed` section after `### Changed` (:21-22) with: `- \`SliderStepped\` / \`SliderLabeled\`: PageUp/PageDown and Shift+Arrow now move 10 steps, matching \`SliderContinuous\`.`
  - [ ] 6. Verify: `npm run lint` → exit 0. Re-run step 1 → `["60", "4"]` (stepped: 2 + 10 clamps to max 4). After a reload, `press(s[1], 'ArrowLeft', true)` → `"0"`, and a plain `press(s[1], 'ArrowRight')` → `"3"` (single steps unchanged). `rg -n "const big = step" src/components/Slider/Slider.tsx` → 1 hit. `rg -n "Sanctioned exception: .SliderBase" .agents/skills/dooph-ds-architecture/SKILL.md` → 1 hit.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: in the Keyboard interaction story, PageUp and Shift+Arrow move both sliders 10 steps or clamp to the end, plain arrows still move 1; arch SKILL.md names the SliderBase preventDefault exception.
- log:
  - 2026-10-01 — created by audit

### WI-C7-02: Table — merge consumer `style` in TableHeader/TableRow, add table roles and `aria-sort`, give TableHeaderCell `buttonProps`, and write the style-order rule
- status: todo
- addresses: [F-029, F-042, F-039]
- depends_on: []
- phase: P3
- risk: low — (a) TableHeader/TableRow: a consumer `style` now merges where it used to replace. The only consumer who sees a change is one who relied on `style` wiping the grid, which is the bug. (b) The new `role`s are written before `{...props}`, so a consumer's own `role` still wins. A screen reader now announces a table, which is the intent. TablePlaceholder gains one `display: contents` wrapper, so layout does not change. (c) `buttonProps` is a new optional prop, additive. Table.tsx:1-3 (the directive note) is left to WI-C3's header WI; this WI touches only :4-6, :35 and :43-154.
- semver: minor
- files:
  - modify: `src/components/Table/Table.tsx:4-6,22-154 @ b436647`
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:54 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:161-163 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // Table.tsx:45-52
  const TableHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn("grid border-b border-border-primary py-xs px-xxs", className)}
        style={{ gridTemplateColumns: "var(--table-cols)" }}
        {...props}
      />
  // Table.tsx:117-121
        style={{
          gridTemplateColumns: "var(--table-cols)",
          height: "var(--table-row-height, auto)",
        }}
        {...props}
  ```
- why: `<TableRow style={{ opacity: 0.5 }}>` silently drops the row's grid and height, so its cells stop lining up with the header (F-029). No rule fixes the merge order, so contributors copy three different idioms. Every Table part is a bare `<div>`, so a screen reader hears no table and no sort state, although the component holds `sortDirection` (F-042). The sort `<Button>` takes only fixed props, so `aria-*`/handlers meant for it land on the wrapping `<div>` (F-039 item 7).
- steps:
  - [ ] 1. Reproduce (fails today): `node docs/audit/_work/scratch/W7a/table-check.cjs` (defaults to the audit build `C:/Users/stick/Github/dooph/dooph-ds-audit-build`, which is b436647) → every check prints `FAIL` and the run exits 1. The script asserts: TableRow/TableHeader keep `grid-template-columns:var(--table-cols)` beside `opacity:0.5`; `role="table"`; 3× `role="row"`; 2× `role="columnheader"`; `aria-sort="ascending"`; 3× `role="cell"`; `buttonProps` reaching the `<button>`. Today it also prints React's "does not recognize the `buttonProps` prop" warning.
  - [ ] 2. Table.tsx imports. :4 `import { forwardRef, type HTMLAttributes } from "react";` → `import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";`. After :6 add `import type { ButtonProps } from "../Button/Button";`. At :35 change `} as React.CSSProperties` to `} as CSSProperties`.
  - [ ] 3. Table.tsx — Table root (:24-25): add `role="table"` after `ref={ref}`, before `{...props}`.
  - [ ] 4. Table.tsx — TableHeader (:45-52) and TableRow (:107-122): destructure `style` and spread it last, and add `role="row"` before `{...props}`:
    ```tsx
    const TableHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
      ({ className, style, ...props }, ref) => (
        <div
          ref={ref}
          role="row"
          className={cn("grid border-b border-border-primary py-xs px-xxs", className)}
          style={{ gridTemplateColumns: "var(--table-cols)", ...style }}
          {...props}
        />
      ),
    );
    ```
    ```tsx
    const TableRow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
      ({ className, style, ...props }, ref) => (
        <div
          ref={ref}
          role="row"
          className={cn(
            "grid border-b border-border-primary",
            "not-last:border-b",
            "hover:bg-ghost-hover transition-colors duration-100",
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
    ```
  - [ ] 5. Table.tsx — TableHeaderCell (:59-103). Replace the props interface (:59-62) with the following and add the map below it:
    ```tsx
    export interface TableHeaderCellProps extends HTMLAttributes<HTMLDivElement> {
      sortDirection?: TableSortDirection;
      onSort?: () => void;
      /** Props for the sort button (sortable headers only): `aria-*`, `id`,
       *  `onKeyDown`, `className`, … The click is always `onSort`. */
      buttonProps?: Omit<ButtonProps, "children" | "onClick" | "asChild">;
    }

    /* TableSortDirection values are not ARIA tokens; this is the translation. */
    const ARIA_SORT = {
      [TableSortDirection.none]: "none",
      [TableSortDirection.ascend]: "ascending",
      [TableSortDirection.descend]: "descending",
    } as const;
    ```
    Change the parameter list (:71) to `({ className, sortDirection, onSort, buttonProps, children, ...props }, ref)`. Make the sortable branch (:73-88) read:
    ```tsx
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
                size={ButtonSize.default}
                {...buttonProps}
                className={cn("w-full justify-start gap-1 text-text-primary", buttonProps?.className)}
                onClick={onSort}
              >
                <ButtonText>{children}</ButtonText>
                <SortIcon direction={sortDirection} />
              </Button>
            </div>
          );
    ```
    In the plain branch (:93-97), add `role="columnheader"` after `ref={ref}`. `buttonProps` is ignored there, since there is no button.
  - [ ] 6. Table.tsx — TableCell (:129-139): add `role="cell"` after `ref={ref}`. Replace TablePlaceholder's body (:148-154) with:
    ```tsx
    >(({ className, children, ...props }, ref) => (
      <div
        ref={ref}
        role="row"
        className={cn("flex flex-1 items-center justify-center py-8", className)}
        {...props}
      >
        {/* A row must own cells; `contents` keeps the flex centring unchanged. */}
        <div role="cell" className="contents">
          {children}
        </div>
      </div>
    ));
    ```
  - [ ] 7. contribution SKILL.md:54 — replace the final sentence `Merge a consumer's own \`style\` rather than replacing it` with: `Merge a consumer's own \`style\`, spread LAST, after the component's own values (\`style={{ ...own, ...style }}\`). Never set \`style=\` and then spread props. Only a value driven by an explicit prop the consumer controls may be written after it (DropdownMenuSection \`width\`, LinearProgressIndicator \`value\`/\`color\`, Sticker \`custom\` \`color\`, AIModelSelect \`color\`); name that exception where the merge happens.` This leaves the four component-wins sites as they are, and states the order BaseText.tsx:49-51 already promises ("`style` still outranks props").
  - [ ] 8. usage SKILL.md:163 — after `before hand-rolling a grid of divs for tabular data.` append: ` The parts carry \`table\`/\`row\`/\`columnheader\`/\`cell\` roles, and a sortable header sets \`aria-sort\` from \`sortDirection\`, so do not add them yourself. \`TableHeaderCell buttonProps\` reaches the sort button; \`style\` on any part merges with its grid.`
  - [ ] 9. CHANGELOG.md `## [Unreleased]`: under `### Added` add `- \`TableHeaderCell buttonProps\` — props for the sort button.` Under `### Fixed` (create it after `### Changed` if no earlier WI has) add `- \`TableHeader\` / \`TableRow\`: a consumer \`style\` merges instead of wiping the column grid.` and `- \`Table\` parts expose table/row/columnheader/cell roles; sortable headers set \`aria-sort\`.`
  - [ ] 10. Verify:
    - `npm run lint` → exit 0.
    - Build in a scratch worktree (`git worktree add <scratchpad>/wt-table HEAD`, copy the working-tree `Table.tsx` in, then `npm ci && npm run build` there). Run `node docs/audit/_work/scratch/W7a/table-check.cjs <scratchpad>/wt-table` → every line `PASS`, exit 0, no React unknown-prop warning.
    - `git -C <scratchpad>/wt-table status --porcelain` → only the copied Table.tsx, so there is no generated drift.
    - `rg -n '^\s+style=\{\{' src/components/Table/Table.tsx` → 2 hits (TableHeader, TableRow), and each object ends in `...style`.
    - In Storybook `Bits & Pieces/Table` → "Header Cell Sort States", the Browser pane's read_page shows `table` → `row` → `columnheader`, and the three columns line up as before.
  - [ ] 11. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `table-check.cjs` exits 0 against a build of the change, and contribution SKILL.md:54 states the style spread order.
- log:
  - 2026-10-01 — created by audit


### WI-C7-03: In 6.0.0, name every DS value control's callback `value`/`onValueChange`, the forced-look boolean `active`, the inverse-surface flag `themeInverse`, and write the rule beside arch:122 (recommended D-13 option)
- status: blocked(D-13)
- addresses: [F-031]
- depends_on: [WI-RELEASE-OPEN, WI-C3-17, WI-C4-21]
- phase: P4
- risk: medium — every rename is a compile error for a consumer who used the old name, which is the intended, visible failure. Two cases can go silent. (a) `VerificationCodeInputProps` must keep `"onChange"` in its `Omit<HTMLAttributes<HTMLDivElement>, …>`. Without it, a stale `onChange={(v) => …}` type-checks against the div's native handler and receives an event. (b) `DatePickerSplitTrigger` drops `"onSelect"` from its `Omit` because the new name is not a div prop. A leftover `onSelect` then reaches the root div as a native handler and is never called with a range, so the migration skill must list it as silent. Other WIs edit these files: WI-C7-04 and WI-C7-07 (Calendar, DatePicker), WI-C7-08 and WI-C7-11 (VerificationCodeInput), WI-C5-09, WI-C4-05 and WI-C4-12 (OutlineButton), WI-C4-21 (HotkeyIndicator `data-pressed`), WI-C3-17 (arch:122). Match every edit below by content, not line number.
- semver: major
- files:
  - modify: `src/components/VerificationCode/VerificationCodeInput.tsx:5-6,34,53,75,77 @ b436647`
  - modify: `src/components/DatePicker/DatePicker.tsx:40,47,86,134-135,149-150 @ b436647`
  - modify: `src/components/Calendar/Calendar.tsx:49-50,55-56,65-83,100,142,182-183,203,240-241,258,270 @ b436647`
  - modify: `src/components/Calendar/rangeSelection.ts:18 @ b436647`
  - modify: `src/components/DatePicker/DatePickerSplitTrigger.tsx:24-31,54,81 @ b436647`
  - modify: `src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:9,14,19,59-63,85,92 @ b436647`
  - modify: `src/components/HotkeyIndicator/HotkeyIndicator.tsx:6,9,22 @ b436647`
  - modify: `src/components/OutlineButton/OutlineButton.tsx:21-33,56,65,77-78,105,121,125,131,149,165,173,178 @ b436647`
  - modify (stories, all @ b436647): `src/components/VerificationCode/VerificationCode.stories.tsx:44,54,93`, `src/components/DatePicker/DatePicker.stories.tsx:31,48,64,92,110,123,130`, `src/components/Calendar/Calendar.stories.tsx:30-31,47-48,63-64,89-90,104-105,135-136,152-153`, `src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.stories.tsx:21,29,61,85,88,91,117`, `src/components/HotkeyIndicator/HotkeyIndicator.stories.tsx:10,19,36`, `src/components/OutlineButton/OutlineButton.stories.tsx:30-31,59,62,75`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:122,385 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:74,127,153,415,427,433,441 @ b436647`
  - modify: `.agents/skills/file-header-contracts/SKILL.md:102 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:113,127-129,203 @ b436647`
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:62 @ b436647`
  - modify: `skills/dooph-design-system-v6-migration/SKILL.md` (created by WI-RELEASE-OPEN)
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // VerificationCodeInput.tsx:29-34
  export interface VerificationCodeInputProps
    extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
    length?: number;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
  // DatePicker.tsx:37-40
      | {
          mode: typeof DatePickerMode.singleDay;
          value: Date;
          onChange: (date: Date) => void;
  // Calendar.tsx:47-50
  type CalendarSingleProps = CalendarSharedProps & {
    mode: typeof DatePickerMode.singleDay;
    selected: Date;
    onSelect: (date: Date) => void;
  // DatePickerSplitTrigger.tsx:24-31
  export type DatePickerSplitTriggerProps = Omit<
    ComponentPropsWithoutRef<"div">,
    "onSelect"
  > & {
    value: DateRange;
    /** Inline shortcuts. Defaults to the three from the Figma spec. */
    presets?: CalendarPreset[];
    onSelect: (range: DateRange) => void;
  // SidebarWithHoverIcon.tsx:63
    hovered?: boolean;
  // HotkeyIndicator.tsx:6
    pressed?: boolean;
  // OutlineButton.tsx:26 and :33
    inverseTheme?: boolean;
    glowing?: boolean;
  ```
- why: A consumer cannot predict a callback name or a forced-state name from a sibling component. VerificationCodeInput's `onChange` passes a string while Input's passes an event. Moving from DatePicker to Calendar renames both props. The "force the look" boolean is spelt `active`, `hovered`, `glowing` or `pressed`, and OutlineButton's own JSDoc says `inverseTheme` "mirrors" Tooltip's `themeInverse`. No rule names a convention, so each new component adds another (F-031).
- steps:
  - [ ] 1. Confirm that D-13 chose the recommended option (rename in the major) and that D-01 chose 6.0.0. If D-13 chose "rule only, no renames", do step 2 alone, mark the rest `dropped(D-13)` in this item's log, and stop. Record today's spread as the baseline: `rg -n '^\s+(onChange|onSelect|selected|hovered|glowing|pressed|inverseTheme)\??:' src/components --glob '!*.stories.tsx'`. Expect hits at VerificationCodeInput.tsx:34, DatePicker.tsx:40,47, Calendar.tsx:49,50,55,56, DatePickerSplitTrigger.tsx:31, SidebarWithHoverIcon.tsx:63, HotkeyIndicator.tsx:6 and OutlineButton.tsx:26,33. Expect also the native-input `onChange` sites and CalendarPresetItem's `selected?:`/`onSelect:` (CalendarPresetsPanel.tsx:37,39), which stay.
  - [ ] 2. arch SKILL.md — directly after the prop-name bullet (:122, as rewritten by WI-C3-17), add:
    ```md
    - Value-holding controls the DS owns use Radix's names: `value` / `defaultValue` / `onValueChange(value)`. Only a component whose root is a native `<input>`/`<textarea>` keeps the native `onChange(event)`. A prop that forces an interaction look from outside (hover, press, glow) is the boolean `active`, emitted as `data-active`. A flag that swaps to the inverse surface is `themeInverse`. An action callback that is not a value pair (CalendarPresetItem `onSelect`, TableHeaderCell `onSort`) is named for the action.
    ```
    Also change arch:385 `  <SidebarWithHoverIcon side={side} hovered={hovered} />` → `  <SidebarWithHoverIcon side={side} active={hovered} />`. In the `DatePickerMode` table row that WI-C3-17 adds, change `onChange={setRange}` → `onValueChange={setRange}`.
  - [ ] 3. VerificationCodeInput.tsx:
    - Header :5-6: change `` `onChange`, or uncontrolled via `defaultValue`. `` to `` `onValueChange`, or uncontrolled via `defaultValue`. ``. AGENTS.md requires the contract to ship with the code.
    - :34 `onChange?: (value: string) => void;` → `onValueChange?: (value: string) => void;`.
    - :53 `onChange,` → `onValueChange,`.
    - :75 `onChange?.(clipped);` → `onValueChange?.(clipped);`.
    - :77 `[isControlled, length, onChange],` → `[isControlled, length, onValueChange],`.
    - Leave :30's `Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">` exactly as it is.
  - [ ] 4. DatePicker.tsx:
    - :40 `onChange: (date: Date) => void;` → `onValueChange: (date: Date) => void;`.
    - :47 `onChange: (range: DateRange) => void;` → `onValueChange: (range: DateRange) => void;`.
    - :86 `onSelect={props.onChange}` → `onValueChange={props.onValueChange}`.
    - :134-135 and :149-150: `selected={props.value}` / `onSelect={props.onChange}` → `value={props.value}` / `onValueChange={props.onValueChange}`.
  - [ ] 5. Calendar.tsx:
    - :49-50 and :55-56: `selected:` → `value:` and `onSelect:` → `onValueChange:`.
    - Rename every `props.selected` → `props.value`: :65 (twice), :74, :142 (twice), :182, :183 (twice), :203 (twice), :240 (twice) and :241.
    - Rename `props.onSelect(` → `props.onValueChange(` at :258 and :270.
    - In the warning strings, change the backticked prop name. :67 and :77: `` `selected` must`` → `` `value` must``. :83: `` `selected.to` is before `selected.from` `` → `` `value.to` is before `value.from` ``. :100: ``\`selected\` is in`` → ``\`value\` is in``.
    - The local `selectedRange` (:238-248, :342) is internal and stays.
    - If WI-C7-07 has landed, its destructure names `selected: _selected, onSelect: _onSelect` to keep them off the root `<div>`. Rename them to `value: _value, onValueChange: _onValueChange`. Keep `"onSelect"` in `CalendarSharedProps`'s `Omit<HTMLAttributes<HTMLDivElement>, …>`, so a leftover `onSelect` stays a type error and is not silently treated as the div's native handler.
  - [ ] 6. rangeSelection.ts:18: `` * `onChange` must fire only for a "commit" result.`` → `` * `onValueChange` must fire only for a "commit" result.`` If WI-C3-09 has landed first, the line reads `` `onSelect` must fire `` — change it to `` `onValueChange` must fire `` all the same.
  - [ ] 7. DatePickerSplitTrigger.tsx:
    - :24-27 `Omit<` / `ComponentPropsWithoutRef<"div">,` / `"onSelect"` / `> & {` → `ComponentPropsWithoutRef<"div"> & {`.
    - :31 `onSelect: (range: DateRange) => void;` → `onValueChange: (range: DateRange) => void;`.
    - :54 `onSelect,` → `onValueChange,`.
    - :81 `if (preset) onSelect(preset.getRange(now));` → `if (preset) onValueChange(preset.getRange(now));`.
  - [ ] 8. SidebarWithHoverIcon.tsx:
    - Header :9: `` `hovered` bows it`` → `` `active` bows it``.
    - Header :14: ``At `hovered` = 1`` → ``At `active` = 1``.
    - Header :19: ``- `hovered` is CONTROLLED.`` → ``- `active` is CONTROLLED.``. The constraint's substance, that the prop is controlled, is unchanged. Only the identifier changes.
    - Props :63 `hovered?: boolean;` → `active?: boolean;`. Keep the :59-62 JSDoc.
    - :85 `hovered = false,` → `active = false,`.
    - :92 `const targetH = hovered ? 1 : 0;` → `const targetH = active ? 1 : 0;`.
  - [ ] 9. HotkeyIndicator.tsx:
    - Rename `pressed` → `active` at :6 (`pressed?: boolean;`), :9 (`pressed = false`) and :22 (`pressed`).
    - WI-C4-21 adds `data-pressed={pressed || undefined}` and a `group-data-[pressed]/hotkey:` class. It is listed in depends_on, so both are present when this item runs: rename them to `data-active={active || undefined}` and `group-data-[active]/hotkey:`. The attribute then matches RollHoverText and UnderlineLinkText, which already emit `data-active`.
    - If WI-C4-21's CHANGELOG line ``sets `data-pressed` `` is still in `[Unreleased]`, change it to ``sets `data-active` ``.
  - [ ] 10. OutlineButton.tsx:
    - :24 `* would blend in. Mirrors the \`themeInverse\` pattern on Tooltip. */` → `* would blend in. Same flag as Tooltip's \`themeInverse\`. */`.
    - :26 `inverseTheme?: boolean;` → `themeInverse?: boolean;`, and `inverseTheme` → `themeInverse` at :77, :149 and :165.
    - :33 `glowing?: boolean;` → `active?: boolean;`, and `glowing` → `active` at :78, :105, :121, :125, :131 and :173.
    - Comments: :56 `` (`glowing`) `` → `` (`active`) ``; :65 `<OutlineButton glowing glowColor1=` → `<OutlineButton active glowColor1=`; :178 `` `glowing` `` → `` `active` ``.
  - [ ] 11. Stories — rename the same props at every listed story line:
    - VerificationCode.stories.tsx: `onChange=` → `onValueChange=` at :44 and :93; the :54 prose `` no `onChange` `` → `` no `onValueChange` ``.
    - DatePicker.stories.tsx: `onChange=` → `onValueChange=` at :31, :48, :64, :92, :110, :123 and :130.
    - Calendar.stories.tsx: on `<Calendar>`, `selected=`/`onSelect=` → `value=`/`onValueChange=` at :30-31, :47-48, :63-64, :89-90, :104-105, :135-136 and :152-153. Do NOT change the `<CalendarPresetItem selected=… onSelect=…>` at :72 and :74.
    - SidebarWithHoverIcon.stories.tsx: the argTypes key `hovered:` → `active:` (:21); `hovered: true` → `active: true` (:88); `hovered={hovered}` → `active={hovered}` (:61, :117); `` `hovered` `` → `` `active` `` in the prose at :29, :85 and :91.
    - HotkeyIndicator.stories.tsx: `pressed` → `active` at :10, :19 and :36.
    - OutlineButton.stories.tsx: the argTypes keys `glowing:`/`inverseTheme:` → `active:`/`themeInverse:` (:30-31); `inverseTheme` → `themeInverse` in the :59 prose and in :62's `<OutlineButton inverseTheme>`; `glowing: true` → `active: true` (:75).
  - [ ] 12. Skills and docs:
    - codebase SKILL.md: :74 ``chevron on `hovered` `` → ``chevron on `active` ``; :127 `` `inverseTheme` bool; `glowing` bool`` → `` `themeInverse` bool; `active` bool``; :153 `` controlled `value`/`onChange` `` → `` controlled `value`/`onValueChange` ``; `` `hovered` `` → `` `active` `` at :415, :427 and :433; :441 `` `pressed` bool`` → `` `active` bool``.
    - file-header-contracts SKILL.md:102: ``- `hovered` is CONTROLLED.`` → ``- `active` is CONTROLLED.``. This line quotes the SidebarWithHoverIcon constraint, so it must match the new header.
    - usage SKILL.md: :113 `` (`inverseTheme`, `glowing`, `` → `` (`themeInverse`, `active`, ``. At :127-129, add `; controlled with \`value\`/\`onValueChange\`` before the VerificationCodeInput parenthesis closes. :203 `` **controlled** `hovered` `` → `` **controlled** `active` ``.
    - token-contract.md:62: `` Use `glowing` to make`` → `` Use `active` to make``, and `` and `inverseTheme` to swap`` → `` and `themeInverse` to swap``.
  - [ ] 13. Migration skill and changelog. In `skills/dooph-design-system-v6-migration/SKILL.md`, under `## Changes added by later 6.0 work items`, add a "Prop renames (hard)" table with one row per rename:
    - `VerificationCodeInput onChange` → `onValueChange`
    - `DatePicker onChange` → `onValueChange`
    - `Calendar selected` → `value`, and `onSelect` → `onValueChange`
    - `DatePickerSplitTrigger onSelect` → `onValueChange`, marked SILENT: a leftover `onSelect` now type-checks as the div's native handler and never fires with a range
    - `SidebarWithHoverIcon hovered` → `active`
    - `HotkeyIndicator pressed` → `active`
    - `OutlineButton glowing` → `active`, and `inverseTheme` → `themeInverse`

    Give the consumer grep `rg -n "<(VerificationCodeInput|DatePicker|Calendar|DatePickerSplitTrigger|SidebarWithHoverIcon|HotkeyIndicator|OutlineButton)\b" -A8 src` and, for each component, the JSX prop to rewrite. In CHANGELOG `[Unreleased]` `### Changed`, add one line listing the same renames, ending "(see `dooph-design-system-v6-migration`)".
  - [ ] 14. Verify:
    - `npm run lint` → exit 0.
    - `rg -n '^\s+(onChange|onSelect|selected|hovered|glowing|pressed|inverseTheme)\??:' src/components --glob '!*.stories.tsx'` → only the native-input `onChange` declarations and CalendarPresetsPanel.tsx's `selected?:`/`onSelect:` remain. None of the seven files above appears.
    - `rg -n "props\.(selected|onSelect)|onSelect=\{props|\binverseTheme\b|\bglowing\b" src` → no output.
    - `rg -n "\bhovered\b" src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx` → no output.
    - tsc probe: write a scratch `.tsx` under the session scratchpad (not the repo) that imports from the repo's `src/index.ts`, and run `npx tsc --noEmit --jsx react-jsx` on it. `<VerificationCodeInput onChange={(v: string) => {}} />` and `<Calendar mode={DatePickerMode.singleDay} selected={d} onSelect={() => {}} />` are each a type error, and `<VerificationCodeInput onValueChange={(v) => {}} />` type-checks.
    - Build in a scratch worktree: `git worktree add <scratchpad>/wt-names HEAD`, copy the changed files in, then run `npm ci && npm run build`. `git -C <scratchpad>/wt-names status --porcelain` → lists only the copied files.
    - Storybook:
      - the `Inputs/VerificationCode` controlled story still fills;
      - the DatePicker and Calendar range stories still commit a range;
      - the `SidebarWithHoverIcon` toggle story still bows on hover;
      - OutlineButton's always-lit story (`active: true`) still shows the glow;
      - HotkeyIndicator's `Pressed` story still shows the active background.
  - [ ] 15. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the step-14 rg checks pass; arch SKILL.md states the `value`/`onValueChange`, `active` and `themeInverse` rule; the v6 migration skill lists all nine renames; `npm run lint` exits 0.
- log:
  - 2026-10-01 — created by audit

### WI-C7-04: Make the discriminated-union guards hold at runtime — Input's icon is a `ReactElement`, Calendar renders nothing on a bad value, the date labels tolerate one, ProgressIndicator rejects NaN (recommended D-12 option)
- status: blocked(D-12)
- addresses: [F-038]
- depends_on: [WI-RELEASE-OPEN]
- phase: P4
- risk: medium. Typing Input's icon arms `icon: ReactElement` rejects code that compiles today: `icon={props.icon}` forwarding an optional `ReactNode`, `icon={cond && <Icon/>}`, and a string or number icon. That breaks consumers, so this item is P4 (F-038's note-to-orchestrator). The runtime halves do not break anyone: Calendar and the date labels stop crashing, the NaN throw only fires for input that paints a false "complete" ring today, and the Input guard now also throws on `false`/`""`/`0`, which render an empty slot today. If D-12 wants those halves sooner, split steps 4-7 into a P3 item and keep step 3 here. Calendar.tsx and DatePicker are also edited by WI-C7-03 (prop rename) and WI-C7-07 (`contentProps`), and Calendar.tsx:149's comment by WI-C3-09. Match by content. If WI-C7-03 has landed, read every `props.selected` below as `props.value`. A Calendar whose valid value turns invalid now unmounts its view, so its internal month/focus state resets when it comes back. That is the "render nothing" decision working as designed.
- semver: major
- files:
  - modify: `src/components/Input/Input.tsx:12,28-31,35-43,59,99-103 @ b436647`
  - modify: `src/components/Slider/Slider.tsx:40-41 @ b436647`
  - modify: `src/components/Calendar/dateUtils.ts:1-16 @ b436647` (one import at the top, two helpers after :16)
  - modify: `src/components/Calendar/dateFormat.ts:4,30-52 @ b436647`
  - modify: `src/components/Calendar/Calendar.tsx:16-24,61-85,124,138,362 @ b436647`
  - modify: `src/components/DatePicker/DatePickerSplitTrigger.tsx:70-77 @ b436647`
  - modify: `src/components/ProgressIndicator/ProgressIndicator.tsx:269,292 @ b436647`
  - modify: `src/components/AIChat/AIContextGauge.tsx:16-18 @ b436647`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:101-107 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:148,170 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:172-173 @ b436647`
  - modify: `skills/dooph-design-system-v6-migration/SKILL.md` (created by WI-RELEASE-OPEN)
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // Input.tsx:56-60
    | (InputBaseProps & {
        variant: typeof InputVariant.iconText | typeof InputVariant.iconNumber;
        /** Leading icon, e.g. <PencilIcon />. Sized by the icon itself (14px default). */
        icon: ReactNode;
      });
  // Input.tsx:99-103
      if (hasIcon && icon == null) {
        throw new Error(
          `Input: variant "${variant}" requires an \`icon\` prop.`,
        );
      }
  // Calendar.tsx:61-64
  function warnOnBadValue(props: CalendarProps): void {
    if (process.env.NODE_ENV === "production") return;

    if (props.mode === DatePickerMode.singleDay) {
  // Calendar.tsx:138-142
    warnOnBadValue(props);

    const today = startOfDay(todayProp ?? new Date());
    const anchorDate =
      mode === DatePickerMode.singleDay ? props.selected : props.selected.from;
  // ProgressIndicator.tsx:292
      if (progress < 0 || progress > 1) {
  ```
- why: The docs say the union is the real guard. In practice `icon={null}`/`{false}`, `color=""` and `progress={NaN}` all compile. `null` throws, `false` renders the empty slot the Input header forbids, and NaN paints a FULL ring with `aria-valuenow="NaN"`, reporting a task done. A bad Calendar value warns and then crashes with an incidental TypeError, although research:576 decided "render nothing". DatePicker crashes in its trigger before any warning, and an unknown `mode` silently behaves as range (F-038).
- steps:
  - [ ] 1. Reproduce (fails today): `node docs/audit/_work/scratch/W7c/guards-check.cjs`. It defaults to the audit build of b436647. Expect eight `FAIL` lines: Calendar ×3 and DatePicker ×2 TypeErrors, Input `icon={false}` renders, Input `icon={null}` throws without the `[Input]` prefix, and ProgressIndicator NaN renders. Exit code is 1. Run it again with `NODE_ENV=production`: same result. Type side: `C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/.bin/tsc -p docs/audit/_work/scratch/V4/m42` → exactly 4 errors, at probe.tsx:22, :26, :30 and :38. The `icon={null}`, `{undefined}`, `{maybe}` and `{false}` lines (probe.tsx:18-21) compile.
  - [ ] 2. Confirm D-12 chose the recommended option: tighten the types, Calendar renders nothing. If D-12 chose "Calendar throws", replace step 5's `return null` with `throw new Error('[Calendar] ' + problem)`. Then change research:576's "render nothing rather than crashing" to say the component throws, and expect a `[Calendar]` throw in step 9.
  - [ ] 3. Input.tsx:
    - Imports (:35-43): add `isValidElement,` after `forwardRef,`. Replace `type ReactNode,` with `type ReactElement,`.
    - :59 `icon: ReactNode;` → `icon: ReactElement;`.
    - :99-103:
      ```tsx
          if (hasIcon && !isValidElement(icon)) {
            throw new Error(
              `[Input] variant "${variant}" requires an \`icon\` element, e.g. icon={<PencilIcon />}.`,
            );
          }
      ```
    - Header (the contract moves with the behaviour): :12 `The icon variants require \`icon\`.` → `The icon variants require an \`icon\` element.`. :28 `- An icon variant without \`icon\` throws. The props union is the real guard;` → `- An icon variant without an \`icon\` element (null, false, "" included) throws. The props union is the real guard;`. Leave :29-31 as they are.
  - [ ] 4. Slider.tsx:40 — extend the JSDoc: `/** REQUIRED for \`custom\`, which has no hue of its own. */` → `/** REQUIRED for \`custom\`, which has no hue of its own. An empty string type-checks (a non-empty string is not expressible in TypeScript) but throws like an omitted colour. */`. The `[Slider]` guard at :288 (`!color`) already covers `""`.
  - [ ] 5. Calendar value guard:
    - dateUtils.ts: after `export const CELLS_IN_GRID = WEEKS_IN_GRID * DAYS_IN_WEEK;` (:16), add:
      ```ts
      /** A Date holding a real time — not `undefined`, not `new Date("nope")`. */
      export function isValidDate(value: unknown): value is Date {
        return value instanceof Date && !Number.isNaN(value.getTime());
      }

      /** `{ from, to }` with both ends valid Dates. Order is not checked here. */
      export function isValidRange(value: unknown): value is DateRange {
        const range = value as Partial<DateRange> | null | undefined;
        return !!range && isValidDate(range.from) && isValidDate(range.to);
      }
      ```
      Add `import type { DateRange } from "./constants";` at the top. It is type-only, so it adds no runtime cycle with constants.ts, which imports `startOfDay` from here. Do not add either helper to `Calendar/index.ts`; both stay internal.
    - Calendar.tsx: add `isValidDate, isValidRange,` to the dateUtils import (:16-24). Replace `warnOnBadValue` (:61-85) with:
      ```tsx
      /**
       * research:576 — a missing or malformed value warns in development and
       * renders NOTHING. It must never reach the date maths below, which would
       * crash with an incidental TypeError instead. An unknown `mode` is
       * malformed too: it would otherwise run the range branch silently.
       */
      function hasValidValue(props: CalendarProps): boolean {
        const value: unknown = props.selected;
        let problem: string | null = null;

        if (props.mode === DatePickerMode.singleDay) {
          if (!isValidDate(value)) {
            problem =
              "`selected` must be a valid Date in single-day mode. " +
              "A value is required — default to today rather than passing undefined.";
          }
        } else if (props.mode === DatePickerMode.dateRange) {
          if (!isValidRange(value)) {
            problem =
              "`selected` must be `{ from: Date, to: Date }` in date-range mode. " +
              "A value is required — there is no empty state.";
          } else if (startOfDay(value.to).getTime() < startOfDay(value.from).getTime()) {
            // Reported, not rejected: a reversed range still renders.
            if (process.env.NODE_ENV !== "production") {
              console.warn("[dooph] Calendar: `selected.to` is before `selected.from`.");
            }
          }
        } else {
          problem = `\`mode\` must be DatePickerMode.singleDay or DatePickerMode.dateRange, received ${JSON.stringify((props as { mode: unknown }).mode)}.`;
        }

        if (problem !== null && process.env.NODE_ENV !== "production") {
          console.warn(`[dooph] Calendar: ${problem} Rendering nothing.`);
        }
        return problem === null;
      }
      ```
    - Rename the component at :124 `function Calendar(props: CalendarProps) {` → `function CalendarView(props: CalendarProps) {`, and delete :138 `warnOnBadValue(props);`.
    - Before `Calendar.displayName = "Calendar";` (:362), add the public component. The guard must sit outside the hooks, which is why it wraps a separate view:
      ```tsx
      /** Validates before any hook or date maths runs, so the view's hooks are
       *  never skipped conditionally — an invalid value unmounts the view. */
      function Calendar(props: CalendarProps) {
        if (!hasValidValue(props)) return null;
        return <CalendarView {...props} />;
      }
      ```
    - If WI-C7-07 has landed (it is P3, so it normally has), Calendar is already `forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) { … })`. In that case:
      - Rename the inner render function to `CalendarView` and keep it a forwardRef: `const CalendarView = forwardRef<HTMLDivElement, CalendarProps>(function CalendarView(props, ref) { … })`.
      - Make the public component a forwardRef too: `const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) { if (!hasValidValue(props)) return null; return <CalendarView {...props} ref={ref} />; });`.
      - The root `<div ref={ref} {...rest} …>` inside the view is unchanged.
  - [ ] 6. Date labels (DatePickerTrigger and DatePickerSplitTrigger both format through these):
    - dateFormat.ts: change :4 to `import type { DateRange } from "./constants";` plus `import { isValidDate, isValidRange } from "./dateUtils";`. Make `formatSingleLabel` (:30-36) start with `if (!isValidDate(date)) return "";`. Make `formatRangeLabel` (:42-52) start with `if (!isValidRange(range)) return "";`.
    - Add one line above each function's JSDoc or signature: `/* An invalid value labels as "" so a trigger never crashes; Calendar warns and renders nothing for the same value. */`.
    - DatePickerSplitTrigger.tsx:70-77: prefix the `presets.find(` callback body so it cannot read `.from` of `undefined`:
      ```tsx
          const activePresetId =
            presets.find((preset) => {
              if (!(value?.from instanceof Date) || !(value?.to instanceof Date)) return false;
              const presetRange = preset.getRange(now);
      ```
      Keep the rest of the callback unchanged.
  - [ ] 7. ProgressIndicator.tsx:
    - :292 `if (progress < 0 || progress > 1) {` → `if (!(progress >= 0 && progress <= 1)) {` (NaN fails both comparisons, so it now throws). Add the comment `// Written as a negated range test so NaN (e.g. done / total with total 0) throws too.` above it.
    - :269 `* Throws if \`progress\` is outside [0, 1] — invalid values are always a bug.` → `* Throws if \`progress\` is outside [0, 1] or NaN — invalid values are always a bug.`
    - The prop JSDoc at :47 is WI-C2-11's fix (F-050). Do not touch it here.
    - AIContextGauge.tsx:17-18 (header `## constraints`): `0/0 is NaN,\n *   which would otherwise slip past the range guard and render garbage.` → `0/0 is NaN,\n *   which ProgressIndicator's range guard would reject with a throw.` The constraint's rule (`budget <= 0` draws empty, no clamp) is unchanged.
  - [ ] 8. Docs and migration:
    - arch SKILL.md: after :105-107 (`… the throw covers the\nJavaScript consumer and the runtime-computed value it cannot see. Silently\nfalling back would make an explicit choice look like it had been honoured.`), add `A required slot is typed \`ReactElement\`, never \`ReactNode\`: \`ReactNode\` admits \`null\`, \`false\` and \`""\`, so the union would not guard it. The throw's test matches the type (\`isValidElement\`, a non-empty string), and its message starts \`[Component]\`. A value whose type TypeScript cannot narrow far enough (a \`Date\` that is \`Invalid Date\`, \`NaN\`) is checked at run time too. Calendar is the exception: by recorded decision it warns and renders nothing.`
    - codebase SKILL.md: :148 `icon ones require \`icon\`` → `icon ones require an \`icon\` element (\`ReactElement\`)`. :170 append `; a missing/invalid value or unknown \`mode\` warns (dev) and renders nothing` to the Calendar row's last cell.
    - usage SKILL.md:173: after `range is not a public state.` add ` A missing or invalid value renders nothing in \`Calendar\` and an empty label on the trigger, with a development warning. It never throws. \`Input\` icon variants take an element (\`icon={<PencilIcon />}\`), not any \`ReactNode\`. \`ProgressIndicator\` throws on \`NaN\`, so guard \`done / total\` when \`total\` is 0.`
    - v6 migration skill, under `## Changes added by later 6.0 work items`: one "hard" row (`Input` icon variants: `icon` is `ReactElement`. Fix `icon={x && <Icon/>}` by choosing the variant from `x` instead, and wrap a string icon in an element). One "silent" row (`ProgressIndicator` now throws on `NaN`; check every `progress={a / b}` for `b === 0`).
    - CHANGELOG `[Unreleased]`: `### Changed` gets `- \`Input\` icon variants type \`icon\` as \`ReactElement\`; \`null\`/\`false\`/\`""\` icons throw \`[Input]\` (see \`dooph-design-system-v6-migration\`).` and `- \`ProgressIndicator\` throws on \`progress={NaN}\` instead of drawing a full ring.`. `### Fixed` (create after `### Changed` if no earlier WI has) gets `- \`Calendar\` renders nothing (with a dev warning) on a missing or invalid value or unknown \`mode\`, and \`DatePicker\` triggers show an empty label, instead of crashing.`
  - [ ] 9. Verify:
    - `npm run lint` → exit 0.
    - Build in a scratch worktree: `git worktree add <scratchpad>/wt-guards HEAD`, copy the changed `src/` files in, then `npm ci && npm run build`. `git -C <scratchpad>/wt-guards status --porcelain` → only the copied files.
    - `node docs/audit/_work/scratch/W7c/guards-check.cjs <scratchpad>/wt-guards` → every line `PASS`, exit 0. Repeat with `NODE_ENV=production` → every line `PASS`.
    - Type probe: copy `docs/audit/_work/scratch/V4/m42/` to `<scratchpad>/m42` and replace `C:/Users/stick/Github/dooph/dooph-ds-audit-build` with `<scratchpad>/wt-guards` in its tsconfig. `<scratchpad>/wt-guards/node_modules/.bin/tsc -p <scratchpad>/m42` → errors now also at probe.tsx:18 (`icon={null}`), :19 (`{undefined}`), :20 (`{maybe}`) and :21 (`{false}`). No new error appears elsewhere.
    - `rg -n "icon: ReactNode|warnOnBadValue\(|progress < 0 \|\| progress > 1" src` → no output.
    - Storybook: `Inputs/Input` icon stories render unchanged; Calendar/DatePicker stories behave as before; ProgressIndicator stories unchanged.
  - [ ] 10. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `guards-check.cjs` exits 0 against a build of the change in both dev and production; the m42 tsc probe rejects `icon={null|undefined|false}`; arch SKILL.md states the `ReactElement`-slot rule; the v6 migration skill lists the `icon` type change and the NaN throw.
- log:
  - 2026-10-01 — created by audit

### WI-C7-05: Write the element-access rule for every component, and give HotkeyIndicator, MorphRotationShape, ShapeMorphSpinner and SplitButton `forwardRef` plus rest props (composing MorphRotationShape's own ref)
- status: todo
- addresses: [F-039]
- depends_on: [WI-C6-07]
- phase: P3
- risk: low.
  - HotkeyIndicator already spreads its rest props. Only its type and ref change.
  - SplitButton's rest props are additive.
  - MorphRotationShape is the one behaviour change. A consumer ref used to replace `spanRef` (React 19 passes `ref` as a prop, and `{...spanProps}` came after `ref={spanRef}`), which froze the shape. Now both refs get the span. The layout effect's listeners stay on the span itself, as the header requires (:41-44).
  - Other WIs edit these files, so match by content, not line number: WI-C1-02 (MorphRotationShape `shapes` type, ShapeMorphSpinner), WI-C4-16 (ShapeMorphSpinner colour), WI-C4-21, WI-C5-14 and WI-C7-03 (HotkeyIndicator), WI-C5-06 and WI-C5-07 (SplitButton).
  - If WI-C5-07 has landed, the composite's root is `<SplitButtonGroup>`. Pass `ref` and `{...props}` to it instead of the `<div>`.
- semver: minor
- files:
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:44-49 @ b436647`
  - modify: `src/components/HotkeyIndicator/HotkeyIndicator.tsx:1,9-32 @ b436647`
  - modify: `src/components/MorphRotationShape/MorphRotationShape.tsx:56-64,165-182,341-348 @ b436647`
  - modify: `src/components/MorphRotationShape/MorphRotationShape.stories.tsx:2,117 @ b436647` (one story appended)
  - modify: `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:7,47-72 @ b436647`
  - modify: `src/components/SplitButton/SplitButton.tsx:3,71-96 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // MorphRotationShape.tsx:165-182
  export const MorphRotationShape = (props: MorphRotationShapeProps) => {
    assertProps(props);
    const key = useShapesKey(props.shapes);
    return <MorphRotationShapeInner key={key} {...props} />;
  };

  const MorphRotationShapeInner = ({
    mode,
    shapes,
    timing,
    activeIndex,
    restingAngle,
    onStepComplete,
    className,
    style,
    ...spanProps
  }: MorphRotationShapeProps) => {
    const spanRef = useRef<HTMLSpanElement>(null);
  // MorphRotationShape.tsx:342-348
      <span
        ref={spanRef}
        data-mode={mode}
        aria-hidden={spanProps.role ? undefined : true}
        className={cn("ds-shape-morph block", className)}
        style={{ ...(styleVars as CSSProperties), ...style }}
        {...spanProps}
  // SplitButton.tsx:80-89
  function SplitButton({
    actionProps,
    triggerProps,
    icon,
    children,
    className,
    disabled,
  }: SplitButtonProps) {
    return (
      <div className={cn("inline-flex rounded-tight shadow-button", className)}>
  ```
- why: Radix `asChild` triggers merge a ref and handlers into their child. That works around the 110 forwardRef-plus-spread components and fails around these four. TypeScript rejects `ref` on HotkeyIndicator although Slot injects one. SplitButton drops every handler and `aria-*`. On MorphRotationShape and ShapeMorphSpinner a consumer ref silently replaces the internal one, so the shape freezes with no error. The contribution checklist covers only wrapped Radix parts, so nothing stops the next component from repeating this (F-039 items 1, 2, 3, 6).
- steps:
  - [ ] 1. Reproduce (fails today).
    - `C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/.bin/tsc -p docs/audit/_work/scratch/W7c/access-probe` → 9 errors. Lines 13-16 (HotkeyIndicator, SplitButton, MorphRotationShape and ShapeMorphSpinner refs) are this item's.
    - `node docs/audit/_work/scratch/W7c/access-probe/render.cjs "" 05` → `FAIL WI-C7-05 SplitButton rest props reach the root div`. The empty first argument selects the default audit build.
    - Add the story from step 5 first and open `Progress/MorphRotationShape` → "Forwarded Ref" with the Browser pane visible. A hidden pane freezes rAF. The status reads `ref: SPAN`, but after clicking "Next shape" the shape does not move and `landed` stays 0: the consumer ref won the spread and `spanRef` is null.
  - [ ] 2. contribution SKILL.md:44-49. Replace the heading `**Radix wrapping (if applicable):**` and its first two items (`- [ ] \`forwardRef\` on every wrapped Radix part`, `- [ ] \`...props\` spread onto the Radix element`) with:
    ```md
    **Element access (every component that renders its own element, Radix-wrapped or not):**
    - [ ] `forwardRef` to the element that owns the component's role (the Radix element when wrapping Radix)
    - [ ] `...props` spread onto that same element, typed from it (`HTMLAttributes<…>`, `ComponentPropsWithoutRef<…>`, `SVGProps<…>`)
    - [ ] If the component needs its own ref to that element as well, compose the two with `useComposedRefs` (`src/utils/composeRefs.ts`). Never let spread order decide, because one ref then silently replaces the other (MorphRotationShape once froze this way).
    - [ ] A pure pass-through, which spreads ALL its props into a forwardRef component and renders nothing else of its own (the icon and shape leaves into `BaseIcon`/`BaseShape`), meets the two lines above by declaring `ref` in its props type. React 19, the peer minimum, passes `ref` as a prop.
    - [ ] Sole exception: `DropdownCaret`, an `aria-hidden` decorative part whose header forbids state props and listeners (Rule 7)

    **Radix wrapping (if applicable):**
    ```
    Keep the remaining three items (`className={cn(…)}`, `displayName`, `data-[state]`) under the Radix heading as they are, and move `displayName` up into the new list.
  - [ ] 3. HotkeyIndicator.tsx:
    - :1 `import { type HTMLAttributes } from 'react';` → `import { forwardRef, type HTMLAttributes } from 'react';`.
    - Turn the function (:9-32) into a forwardRef component with the same body, and put `ref={ref}` first on the `<span>`:
      ```tsx
      const HotkeyIndicator = forwardRef<HTMLSpanElement, HotkeyIndicatorProps>(
        ({ keys, pressed = false, className, ...props }, ref) => (
          <span ref={ref} className={cn('inline-flex items-center gap-1', className)} {...props}>
            {keys.map((key, i) => (
              /* the existing <kbd> element, unchanged */
            ))}
          </span>
        ),
      );
      HotkeyIndicator.displayName = 'HotkeyIndicator';
      ```
    - Keep whatever WI-C4-21, WI-C5-14 or WI-C7-03 changed in the body (`data-pressed`, the `menu` variant, `active`).
  - [ ] 4. MorphRotationShape.tsx:
    - Imports (:56-64): add `forwardRef,` and `type ForwardedRef,`. Add `import { useComposedRefs } from "../../utils/composeRefs";` after the `cn` import (:65). The helper comes from WI-C6-07.
    - Replace :165-169 with:
      ```tsx
      export const MorphRotationShape = forwardRef<HTMLSpanElement, MorphRotationShapeProps>(
        (props, ref) => {
          assertProps(props);
          const key = useShapesKey(props.shapes);
          return <MorphRotationShapeInner key={key} {...props} forwardedRef={ref} />;
        },
      );
      MorphRotationShape.displayName = "MorphRotationShape";
      ```
    - Inner (:171-182): add `forwardedRef,` after `style,` in the destructure. Change the parameter type to `MorphRotationShapeProps & { forwardedRef: ForwardedRef<HTMLSpanElement> }`. After `const spanRef = useRef<HTMLSpanElement>(null);` add `const composedRef = useComposedRefs(spanRef, forwardedRef);`.
    - JSX (:342-348): delete `ref={spanRef}` from the top of the `<span>`. After `{...spanProps}` add:
      ```tsx
          /* Last, and composed: a consumer ref must never displace spanRef — the
           * sampling loop and the listeners read it (see ## constraints). */
          ref={composedRef}
      ```
    - The header needs no change. Listeners stay on the span (:41-44), and nothing new writes `d` or the transform (:38-40).
  - [ ] 5. MorphRotationShape.stories.tsx. Change :2 to `import { useEffect, useRef, useState } from "react";` and append after :117:
    ```tsx
    /** A consumer ref must reach the span WITHOUT displacing the component's own:
     *  the status shows the span's tag, and every click still lands a step. */
    function ForwardedRefDemo() {
      const ref = useRef<HTMLSpanElement>(null);
      const [index, setIndex] = useState(0);
      const [landed, setLanded] = useState(0);
      const [tag, setTag] = useState("–");
      useEffect(() => setTag(ref.current?.tagName ?? "null"), []);
      return (
        <div className="flex flex-col items-center gap-4">
          <span className="relative block size-[120px] text-primary">
            <MorphRotationShape
              ref={ref}
              mode={MorphRotationShapeMode.controlled}
              shapes={[CloverShape, PuffShape]}
              activeIndex={index}
              onStepComplete={() => setLanded((n) => n + 1)}
              className="absolute inset-[11px]"
            />
          </span>
          <Button variant={ButtonVariant.secondary} onClick={() => setIndex((i) => i + 1)}>
            <ButtonText>Next shape</ButtonText>
          </Button>
          <ButtonText>ref: {tag} · landed: {landed}</ButtonText>
        </div>
      );
    }

    export const ForwardedRef: Story = { render: () => <ForwardedRefDemo /> };
    ```
  - [ ] 6. ShapeMorphSpinner.tsx:
    - :7 → `import { forwardRef, type ComponentPropsWithoutRef, type ComponentType } from "react";`.
    - Replace :47-72 with the same body wrapped in forwardRef, passing `ref` on:
      ```tsx
      export const ShapeMorphSpinner = forwardRef<HTMLSpanElement, ShapeMorphSpinnerProps>(
        (
          {
            size = LoadingSpinnerSize.md,
            color = LoadingSpinnerColor.primary,
            shapes = SHAPE_MORPH_SPINNER_SHAPES,
            timing,
            className,
            style,
            "aria-label": ariaLabel = "Loading",
            ...rest
          },
          ref,
        ) => (
          <MorphRotationShape
            ref={ref}
            /* the existing props, unchanged, through {...rest} */
          />
        ),
      );
      ShapeMorphSpinner.displayName = "ShapeMorphSpinner";
      ```
    - The role and size divergence stays with F-072. Do not change it here.
  - [ ] 7. SplitButton.tsx:
    - :3 → `import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";`.
    - Replace :71-96 with:
      ```tsx
      export interface SplitButtonProps extends HTMLAttributes<HTMLDivElement> {
        actionProps?: SplitButtonActionProps;
        triggerProps?: SplitButtonTriggerProps;
        icon?: ReactNode;
        disabled?: boolean;
      }

      const SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>(
        ({ actionProps, triggerProps, icon, children, className, disabled, ...props }, ref) => (
          <div
            ref={ref}
            className={cn("inline-flex rounded-tight shadow-button", className)}
            {...props}
          >
            <SplitButtonAction icon={icon} disabled={disabled} {...actionProps}>
              {children}
            </SplitButtonAction>
            <SplitButtonTrigger disabled={disabled} {...triggerProps} />
          </div>
        ),
      );
      SplitButton.displayName = "SplitButton";
      ```
    - `children` and `className` now come from `HTMLAttributes`, so their explicit lines go.
  - [ ] 8. CHANGELOG `[Unreleased]`:
    - `### Added`: `- \`HotkeyIndicator\`, \`MorphRotationShape\`, \`ShapeMorphSpinner\` and \`SplitButton\` forward their ref; \`SplitButton\` passes rest props (\`id\`, \`aria-*\`, handlers) to its root.`
    - `### Fixed` (create it after `### Changed` if no earlier WI has): `- A ref on \`MorphRotationShape\`/\`ShapeMorphSpinner\` no longer freezes the shape.`
  - [ ] 9. Verify:
    - `npm run lint` → exit 0. The new story's `ref={ref}` now type-checks.
    - Build in a scratch worktree: `git worktree add <scratchpad>/wt-access HEAD`, copy the changed files in, then `npm ci && npm run build`. `git -C <scratchpad>/wt-access status --porcelain` → only the copied files.
    - Copy `docs/audit/_work/scratch/W7c/access-probe/` to `<scratchpad>/access-probe` and replace `C:/Users/stick/Github/dooph/dooph-ds-audit-build` with `<scratchpad>/wt-access` in its tsconfig. `<scratchpad>/wt-access/node_modules/.bin/tsc -p <scratchpad>/access-probe` → no error on lines 13-16.
    - `node docs/audit/_work/scratch/W7c/access-probe/render.cjs <scratchpad>/wt-access 05` → both lines `PASS`.
    - Storybook "Forwarded Ref" (pane visible) → `ref: SPAN`; each "Next shape" click morphs the shape and increments `landed`. `Progress/ShapeMorphSpinner` stories still spin. `Controlled`/`EmbeddedDropdownCaret` are unchanged.
    - `rg -n "^\*\*Element access" .agents/skills/dooph-ds-contribution/SKILL.md` → 1 hit.
  - [ ] 10. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when:
  - probe lines 13-16 compile against a build of the change;
  - `render.cjs … 05` exits 0;
  - the Forwarded Ref story lands steps with a ref attached;
  - the contribution checklist's element-access section names `useComposedRefs` and the DropdownCaret exception.
- log:
  - 2026-10-01 — created by audit

### WI-C7-06: Open BaseIcon and BaseShape to `ref` and SVG rest props, so every icon, every shape and SidebarWithHoverIcon reach their `<svg>`
- status: todo
- addresses: [F-039]
- depends_on: [WI-C7-05]
- phase: P3
- risk: low.
  - Additive on every icon and shape: new optional props, and a consumer `style` merges after the size and stroke values.
  - With no new props the markup is byte-identical. The rest spread sits before `aria-hidden`/`class`/`style`, so attribute order is unchanged (step 7 checks it).
  - One default changes: an icon given `aria-label` or `aria-labelledby` and no explicit `aria-hidden` is no longer hidden. Unlabelled icons stay `aria-hidden="true"`.
  - The 89 icon leaves and SidebarWithHoverIcon already spread their props into BaseIcon, so none of them needs an edit. Under React 19 (peer `>=19`) `ref` arrives as a prop and flows through that spread into BaseIcon's forwardRef.
  - The 12 shape leaves destructure named props, so each one gains a `...rest`.
  - Other WIs edit these files, so match by content, not line number: WI-C4-22 (BaseIcon `style` object), WI-C4-13 (`IconSizes` → `IconSize`), WI-C1-09 (the `export default` lines and the shape leaves' `import BaseShape` default import), WI-C4-02 (PentagonShape and PuffShape fill), WI-C7-03 (SidebarWithHoverIcon `hovered` → `active`).
- semver: minor
- files:
  - modify: `src/components/Icons/BaseIcon.tsx:1,17-26,38-66 @ b436647`
  - modify: `src/components/Shapes/BaseShape.tsx:1-13,51-67 @ b436647`
  - modify: `src/components/Shapes/{Arrow,Capsule,Clover,Cookie,Diamond,Double,Pentagon,Pixircle,Puff,Squircle,Star,Triple}Shape.tsx:10,13 @ b436647` (12 files, the same two-line edit)
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:398 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:191 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // BaseIcon.tsx:17-26
  export interface IconProps {
    size?: IconSizes | number;
    color?: string;
    strokeWidth?: number | string;
    strokeColor?: string;
    fillColor?: string;
    className?: string;
    children?: React.ReactNode;
    "aria-hidden"?: boolean | "true" | "false";
  }
  // BaseIcon.tsx:38-55
  export const BaseIcon = ({
    size = IconSizes.rg,
    color,
    strokeWidth,
    strokeColor,
    className,
    fillColor,
    children,
    "aria-hidden": ariaHidden = true,
  }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className={cn("shrink-0", className)}
  // BaseShape.tsx:4-9
  export interface ShapeProps {
    size: number;
    strokeColor?: string;
    fillColor?: string;
    strokeWeight?: number | string;
  }
  // CloverShape.tsx:6-13 (all 12 leaves have this shape)
  export const CloverShape = ({
    size,
    strokeColor,
    fillColor = "currentColor",
    strokeWeight,
  }: ShapeProps) => {
    return (
      <BaseShape
  ```
- why: Icons and shapes take a closed list of props. An icon placed directly under a Radix `asChild` trigger drops the trigger's ref and handlers, so the trigger never opens. A meaningful icon cannot get an accessible name, an `id` or a `data-*` hook. A shape cannot even take `className` (F-039 item 4).
- steps:
  - [ ] 1. Reproduce (fails today).
    - `C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/.bin/tsc -p docs/audit/_work/scratch/W7c/access-probe` → errors on lines 17-19: CheckIcon `aria-label`/`onClick`/`ref`/`style`, SidebarWithHoverIcon `ref`/`onClick`, CloverShape `className`/`ref`.
    - `node docs/audit/_work/scratch/W7c/access-probe/render.cjs "" 06` → four `FAIL` lines.
    - Save the HEAD markup for step 7 into `<scratchpad>/icons-head.txt` (the `<scratchpad>` folder must exist): `node -e "const B='C:/Users/stick/Github/dooph/dooph-ds-audit-build';const R=require(B+'/node_modules/react'),S=require(B+'/node_modules/react-dom/server'),d=require(B+'/dist/index.cjs');console.log([d.CheckIcon,d.ChevronDownIcon].map(c=>S.renderToStaticMarkup(R.createElement(c,{}))).join('\n')+'\n'+S.renderToStaticMarkup(R.createElement(d.SquircleShape,{size:24}))+'\n'+S.renderToStaticMarkup(R.createElement(d.SidebarWithHoverIcon,{})))" > <scratchpad>/icons-head.txt`.
  - [ ] 2. BaseIcon.tsx:
    - :1 add `import { forwardRef, type ReactNode, type Ref, type SVGProps } from "react";` above the `cn` import.
    - Replace :17-26 with:
      ```tsx
      type IconOwnProps = {
        size?: IconSizes | number;
        color?: string;
        strokeWidth?: number | string;
        strokeColor?: string;
        fillColor?: string;
        className?: string;
        children?: ReactNode;
        "aria-hidden"?: boolean | "true" | "false";
      };

      /** Own props, plus every `<svg>` attribute and handler, plus `ref`. `ref` is
       *  declared because icon leaves are plain functions that spread their props
       *  into BaseIcon; React 19 passes `ref` as a prop, so it rides that spread. */
      export type IconProps = IconOwnProps &
        Omit<SVGProps<SVGSVGElement>, keyof IconOwnProps | "ref"> & {
          ref?: Ref<SVGSVGElement>;
        };
      ```
    - Replace :38-66 with a forwardRef component. Keep the attribute order and the style values (or WI-C4-22's, if it has landed):
      ```tsx
      export const BaseIcon = forwardRef<SVGSVGElement, IconProps>(
        (
          {
            size = IconSizes.rg,
            color,
            strokeWidth,
            strokeColor,
            className,
            fillColor,
            children,
            "aria-hidden": ariaHidden,
            style,
            ...props
          },
          ref,
        ) => (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
            ref={ref}
            // Decorative by default; a labelled icon is meaningful, so it is not hidden.
            aria-hidden={ariaHidden ?? (props["aria-label"] || props["aria-labelledby"] ? undefined : true)}
            className={cn("shrink-0", className)}
            style={{
              width: size,
              height: size,
              fill: fillColor ?? undefined,
              stroke: strokeColor ?? color ?? "currentColor",
              strokeWidth: strokeWidth ?? "var(--ui-icon-stroke-width)",
              ...style,
            }}
          >
            {children}
          </svg>
        ),
      );
      BaseIcon.displayName = "BaseIcon";
      ```
    - Leave the JSDoc example at :34-36 as it is: `(props: IconProps) => <BaseIcon {...props}>` is still the right way to build an icon, and it now forwards `ref` too.
  - [ ] 3. BaseShape.tsx:
    - :1 `import type { ReactNode } from "react";` stays. Change :2 to `import { BaseIcon, type IconProps } from "../Icons";`.
    - Replace :4-9 with:
      ```tsx
      /** Shape props plus the icon's `<svg>` passthrough (`className`, `aria-*`,
       *  handlers, `ref`). Shapes size by `size` and paint by fill/stroke, so the
       *  icon's `size`/`strokeWidth`/`color` are replaced, not inherited. */
      export interface ShapeProps
        extends Omit<IconProps, "size" | "strokeWidth" | "color" | "children"> {
        size: number;
        strokeColor?: string;
        fillColor?: string;
        strokeWeight?: number | string;
      }
      ```
    - In BaseShape (:51-57), add `...rest` after `children,`. Put `{...rest}` first on `<BaseIcon` (before `size={size}`), so the shape's own size, stroke and fill still win.
  - [ ] 4. The 12 shape leaves. In each of `ArrowShape`, `CapsuleShape`, `CloverShape`, `CookieShape`, `DiamondShape`, `DoubleShape`, `PentagonShape`, `PixircleShape`, `PuffShape`, `SquircleShape`, `StarShape` and `TripleShape` `.tsx`:
    - :10 `  strokeWeight,` → `  strokeWeight,` + new line `  ...rest`.
    - :13 `    <BaseShape` → `    <BaseShape` + new line `      {...rest}`.
    - Nothing else changes. `getShapePath` keys on the component identity, which stays the same.
  - [ ] 5. SidebarWithHoverIcon.tsx needs no edit. `SidebarWithHoverIconProps extends IconProps` (:56) and `<BaseIcon {...iconProps}>` (:133) now carry rest props and `ref` to the `<svg>`. The `## constraints` line at :19-23 forbids the component binding listeners to an ancestor it does not own. Handlers a consumer puts on the icon's own `<svg>` are not that, so the header stays as it is.
  - [ ] 6. Docs and changelog:
    - codebase SKILL.md:398, after `…stroke from \`--ui-icon-stroke-width\`, 1.5).`: add ` \`BaseIcon\` forwards \`ref\` and every \`<svg>\` attribute; icon and shape leaves spread their props into it, so \`ref\`, \`aria-*\`, \`id\`, handlers and \`style\` (merged last) reach the \`<svg>\` of every icon, shape and \`SidebarWithHoverIcon\`. An icon with \`aria-label\` is not \`aria-hidden\`.`
    - usage SKILL.md:191: after `` `SidebarWithHoverIcon`.`` add ` Icons and shapes take \`ref\` and any \`<svg>\` prop. Give a meaningful icon \`aria-label\` (plus \`role="img"\`) and it stops being \`aria-hidden\`.`
    - CHANGELOG `[Unreleased]` `### Added`: `- Every icon, every shape and \`SidebarWithHoverIcon\` forward \`ref\` and \`<svg>\` props (\`aria-*\`, \`id\`, handlers, \`style\`); shapes accept \`className\`. A labelled icon is no longer \`aria-hidden\`.`
  - [ ] 7. Verify:
    - `npm run lint` → exit 0. This covers all 89 icon leaves, the 12 shapes, MorphRotationShape's `ComponentType<ShapeProps>` and SidebarWithHoverIcon.
    - Build in a scratch worktree: `git worktree add <scratchpad>/wt-icons HEAD`, copy the changed files in, then `npm ci && npm run build`. `git -C <scratchpad>/wt-icons status --porcelain` → only the copied files; `src/components/Icons/index.ts` is unchanged.
    - `node docs/audit/_work/scratch/W7c/access-probe/render.cjs <scratchpad>/wt-icons 06` → four `PASS` lines.
    - Re-run step 1's `node -e` command with `B='<scratchpad>/wt-icons'`, writing to `<scratchpad>/icons-new.txt`. `diff <scratchpad>/icons-head.txt <scratchpad>/icons-new.txt` → no output (byte-identical with no new props). Skip this diff if WI-C4-22 landed between the two runs, since it changes the style string on purpose.
    - Retarget the access-probe tsconfig to `<scratchpad>/wt-icons` (as in WI-C7-05 step 9) → no error on lines 17-19.
    - Storybook `Icons/BaseIcon`, `Icons/SidebarWithHoverIcon` and `Bits & Pieces/Shapes` are unchanged. In the SidebarWithHoverIcon toggle story the rail still bows on hover.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when:
  - `render.cjs … 06` exits 0 against a build of the change;
  - access-probe lines 17-19 compile;
  - the no-props icon, shape and rail markup is byte-identical to HEAD.
- log:
  - 2026-10-01 — created by audit

### WI-C7-07: Give Calendar `forwardRef` and root rest props, and give DatePicker `triggerProps` and `contentProps`
- status: todo
- addresses: [F-039]
- depends_on: [WI-C7-05]
- phase: P3
- risk: low — every addition is optional.
  - Calendar's root keeps its own `data-mode`, `className` merge and Escape handler. These are written after `{...rest}`, so the consumer cannot override them by accident.
  - A consumer `onKeyDown` runs first. If it calls `preventDefault()`, the pending-anchor reset is skipped, which is Radix's `composeEventHandlers` rule.
  - `selected`/`onSelect` stay out of the rest props. `CalendarSharedProps` omits the div's native `onSelect`/`defaultValue`, so a stray `onSelect` is still a type error and never becomes a DOM handler.
  - The `triggerProps` type omits `mode`/`value`/`disabled`/`today`/`locale`, so the picker stays the one owner of those.
  - Other WIs edit these files, so match by content: WI-C7-03 (renames `selected`/`onSelect` → `value`/`onValueChange`; read the destructure below with the new names if it has landed), WI-C7-04 (wraps Calendar in a validating outer component; it notes how to carry this item's `ref` through), WI-C3-09 (Calendar.tsx:149 comment).
- semver: minor
- files:
  - modify: `src/components/Calendar/Calendar.tsx:3-10,30-45,124-136,318-329,360-364 @ b436647`
  - modify: `src/components/DatePicker/DatePicker.tsx:3-4,15-33,53-68,96-130 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:170,175 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:164-167 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // Calendar.tsx:124-136
  function Calendar(props: CalendarProps) {
    const {
      mode,
      month,
      onMonthChange,
      disabled,
      yearBounds,
      renderDay,
      locale,
      today: todayProp,
      children,
      className,
    } = props;
  // Calendar.tsx:318-329
    return (
      <div
        data-mode={mode}
        className={cn("flex items-stretch", className)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && pendingAnchor) {
            // Abandon the pending anchor; the committed value is untouched.
            setPendingAnchor(null);
            setHoveredDay(null);
          }
        }}
      >
  // DatePicker.tsx:130
        <PopoverContent>
  ```
- why: A consumer cannot give the DatePicker trigger an `id` for `<label htmlFor>`, an `aria-label` or `aria-describedby`, or set the panel's `align`/`side`. Calendar's root takes no `id`, `aria-*`, `data-*`, `style` or ref. Both are invisible to assistive tech labelling and to an `asChild` parent. DatePickerSplitTrigger already solves this with `triggerProps` (F-039 item 5).
- steps:
  - [ ] 1. Reproduce (fails today).
    - `C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/.bin/tsc -p docs/audit/_work/scratch/W7c/access-probe` → errors on line 20 (Calendar `id`/`aria-label`/`ref`) and line 21 (DatePicker `triggerProps`/`contentProps`).
    - `node docs/audit/_work/scratch/W7c/access-probe/render.cjs "" 07` → two `FAIL` lines.
  - [ ] 2. Calendar.tsx — types and imports:
    - :3-10: add `forwardRef,` and `type HTMLAttributes,` to the react import.
    - :30: `type CalendarSharedProps = {` → `type CalendarSharedProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue" | "children" | "className"> & {`. The own `children`/`className` lines (:43-44) stay. The native `onSelect`/`defaultValue` are omitted so they cannot collide with the value props.
  - [ ] 3. Calendar.tsx — the component:
    - :124 `function Calendar(props: CalendarProps) {` → `const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {`.
    - Extend the destructure (:125-136) to:
      ```tsx
        const {
          mode,
          month,
          onMonthChange,
          disabled,
          yearBounds,
          renderDay,
          locale,
          today: todayProp,
          children,
          className,
          onKeyDown,
          // Read through `props` below so the mode union still narrows them;
          // named here only to keep them off the root <div>.
          selected: _selected,
          onSelect: _onSelect,
          ...rest
        } = props;
      ```
    - The root (:318-329):
      ```tsx
          <div
            ref={ref}
            {...rest}
            data-mode={mode}
            className={cn("flex items-stretch", className)}
            onKeyDown={(event) => {
              // Consumer first; a consumer preventDefault() opts out (Radix's rule).
              onKeyDown?.(event);
              if (event.defaultPrevented) return;
              if (event.key === "Escape" && pendingAnchor) {
                // Abandon the pending anchor; the committed value is untouched.
                setPendingAnchor(null);
                setHoveredDay(null);
              }
            }}
          >
      ```
    - :360 `}` → `});`. Keep `Calendar.displayName = "Calendar";` (:362) and `export { Calendar };` (:364).
  - [ ] 4. DatePicker.tsx:
    - :3 → `import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react";`.
    - Before the shared type, add `type DatePickerTriggerOwnedProps = "mode" | "value" | "disabled" | "today" | "locale";`.
    - In `DatePickerSharedProps` (:15-33), after `className?: string;` add:
      ```tsx
        /** Props for the trigger button — `id` (for `<label htmlFor>`), `aria-*`,
         *  handlers, `className`. The picker owns mode/value/disabled/today/locale. */
        triggerProps?: Omit<ComponentPropsWithoutRef<typeof DatePickerTrigger>, DatePickerTriggerOwnedProps>;
        /** Props for the popover panel — `align`, `side`, `sideOffset`, `aria-*`, `className`. */
        contentProps?: ComponentPropsWithoutRef<typeof PopoverContent>;
      ```
    - Add `triggerProps,` and `contentProps,` to the destructure (:54-68).
    - Spread `{...triggerProps}` FIRST on each of the three `<DatePickerTrigger` elements (:96, :109, :118), so the picker's own props after it win.
    - Set `className={triggerProps?.className}` on the split one (:96-102). The picker's `className` goes on the split container there.
    - Change `className={className}` → `className={cn(className, triggerProps?.className)}` at :115 and :124. Add `import { cn } from "../../utils/cn";`.
    - :130 `<PopoverContent>` → `<PopoverContent {...contentProps}>`.
  - [ ] 5. Docs and changelog:
    - codebase SKILL.md:170, Calendar row: append `; \`ref\` + \`<div>\` rest props on the root` to the last cell.
    - codebase SKILL.md:175, DatePicker row: append `; \`triggerProps\` (trigger button) and \`contentProps\` (PopoverContent)`.
    - usage SKILL.md:164-167: after `inline.` add ` Label the trigger with \`<DatePicker triggerProps={{ id: "due" }} />\` and \`<label htmlFor="due">\`; place the panel with \`contentProps={{ align: "end" }}\`. \`Calendar\` takes \`ref\`, \`id\` and \`aria-*\` on its root.`
    - CHANGELOG `[Unreleased]` `### Added`: `- \`DatePicker\` \`triggerProps\` / \`contentProps\`; \`Calendar\` forwards \`ref\` and root \`<div>\` props.`
  - [ ] 6. Verify:
    - `npm run lint` → exit 0. `noUnusedLocals` does not flag `_selected`/`_onSelect`, because they have a rest sibling.
    - Build in a scratch worktree: `git worktree add <scratchpad>/wt-dates HEAD`, copy the two files in, then `npm ci && npm run build`. `git -C <scratchpad>/wt-dates status --porcelain` → only the copied files.
    - `node docs/audit/_work/scratch/W7c/access-probe/render.cjs <scratchpad>/wt-dates 07` → two `PASS` lines.
    - Retarget the access-probe tsconfig to `<scratchpad>/wt-dates` (as in WI-C7-05 step 9) → no error on lines 20-21.
    - Storybook `Dates/Calendar` range story: click one day, press Escape → the pending anchor clears as before. `Dates/DatePicker` stories still open, commit and close.
    - `rg -n "<PopoverContent>" src/components/DatePicker/DatePicker.tsx` → no output.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `render.cjs … 07` exits 0 against a build of the change; access-probe lines 20-21 compile; Escape still clears a pending range anchor.
- log:
  - 2026-10-01 — created by audit

### WI-C7-08: Make VerificationCodeInput entry sequential, so a digit always lands where it shows and focus never sits past the first empty cell
- status: todo
- addresses: [F-040]
- depends_on: []
- phase: P3
- risk: low. The public value stays a gapless digit string, so no consumer type or value changes. Visible behaviour changes in one way: focusing an empty cell beyond the first empty one (tap, Tab, ArrowRight) now moves focus to the first empty cell. Today the next digit typed there lands in that first cell anyway, but the caret jumps one past the cell that was focused. Typing in order, paste, ArrowLeft and Backspace behave as before. Other WIs edit this file: WI-C7-03 (`onChange` → `onValueChange`) and WI-C7-11 (`hasError`). This item touches only `writeDigit`, the cell's `onFocus` and the header, so match by content.
- semver: patch
- files:
  - modify: `src/components/VerificationCode/VerificationCodeInput.tsx:4-8,86-92,141-155 @ b436647`
  - modify: `src/components/VerificationCode/VerificationCode.stories.tsx:37 @ b436647` (one story inserted after `Disabled`)
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // VerificationCodeInput.tsx:86-92
      const writeDigit = (index: number, raw: string) => {
        const digit = onlyDigits(raw).slice(-1);
        const next = Array.from({ length }, (_, i) => value[i] ?? "");
        next[index] = digit;
        setValue(next.join(""));
        if (digit && index < length - 1) focusAt(index + 1);
      };
  ```
- why: `join("")` drops empty slots, so the value cannot hold a hole. On touch, a user who taps the fourth box first and types 7 sees it appear in box 1 while the caret jumps to box 5. This is mis-entry in a sign-in flow, and the consumer cannot work around it (F-040).
- steps:
  - [ ] 1. Reproduce (fails today). Run Storybook and open `Inputs/VerificationCode` → `Empty` (uncontrolled). In the preview iframe's console:
    ```js
    const cells = [...document.querySelectorAll('input[aria-label^="Digit"]')];
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    const type = (el, ch) => { el.focus(); set.call(el, ch); el.dispatchEvent(new Event('input', { bubbles: true })); };
    cells[3].focus(); const focusedAfterTap = cells.indexOf(document.activeElement);
    type(document.activeElement, '7');
    await new Promise((r) => setTimeout(r, 50));
    [focusedAfterTap, cells.map((c) => c.value).join('|'), cells.indexOf(document.activeElement)]
    ```
    Today this returns `[3, "7|||||", 4]`: box 4 takes focus, the 7 shows in box 1, and focus jumps to box 5.
  - [ ] 2. VerificationCodeInput.tsx, `writeDigit` (:86-92). Never write past the first empty cell:
    ```tsx
        const writeDigit = (index: number, raw: string) => {
          const digit = onlyDigits(raw).slice(-1);
          // The value is a gapless string, so a digit can only go into a filled
          // cell or the first empty one. Clamp, so a stale focus cannot place it
          // out of position.
          const at = Math.min(index, value.length);
          const next = Array.from({ length }, (_, i) => value[i] ?? "");
          next[at] = digit;
          setValue(next.join(""));
          if (digit && at < length - 1) focusAt(at + 1);
        };
    ```
  - [ ] 3. The cell list (:141-155). After `onPaste={onPaste}` add:
    ```tsx
              // Entry is sequential: an empty cell past the first empty one cannot
              // hold a digit (the value has no holes), so focus moves back to it.
              onFocus={() => {
                if (index > value.length) focusAt(value.length);
              }}
    ```
  - [ ] 4. Header `## behavior` (:7). The contract ships with the code. Replace `* - Digits only; auto-advance, backspace to previous, arrow navigation, paste.` with:
    ```
     * - Digits only; auto-advance, backspace to previous, arrow navigation, paste.
     * - Entry is sequential: the value is a gapless digit string, so focusing an
     *   empty cell beyond the first empty one moves focus to the first empty cell.
     *   Backspace on a filled middle cell deletes that digit; later digits shift
     *   left and focus stays on the same cell.
    ```
  - [ ] 5. Story. Insert after `Disabled` (:35-37) in VerificationCode.stories.tsx:
    ```tsx
    /** Entry is sequential: click any empty cell past the first empty one and focus
     *  moves back to the first empty cell, so a digit always lands where it shows.
     *  Backspace on a filled middle cell deletes it and shifts later digits left. */
    export const NonSequentialEntry: Story = {
      args: { defaultValue: "123" },
    };
    ```
  - [ ] 6. CHANGELOG `[Unreleased]` `### Fixed` (create it after `### Changed` if no earlier WI has): `- \`VerificationCodeInput\`: focusing an empty cell past the first empty one moves focus to the first empty cell, so a typed digit lands where it shows.`
  - [ ] 7. Verify:
    - `npm run lint` → exit 0.
    - Re-run step 1 on `Empty` → `[0, "7|||||", 1]`.
    - On `Non Sequential Entry` (value "123"), run `cells[5].focus(); cells.indexOf(document.activeElement)` → `3`.
    - On `Filled`, reload and run `cells[2].focus(); cells[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));`, then after 50 ms `[cells.map((c) => c.value).join('|'), cells.indexOf(document.activeElement)]` → `["1|2|4|5|6|", 2]`. This is unchanged and now documented.
    - On `Partial` ("123"), `type(cells[1], '9')` → `"1|9|3|||"` and focus on index 2. Overwriting a filled cell still works.
    - `Controlled` still echoes the value.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: step 7's console checks return the stated arrays; the header's `## behavior` states sequential entry; the `NonSequentialEntry` story exists.
- log:
  - 2026-10-01 — created by audit

### WI-C7-09: Name the open-value const exception in arch:120, and in 6.0.0 rename `ProgressIndicatorVariants` → `ProgressIndicatorVariant`, `FontAxes` → `FontAxis`, `TrackingValue` → `Tracking` (recommended D-14 option)
- status: blocked(D-14)
- addresses: [F-045]
- depends_on: [WI-RELEASE-OPEN]
- phase: P4
- risk: medium. Each rename is a compile error for a consumer who imports the old name. That is the intended, visible failure, and the migration skill lists all three. No runtime value changes: the const objects keep their keys and string values. The arch edit is rule text only. Other WIs edit these files: WI-C1-08 (ProgressIndicator's folder index and src/index.ts routing), WI-C2-11 (ProgressIndicator JSDoc), WI-C7-04 (ProgressIndicator :269/:292), WI-C3-05 (the loading-indicators skill) and WI-C3-02 (skill mirroring). Match by content.
- semver: major
- files:
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:65-69,120 @ b436647`
  - modify: `src/components/ProgressIndicator/constants.ts:8,18-19 @ b436647`
  - modify: `src/components/ProgressIndicator/ProgressIndicator.tsx:21-24,273,284,311 @ b436647`
  - modify: `src/components/ProgressIndicator/ProgressIndicator.stories.tsx:8,19,38,59,95,115 @ b436647`
  - modify: `src/components/AIChat/AIContextGauge.tsx:26,43 @ b436647`
  - modify: `src/components/Text/constants.ts:73,88,99,147-148 @ b436647`
  - modify: `src/components/Text/index.ts:29,35-48 @ b436647`
  - modify: `src/components/Text/BaseText.tsx:59 @ b436647`
  - modify: `src/components/Text/BaseText.stories.tsx:17,334-379 @ b436647`
  - modify: `.agents/skills/dooph-ds-loading-indicators/SKILL.md:37-38 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:80,322 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:255,269 @ b436647`
  - modify: `skills/dooph-design-system-v6-migration/SKILL.md` (created by WI-RELEASE-OPEN)
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```ts
  // ProgressIndicator/constants.ts:8, :18-19
  export const ProgressIndicatorVariants = {
  export type ProgressIndicatorVariant =
    (typeof ProgressIndicatorVariants)[keyof typeof ProgressIndicatorVariants];
  // Text/constants.ts:73
  export type TrackingValue = (typeof Tracking)[keyof typeof Tracking];
  // Text/constants.ts:88, :99
  export const FontAxes = {
  export type FontAxis = (typeof FontAxes)[keyof typeof FontAxes];
  ```
  ```md
  <!-- arch SKILL.md:120 -->
  - The const object and the derived type share the **same identifier** (TypeScript allows a value and a type to share a name).
  ```
- why: The rule at arch:120 contradicts its own example: arch:65-69 and :77-78 sanction the plural `Fonts`/`FontSizes`/`FontWeights`/`Tracking`. Obeying one half breaks the other. `ProgressIndicatorVariants` and `FontAxes` are plain violations. A consumer writing `ProgressIndicatorVariant.wavy` by analogy with `LoadingSpinnerVariant` gets "only refers to a type". `TrackingValue` is the one `*Value` that names a closed union rather than the open prop type (F-045).
- steps:
  - [ ] 1. Confirm D-14 chose the recommended option (amend the rule for the three open-value consts, rename the rest in the major) and D-01 chose 6.0.0. If D-14 chose "rename every type to match", stop and redraft this item. Record the baseline sweep:
    ```bash
    for f in src/components/*/constants.ts src/components/Icons/BaseIcon.tsx; do for c in $(rg -o "^export const (\w+) = \{" -r '$1' "$f"); do rg -q "^export type $c\b" "$f" || echo "$f: $c"; done; done
    ```
    → today 7 lines: CalendarPresets, ProgressIndicatorVariants, Fonts, FontSizes, FontWeights, Tracking, FontAxes.
  - [ ] 2. arch SKILL.md. The rule text lands now. It stays true before the renames ship, because it names what must change.
    - Replace :120 with:
      ```md
      - The const object and the derived type share the **same identifier** (TypeScript allows a value and a type to share a name). Exception, by name only: the plural open-value consts `Fonts`, `FontSizes` and `FontWeights` name their closed token union in the singular (`Font`, `FontSize`, `FontWeight`). Their open prop type is `<Singular>Value`. Every other const, including the open-value `IconSize` and `Tracking`, shares one identifier with its type. A `*Value` type is always the open prop union, never the closed one.
      ```
    - In the Rule 1 example (:65-69), insert after `} as const;` (:68): `export type FontWeight = (typeof FontWeights)[keyof typeof FontWeights];`.
    - If WI-C4-13 has not renamed `IconSizes` → `IconSize` by the time this lands, write `IconSizes` in the sentence instead.
  - [ ] 3. ProgressIndicator:
    - constants.ts:8 `export const ProgressIndicatorVariants = {` → `export const ProgressIndicatorVariant = {`.
    - :18-19 → `export type ProgressIndicatorVariant =\n  (typeof ProgressIndicatorVariant)[keyof typeof ProgressIndicatorVariant];`.
    - ProgressIndicator.tsx:21-24 → `import { ProgressIndicatorVariant } from "./constants";`. This one import carries both the value and the type.
    - Rename `ProgressIndicatorVariants.` → `ProgressIndicatorVariant.` at :273, :284 and :311.
    - AIContextGauge.tsx:26 → `import { ProgressIndicatorVariant } from "../ProgressIndicator/constants";`, and :43 → `variant={ProgressIndicatorVariant.flat}`.
    - ProgressIndicator.stories.tsx: rename at :8, :19, :38, :59, :95 and :115.
    - loading-indicators SKILL.md:37-38: delete the sentence `Note \`ProgressIndicator\`'s const is plural\n(\`ProgressIndicatorVariants\`) while its type is singular (\`ProgressIndicatorVariant\`).`. Then re-sync its `.claude` copy with whatever mechanism WI-C3-02 left in place.
  - [ ] 4. Text:
    - constants.ts:73 `export type TrackingValue = (typeof Tracking)[keyof typeof Tracking];` → `export type Tracking = (typeof Tracking)[keyof typeof Tracking];`.
    - :147 `export type LetterSpacingValue = TrackingValue | (string & {}) | number;` → `export type LetterSpacingValue = Tracking | (string & {}) | number;`.
    - :88 `export const FontAxes = {` → `export const FontAxis = {`.
    - :99 → `export type FontAxis = (typeof FontAxis)[keyof typeof FontAxis];`.
    - :148 `` `{ [FontAxes.grade]: 20, ROND: 100 }` `` → `` `{ [FontAxis.grade]: 20, ROND: 100 }` ``.
    - Keep `FontAxesValue` (:149) as it is.
    - Text/index.ts: in the value export (:28-35), `FontAxes,` → `FontAxis,`. In the type export (:36-48), delete the `FontAxis,` and `TrackingValue,` lines. The value exports `FontAxis` and `Tracking` now carry their types, as `TextVariant` already does. Listing them twice is a duplicate-export error.
    - BaseText.tsx:59 `[FontAxes.grade]` → `[FontAxis.grade]`.
    - BaseText.stories.tsx: `FontAxes` → `FontAxis` at :17 and in every `[FontAxes.…]` at :334-379 (11 occurrences).
  - [ ] 5. Skills:
    - codebase SKILL.md:80 `FontWeights/Tracking/FontAxes)` → `FontWeights/Tracking/FontAxis)`.
    - codebase SKILL.md:322 `` `Tracking`, `FontAxes` `` → `` `Tracking`, `FontAxis` ``.
    - usage SKILL.md:255 `Tracking, FontAxes }` → `Tracking, FontAxis }`.
    - usage SKILL.md:269 `` `{ [FontAxes.grade]: 40 }` `` → `` `{ [FontAxis.grade]: 40 }` ``.
  - [ ] 6. Migration skill and changelog.
    - v6 migration skill, under `## Changes added by later 6.0 work items`, add three "hard" rename rows: `ProgressIndicatorVariants` → `ProgressIndicatorVariant` (const; the type keeps its name), `FontAxes` → `FontAxis` (const; the type keeps its name), and `TrackingValue` → `Tracking` (type).
    - Give the word-boundary patterns `(?<![\w$])ProgressIndicatorVariants(?![\w$])`, `(?<![\w$])FontAxes(?![\w$])` and `(?<![\w$])TrackingValue(?![\w$])`, with the `-P`/no-PCRE2 fallback the skill uses (R13.9). `FontAxes` must not match inside `FontAxesValue`, so the boundary matters.
    - If WI-RELEASE-OPEN added a codemod, add the three names to its AUTO map.
    - CHANGELOG `[Unreleased]` `### Changed`: `- Renamed \`ProgressIndicatorVariants\` → \`ProgressIndicatorVariant\`, \`FontAxes\` → \`FontAxis\`, type \`TrackingValue\` → \`Tracking\` (see \`dooph-design-system-v6-migration\`).`
  - [ ] 7. Verify:
    - `npm run lint` → exit 0.
    - Re-run step 1's sweep → only CalendarPresets, Fonts, FontSizes and FontWeights. The first is a factory; the other three are the named exception.
    - `rg -n "ProgressIndicatorVariants|\bFontAxes\b|TrackingValue" src skills .agents` → hits only in `skills/dooph-design-system-v6-migration/` (and its codemod).
    - Build in a scratch worktree: `git worktree add <scratchpad>/wt-names2 HEAD`, copy the changed files in, then `npm ci && npm run build`. `git -C <scratchpad>/wt-names2 status --porcelain` → only the copied files.
    - In the built `dist/index.d.ts` (or the chunk it re-exports), `rg -n "ProgressIndicatorVariant\b|FontAxis\b|type Tracking\b"` finds the new names. `node -e "const d=require('<scratchpad>/wt-names2/dist/index.cjs');console.log(d.ProgressIndicatorVariant.wavy,d.FontAxis.grade,d.ProgressIndicatorVariants,d.FontAxes)"` → `wavy GRAD undefined undefined`.
    - Storybook `BaseText` axes stories and the ProgressIndicator stories render as before.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when:
  - the step-1 sweep lists only CalendarPresets, Fonts, FontSizes and FontWeights;
  - arch:120 names that exception;
  - the old names appear only in the v6 migration skill;
  - `npm run lint` exits 0.
- log:
  - 2026-10-01 — created by audit

### WI-C7-10: Move `AvatarSize` and `Shapes` into sibling `constants.ts` files and shrink the codebase skill's exception list to BaseIcon
- status: todo
- addresses: [F-065]
- depends_on: []
- phase: P2
- risk: low. The public surface is unchanged: `src/index.ts` re-exports both folders with `export *`, and each folder index still exports the same names. Avatar.tsx has no `"use client"` today, so moving the const changes no chunk's directive. The move keeps `AvatarSize.small` server-readable even after Avatar later gains client state. Two stories import `AvatarSize` from `./Avatar` and must switch to the folder index. WI-C1-02 changes which `Shapes` keys MorphRotationShape accepts and imports `Shapes` from `../Shapes`. That path still resolves, so match by content.
- semver: none
- files:
  - create: `src/components/Avatar/constants.ts`
  - modify: `src/components/Avatar/Avatar.tsx:1-8 @ b436647`
  - modify: `src/components/Avatar/index.ts:1 @ b436647`
  - modify: `src/components/Avatar/Avatar.stories.tsx:3 @ b436647`
  - modify: `src/components/OutlineSection/OutlineSection.stories.tsx:2 @ b436647`
  - create: `src/components/Shapes/constants.ts`
  - modify: `src/components/Shapes/index.ts:14-29 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:640-641 @ b436647`
- anchor:
  ```tsx
  // Avatar.tsx:1-8
  import { forwardRef, type HTMLAttributes } from "react";
  import { cn } from "../../utils/cn";

  export const AvatarSize = {
    standard: "standard",
    small: "small",
  } as const;
  export type AvatarSize = (typeof AvatarSize)[keyof typeof AvatarSize];
  // Shapes/index.ts:13-15
  export * from "./TripleShape";

  export const Shapes = {
  ```
- why: AvatarSize is server-safe only because Avatar.tsx happens to have no `"use client"`. Avatar is the component most likely to gain client state, such as an image-load fallback. The day it does, `AvatarSize.small` in a Server Component turns into a client reference and breaks. The codebase skill calls the inline form "equivalent", while the contribution checklist (:70) forbids it. `Shapes` sits in the barrel, which the skill's exception list does not mention (F-065).
- steps:
  - [ ] 1. Baseline: `rg -l "^export const [A-Z][a-z]\w* = \{" src/components --glob '!**/constants.ts' --glob '!*.stories.tsx'` → today 3 files: Avatar/Avatar.tsx, Icons/BaseIcon.tsx, Shapes/index.ts. The PascalCase pattern skips SCREAMING_CASE data tables such as `SPINNER_DIAMETERS`.
  - [ ] 2. Create `src/components/Avatar/constants.ts`:
    ```ts
    // Server-safe constants — no "use client" so React Server Components can read
    // these values. Avatar.tsx imports them; the folder index re-exports them.

    export const AvatarSize = {
      standard: "standard",
      small: "small",
    } as const;
    export type AvatarSize = (typeof AvatarSize)[keyof typeof AvatarSize];
    ```
    In Avatar.tsx, delete :4-8 and add `import { AvatarSize } from "./constants";` after the `cn` import (:2).
    - Avatar/index.ts:1 → `export { Avatar } from "./Avatar";` followed by `export { AvatarSize } from "./constants";`.
    - Avatar.stories.tsx:3 → `import { Avatar, AvatarSize } from ".";`.
    - OutlineSection.stories.tsx:2 → `import { Avatar, AvatarSize } from '../Avatar';`.
  - [ ] 3. Create `src/components/Shapes/constants.ts` with the same server-safe header comment ("…ShapeButton and MorphRotationShape read these keys; the folder index re-exports them."), followed by the `Shapes` const and type exactly as at Shapes/index.ts:15-29. Replace Shapes/index.ts:14-29 with an empty line and `export * from "./constants";`. Do NOT change `ShapeButton/constants.ts:4` (`import type { Shapes } from "../Shapes";`), since it resolves through the barrel.
  - [ ] 4. codebase SKILL.md:640-641 — replace `client. Every component with consts follows this, except \`Avatar\` and\n  \`BaseIcon\`, which declare theirs inline in server-safe modules — equivalent.` with `client. Every component with consts follows this, except \`BaseIcon\`, which\n  declares \`IconSize\` inline in a module that must stay server-safe (it has no hooks).` Use `IconSizes` if WI-C4-13 has not landed. The contribution checklist (:70) already states the rule and needs no edit.
  - [ ] 5. Verify:
    - `npm run lint` → exit 0.
    - Re-run step 1's rg → only `src/components/Icons/BaseIcon.tsx`.
    - Build in a scratch worktree: `git worktree add <scratchpad>/wt-consts HEAD`, copy the changed and new files in, then `npm ci && npm run build`. `git -C <scratchpad>/wt-consts status --porcelain` → only those files, so there is no generated drift.
    - `node -e "const d=require('<scratchpad>/wt-consts/dist/index.cjs');console.log(d.AvatarSize.small,d.Shapes.clover)"` → `small clover`.
    - `rg -n "AvatarSize|Shapes" <scratchpad>/wt-consts/dist/index.d.ts` → at least one hit each, or a re-export line naming the chunk that declares them.
    - The dist chunk that declares `AvatarSize` starts without `"use client"`: `rg -l "var AvatarSize" <scratchpad>/wt-consts/dist/*.js | xargs head -1`.
    - Storybook `Avatar` and `OutlineSection` stories render.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `AvatarSize` and `Shapes` live in `constants.ts` files; step 1's rg lists only BaseIcon.tsx; the codebase skill names only BaseIcon as the exception; the built package still exports both consts.
- log:
  - 2026-10-01 — created by audit

### WI-C7-11: Make Input's `hasError` set `aria-invalid` on its `<input>`, as CodeDigitInput already does
- status: todo
- addresses: [F-070]
- depends_on: []
- phase: P3
- risk: low. An errored Input now carries `aria-invalid="true"`, so screen readers announce "invalid entry". That is the intent, and the visuals are unchanged. The attribute is written ahead of `...props`, so a consumer's own `aria-invalid` still wins, which is CodeDigitInput's order (:82 then :90). WI-C7-04 edits Input.tsx :12/:28-31/:59/:99-103 and codebase SKILL.md:148, and WI-C6-07 edits Input.tsx :83-88 (`setRefs`). Match by content.
- semver: patch
- files:
  - modify: `src/components/Input/Input.tsx:4-13,105-106 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:148 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // Input.tsx:105-113
      const fieldProps = {
        ...props,
        ref: setRefs,
        value,
        defaultValue,
        onChange: handleChange,
        placeholder,
        disabled,
      };
  ```
- why: The same prop gives an announced error state on VerificationCodeInput's cells and a purely visual one on Input. A consumer who relies on `hasError` for an accessible form ships Inputs whose errors assistive technology never hears (F-070).
- steps:
  - [ ] 1. Reproduce (fails today): `node docs/audit/_work/scratch/W7c/invalid-check.cjs`. It defaults to the audit build of b436647. Expect three `FAIL` lines (text, iconText and number Inputs with `hasError` have no `aria-invalid` on the `<input>`) and exit 1. The three control checks pass: explicit `aria-invalid={false}`, no `hasError`, and VerificationCodeInput.
  - [ ] 2. Input.tsx:105-106. `fieldProps` feeds the `<input>` in all three branches (:118, :200, :208):
    ```diff
         const fieldProps = {
    +      // Before ...props, so a consumer's explicit aria-invalid still wins
    +      // (the CodeDigitInput order).
    +      "aria-invalid": hasError || undefined,
           ...props,
    ```
  - [ ] 3. Header `## behavior`. The contract ships with the code. After :12 (`…value. The icon variants require \`icon\`.`, or WI-C7-04's wording if it has landed), add:
    ```
     * - `hasError` paints the danger chrome and sets `aria-invalid` on the
     *   `<input>` (a consumer's own `aria-invalid` wins).
    ```
    The `## constraints` (:15-31) are untouched. `aria-invalid` lands on the `<input>`, as :8-9 requires ("every other prop, and `ref`, always land on the `<input>`").
  - [ ] 4. codebase SKILL.md:148: `+ \`hasError\` bool.` → `+ \`hasError\` bool (danger chrome + \`aria-invalid\` on the input, as \`CodeDigitInput\`).`
  - [ ] 5. CHANGELOG `[Unreleased]` `### Fixed` (create it after `### Changed` if no earlier WI has): `- \`Input\`: \`hasError\` sets \`aria-invalid\` on the \`<input>\`, matching \`CodeDigitInput\`.`
  - [ ] 6. Verify:
    - `npm run lint` → exit 0.
    - Build in a scratch worktree: `git worktree add <scratchpad>/wt-invalid HEAD`, copy Input.tsx in, then `npm ci && npm run build`. `git -C <scratchpad>/wt-invalid status --porcelain` → only Input.tsx.
    - `node docs/audit/_work/scratch/W7c/invalid-check.cjs <scratchpad>/wt-invalid` → six `PASS` lines, exit 0.
    - In the Storybook `Inputs/Input` error story, read_page shows the inputs as `invalid`.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `invalid-check.cjs` exits 0 against a build of the change; Input.tsx's `## behavior` names the `aria-invalid` effect.
- log:
  - 2026-10-01 — created by audit

### WI-C7-12: Give PopoverContent the shared floating-panel look — popovers border, modal surface, menu shadow, 6px offset — unless Figma 499:1894 says otherwise
- status: todo
- addresses: [F-071]
- depends_on: [WI-C4-11]
- phase: P3
- risk: low — visual only. Every Popover and the DatePicker panel changes:
  - border `border-primary` → `border-popovers`;
  - background `surface-primary` → `modal-surface` (dark: `#000000` → `#212124`);
  - shadow `shadow-button` → `shadow-menu`;
  - the panel sits 2px further from its trigger.
  - A consumer who set `className` or `sideOffset` on PopoverContent keeps their value: `cn` lets a later class win, and `sideOffset` is still an overridable default.
  - WI-C4-11 adds the reduced-motion line after :52, and WI-C4-03 later replaces it. This item edits only :33 and :49, so it depends on WI-C4-11 only to keep the two Popover commits ordered. WI-C7-07 passes `contentProps` through DatePicker and needs no change here.
- semver: minor
- files:
  - modify: `src/components/Popover/Popover.tsx:33,47-49 @ b436647`
  - modify: `src/styles/tokens.css:122-123 @ b436647` (comment only)
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:40 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // Popover.tsx:31-34
        className,
        align = "start",
        sideOffset = 4,
        collisionPadding = 8,
  // Popover.tsx:47-49
          className={cn(
            "z-50 overflow-hidden rounded-normal",
            "border border-solid border-border-primary bg-surface-primary shadow-button",
  ```
- why: tokens.css:122-123 names the popovers-border, modal-surface and menu-shadow trio as the shared floating-panel look. Modal, Sheet, Toast and DropdownMenu use it; PopoverContent alone uses the control border, the page surface and the small control shadow, with a 4px offset where menus use 6px. Inside the package's own DatePicker, the caption's month menu opens on top of the popover with a different border, background and shadow (F-071).
- steps:
  - [ ] 1. Reproduce. Run Storybook and open `Dates/DatePicker`. Open the picker, then open the caption's month dropdown, so both panels are on screen. In the preview iframe's console:
    ```js
    [...document.querySelectorAll('[data-radix-popper-content-wrapper] > *')].map((p) => { const s = getComputedStyle(p); return [p.getAttribute('role'), s.backgroundColor, s.borderTopColor, s.boxShadow]; })
    ```
    → two rows (`dialog`, `menu`) whose colour and shadow values differ. Repeat with the dark theme toggled. The backgrounds then read `rgb(0, 0, 0)` and `rgb(33, 33, 36)`.
  - [ ] 2. Check the design source before changing anything. Open Figma file `Ue4w95t0OjmvpJPJ6EE9bn`, node `499:1894` (Date Picker Menu), cited at `.claude/research/2026-08-27-date-picker-foundation-research.md:663`. Read the panel's border, fill and shadow variables (Figma MCP `get_variable_defs` / `get_design_context` on that node).
    - If they are the modal-border / modal-surface / menu-shadow variables, or the node does not specify them, do steps 3-5.
    - If Figma deliberately uses border-primary / surface-primary / the button shadow, skip steps 3-5. Instead, add this comment above Popover.tsx:47:
      ```tsx
          // Figma 499:1894 (Date Picker Menu) specifies the control border, page surface
          // and button shadow: the popover is intentionally lighter than menus/modals.
      ```
      Record that outcome in this item's log, and go to step 6.
  - [ ] 3. Popover.tsx:
    - :33 `sideOffset = 4,` → `sideOffset = 6,`, matching DropdownMenu.tsx:116.
    - :49 `"border border-solid border-border-primary bg-surface-primary shadow-button",` → `"border border-solid border-border-popovers bg-modal-surface shadow-menu",`, the trio DropdownMenu.tsx:161-163, Modal.tsx:71-73 and Sheet.tsx:70-71 use.
  - [ ] 4. tokens.css:122-123 comment: `* for Figma modal-border, shared by modal/menu/toast panels) */` → `* for Figma modal-border, shared by modal/menu/toast/popover panels) */`. This is a comment in a hand-written token source. Run `npm run sync-tokens` and confirm that `git status --porcelain` shows no change to `src/styles/theme.css` or to the generated block in `src/styles/index.css`.
  - [ ] 5. token-contract.md:40: `floating panel border shared by menus, modals, and toasts.` → `floating panel border shared by menus, modals, popovers (and the DatePicker panel), and toasts.`
  - [ ] 6. CHANGELOG `[Unreleased]` `### Changed`: `- \`PopoverContent\` (and the \`DatePicker\` panel) uses the shared floating-panel look — \`border-popovers\`, \`modal-surface\`, \`shadow-menu\` — and a 6px default \`sideOffset\`, matching menus and modals.` If step 2 chose the comment-only branch, skip this line.
  - [ ] 7. Verify:
    - `npm run lint` → exit 0.
    - Re-run step 1's console line in light and in dark → both rows report the same `backgroundColor`, `borderTopColor` and `boxShadow`.
    - `rg -n "border-border-primary bg-surface-primary shadow-button" src/components/Popover/Popover.tsx` → no output.
    - `Overlays/Popover` stories still open from their trigger with the panel 6px away.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: in the DatePicker story the popover panel and the caption menu compute equal background, border and shadow in both themes (or Popover.tsx carries the Figma-cited comment and the log records why); `npm run lint` exits 0.
- log:
  - 2026-10-01 — created by audit

## DONE
