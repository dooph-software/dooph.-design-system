
### WI-C4-15: Collapse the disabled mechanisms: one fade per control, data-[disabled] instead of JS ternaries, ds-disabled-state instead of ds-disabled-control, one hover guard in the Button family
- status: todo
- addresses: [F-026, F-061]
- depends_on: [WI-C4-14]
- phase: P3
- risk: medium — disabled visuals across several controls. (1) DropdownTrigger's chevron goes from 0.36 to 0.6 effective opacity in light mode (0.25 → 0.5 in dark), matching TypeableDropdownTrigger. (2) Input/Typeable wrappers keep their content-only model (surface not faded); only the mechanism changes. (3) Toggle/Tabs options and AIPromptInput's textarea get identical results from `ds-disabled-state` (nothing in them sets `aria-disabled`). (4) An `aria-disabled` SplitButton part or ShapeButton stops painting hover/press colours, and ShapeButton gains its disabled fill under `aria-disabled`.
- semver: patch
- files:
  - modify: `src/styles/index.css:855-859 @ b436647`
  - modify: `src/components/Input/Input.tsx:124 @ b436647`, `:163-170`
  - modify: `src/components/DropdownTrigger/DropdownTrigger.tsx:197-207 @ b436647`
  - modify: `src/components/Toggle/toggleOption.ts:16 @ b436647`, `:32`
  - modify: `src/components/AIChat/AIPromptInput.tsx:227 @ b436647`
  - modify: `src/components/SplitButton/SplitButton.tsx:25-26 @ b436647`, `:56-57`
  - modify: `src/components/ShapeButton/ShapeButton.tsx:68-77 @ b436647`, `:138`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:529 @ b436647`, `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```css
  /* index.css:855-859 */
    .ds-dropdown-caret-host:is(:disabled, [aria-disabled="true"], [data-disabled])
      .ds-dropdown-caret-chevron {
      color: var(--ui-color-secondary-foreground);
      opacity: var(--ui-opacity-disabled);
    }
  ```
  ```tsx
  // Input.tsx:163-170
            disabled
              ? "cursor-not-allowed bg-secondary-disabled border-secondary-border-disabled"
              : [
                  "cursor-text",
                  !hasError &&
                    "[&:hover:not(:focus-within)]:border-input-border-hover [&:hover:not(:focus-within)]:shadow-button-secondary",
                  "focus-within:border-input-border-focus",
                ],
  // SplitButton.tsx:25-26 (same at :56-57)
          "hover:enabled:bg-secondary-hover",
          "active:enabled:bg-secondary-active",
  ```
- why: Four disabled mechanisms and three helpers produce a double fade (DropdownTrigger), a disabled bare Input that still lifts on hover, emitted `data-disabled` attributes that nothing reads, a helper missing from R8.16, and hover guards that ignore `aria-disabled` (F-026, F-061).
- steps:
  - [ ] 1. Baseline V-PROBE (V5's render-disabled method): disabled DropdownTrigger in a DropdownMenu (root `opacity`, chevron `opacity`), disabled TypeableDropdownTrigger, disabled `Input` with and without `icon` (wrapper bg/border/cursor), disabled Toggle option, an `aria-disabled` SplitButtonAction and ShapeButton (fill colour; the hover rule match via `el.matches(':hover')` is not scriptable, so read the CSSOM rules for `hover:enabled` selectors).
  - [ ] 2. Double fade: a host that already fades as a whole must not fade its chevron again. index.css:855:
    ```css
    /* before */  .ds-dropdown-caret-host:is(:disabled, [aria-disabled="true"], [data-disabled])
    /* after  */  .ds-dropdown-caret-host:not(.ds-disabled-state):is(:disabled, [aria-disabled="true"], [data-disabled])
    ```
    Add a comment line above it: `/* Content-only fade, for hosts whose surface stays opaque (TypeableDropdownTrigger). A host carrying ds-disabled-state already fades as a whole. */`. DropdownCaret.tsx:21-22 ("Colours live in the .ds-dropdown-caret CSS … do not move them into props or classes here") is respected: the change stays in that CSS.
  - [ ] 3. Input.tsx:163-170 → style from the `data-disabled` the wrapper already emits (:155):
    ```tsx
            "cursor-text data-[disabled]:cursor-not-allowed data-[disabled]:bg-secondary-disabled data-[disabled]:border-secondary-border-disabled",
            !hasError &&
              "[&:hover:not(:focus-within):not([data-disabled])]:border-input-border-hover [&:hover:not(:focus-within):not([data-disabled])]:shadow-button-secondary",
            "focus-within:border-input-border-focus",
    ```
    Bare input `:124` `"hover:border-input-border-hover hover:shadow-button-secondary",` → `"enabled:hover:border-input-border-hover enabled:hover:shadow-button-secondary",`. DropdownTrigger.tsx:197-207 → the same shape keyed on `data-[disabled]` (it emits `data-disabled` at :248):
    ```tsx
            "cursor-text data-[disabled]:cursor-not-allowed data-[disabled]:bg-secondary-disabled data-[disabled]:border-secondary-border-disabled",
            "[&:hover:not(:focus-within):not([data-disabled])]:border-input-border-hover [&:hover:not(:focus-within):not([data-disabled])]:shadow-button-secondary",
            "focus-within:border-input-border-focus ds-focus-within-ring",
            // The ring carries its state in its own selector — a
            // `data-[state=open]:ds-focus-ring` variant composes a Tailwind
            // variant with a package class and emits no rule at all.
            "data-[state=open]:border-input-border-focus ds-focus-ring-on-open",
    ```
    The decorative icon fades (`disabled && "ds-opacity-disabled"` at Input.tsx:181, DropdownTrigger.tsx:250) stay: that is the content-only use the helper documents (dooph-component-tokens.css:322-323). Input.tsx's header (`className` lands on the chrome element; bare `<input>` stays bare) is consistent.
  - [ ] 4. Fold the third helper: toggleOption.ts:32 `"ds-disabled-control",` → `"ds-disabled-state",`. AIPromptInput.tsx:227 likewise. Header toggleOption.ts:16 "Disabled drops any fill; opacity comes from ds-disabled-control." → "Disabled drops any fill; opacity comes from ds-disabled-state." (same commit, AGENTS.md). The now-unused `.ds-disabled-control` rule is removed by WI-C4-27 (D-15). codebase SKILL.md:529 → mark it "unused; scheduled for removal".
  - [ ] 5. Hover guards: SplitButton.tsx:25-26 and :56-57 → `"[&:not(:disabled):not([aria-disabled=true])]:hover:bg-secondary-hover",` / `"[&:not(:disabled):not([aria-disabled=true])]:active:bg-secondary-active",` (Button.tsx:51's guard). ShapeButton.tsx shapeFillClasses (:68-77): `group-hover:` → `[.group:not(:disabled):not([aria-disabled=true]):hover_&]:` and `group-active:` → `[.group:not(:disabled):not([aria-disabled=true]):active_&]:` (e.g. `"[.group:not(:disabled):not([aria-disabled=true]):hover_&]:text-prominent-hover"`). :138 `"group-disabled:text-secondary-disabled"` → `"[.group:is(:disabled,[aria-disabled=true])_&]:text-secondary-disabled"`. These match the selectors the shadow helper already uses (dooph-component-tokens.css:47-57).
  - [ ] 6. CHANGELOG `[Unreleased]` → Fixed: "DropdownTrigger no longer fades its chevron twice; disabled bare Input no longer lifts on hover; aria-disabled SplitButton/ShapeButton no longer react to hover."
  - [ ] 7. Verify: V-LINT. `rg -n "disabled\s*\?\s*\"cursor-not-allowed|ds-disabled-control|hover:enabled|group-hover:text|group-disabled:" src/components --glob '!*.stories.tsx'` → 0 hits. V-BUILD. Re-run step 1. DropdownTrigger chevron `opacity` = `1` with root `0.6`; Typeable chevron `0.6` with root `1`. Input wrapper disabled bg `rgb(245, 245, 245)` and `cursor: not-allowed`, from the `data-[disabled]` rules. Toggle option disabled `opacity 0.6`. CSSOM shows the generated ShapeButton selectors exist (`[...rules].some(r=>r.selectorText?.includes(':not([aria-disabled=true]):hover'))`). Storybook `Menus/DropdownTriggers` disabled stories and `Inputs/Input` disabled.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: step-7 `rg` → 0 hits; a disabled DropdownTrigger's effective chevron opacity equals its root's; Input's `data-disabled` is read by a generated `data-[disabled]:` rule.
- log:
  - 2026-10-01 — created by audit
