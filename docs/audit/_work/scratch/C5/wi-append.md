
### WI-C5-16: Document that DropdownMenuSearch is not keyboard-reachable inside the menu, as DropdownMenuPlainItem documents its own limit
- status: todo
- addresses: [F-094]
- depends_on: [WI-C5-10, WI-C5-13]
- phase: P1
- risk: low — comments, JSDoc and a story doc comment; no behaviour change. The JSDoc ships in the d.ts, so consumers see the limit in IntelliSense. A real keyboard path (focus hand-off between the input and Radix's roving items, or a combobox) is a design change that R2.10/R2.11 constrain and is out of scope here.
- semver: none
- files:
  - modify: `src/components/Menu/DropdownMenuSearch.tsx:4-9,34 @ b436647` (header `## behavior` list; JSDoc above the component)
  - modify: `src/components/Menu/DropdownMenu.stories.tsx:427 @ b436647`
- anchor:
  ```tsx
  // DropdownMenuSearch.tsx:4-9
   * ## behavior
   * - Renders icon + native input + optional Esc hotkey; no bordered chrome
   *   (unlike SearchBox). Compose above a separator inside DropdownMenuContent.
   * - Forwards ref to the input. Stops keydown propagation so Radix typeahead
   *   does not steal keystrokes while typing.
   *
  // DropdownMenuSearch.tsx:34
  const DropdownMenuSearch = forwardRef<HTMLInputElement, DropdownMenuSearchProps>(
  // DropdownMenu.tsx:226-231 (the precedent)
   * but interactive children (e.g. a ToggleSwitch) are pointer-only inside a
   * Radix menu: Radix's roving focus skips this plain div, Tab is prevented by
   * the menu content, arrow keys are only handled when the content itself is
   * the target, and letter keys start typeahead instead of reaching the child.
   * Consumers must provide a keyboard-reachable equivalent (e.g. radio-select
   * items, or a control outside the menu).
  ```
- why: Inside `DropdownMenuContent` Radix prevents Tab and moves focus only among its own items, and the search input stops keydown propagation, so a keyboard user can neither reach the field nor arrow from it into the results (F-094). DropdownMenuPlainItem documents the same class of limit; DropdownMenuSearch, its header, its JSDoc and the `ComplexWithSearch` story that consumers copy do not.
- steps:
  - [ ] 1. Reproduce: Storybook `Menus/DropdownMenu/Complex With Search` — open the menu with the keyboard (focus the trigger, press Enter/ArrowDown) and try to reach the search with Tab or arrows: focus never lands on the input, and from a pointer-focused input ArrowDown does not move into the list.
  - [ ] 2. DropdownMenuSearch.tsx header — append as the LAST bullet of `## behavior` (before the ` *` line that precedes `## constraints`; WI-C5-10 and WI-C5-13 edit earlier bullets of the same list):
    ```
     * - Not keyboard-reachable inside DropdownMenuContent: Radix prevents Tab
     *   there and moves focus only among its own items, and this input stops
     *   keydown propagation, so ArrowDown never reaches the menu. As with
     *   DropdownMenuPlainItem, consumers must give keyboard users another path —
     *   filter from the trigger (TypeableDropdownTrigger) or search outside the menu.
    ```
    The `## constraints` block is unchanged.
  - [ ] 3. Above :34 add a JSDoc that ships in the d.ts:
    ```tsx
    /**
     * Slim search row for complex dropdown compositions (opt-in; place above a
     * separator inside DropdownMenuContent).
     *
     * Keyboard limit: inside a Radix menu this input cannot be reached with Tab
     * or the arrow keys, and ArrowDown from it does not move into the items.
     * Provide a keyboard path too — filter from the trigger
     * (`TypeableDropdownTrigger`) or put the search outside the menu.
     */
    ```
  - [ ] 4. DropdownMenu.stories.tsx — above :427 `export const ComplexWithSearch: Story = {` add `/** Pointer-first composition: \`DropdownMenuSearch\` is not keyboard-reachable inside the menu (see its JSDoc) — ship a keyboard path alongside it. */`.
  - [ ] 5. Verify: `npm run lint` → exit 0. `rg -n "Keyboard limit|Not keyboard-reachable" src/components/Menu` → 2 lines (DropdownMenuSearch.tsx). Build in a scratch worktree → `git status --porcelain` empty and `dist/components/Menu/DropdownMenuSearch.d.ts` contains "Keyboard limit". Storybook `Complex With Search` docs panel shows the new story description.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the limitation is stated in the header, in the shipped JSDoc and on the story; no code changed.
- log:
  - 2026-10-01 — created by audit

## DONE
