
### WI-C3-14: Record the invariant-form rule in AGENTS.md, promote four comment-borne invariants into header contracts, and put the header above the directive in the three files that invert it
- status: blocked(D-17)
- addresses: [F-103]
- depends_on: [WI-C1-01]
- phase: P2
- risk: medium — putting a header above `"use client"` moves the directive past line 5. Before WI-C1-01 that silently drops it from the dist chunk (F-011), hence the dependency. Header text that over-states a rule would bind future edits wrongly; each constraint below quotes the failure its current comment already records.
- semver: none
- files:
  - modify: `AGENTS.md:1-19 @ b436647` (append one bullet)
  - modify: `src/components/Table/Table.tsx:1-3 @ b436647`
  - modify: `src/components/DropdownTrigger/DropdownTrigger.tsx:1,82-97 @ b436647`
  - modify: `src/components/Slider/Slider.tsx:1,345-350 @ b436647`
  - modify: `src/components/Text/BaseText.tsx:1 @ b436647` (new header above the imports; the JSDoc at :40-52 stays for IntelliSense)
  - modify: `src/components/Menu/DropdownMenu.tsx:1-3 @ b436647`, `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:1-3 @ b436647`, `src/components/Toggle/Toggle.tsx:1-3 @ b436647` (move the directive below the header)
- anchor:
  ```tsx
  // Table.tsx:1-3
  // No "use client": no hooks, and onSort is a consumer-supplied passthrough.
  // Neutral module — it renders in either graph. It may import client components
  // (Button); that is normal composition, not a client boundary for this file.
  // Slider.tsx:345-350
              /* ds-radix-data-disabled, NOT `data-[disabled]:ds-disabled-state`.
               * That form was broken twice over: a Tailwind variant only composes
               * with a GENERATED utility, so pairing one with a package class
               * emits no rule at all — and `.ds-disabled-state` keys off
               * `:disabled`/`[aria-disabled]`, which a Radix Root <span> carrying
               * `data-disabled` never has. */
  // DropdownMenu.tsx:1-3 (likewise LinearProgressIndicator.tsx, Toggle.tsx)
  "use client";

  /*
  ```
- why: AGENTS.md's read-first and stop-and-raise rules attach only to the sectioned header. Four invariants that match fhc's triggers live in forms those rules do not cover: Table's deliberate missing directive, TypeableDropdownTrigger's pointer-down skip and focus pairing, Slider's twice-broken disabled selector, and BaseText's precedence order. A "simplify" edit can reverse any of them unchallenged (F-103).
- steps:
  - [ ] 1. Confirm WI-C1-01 has landed: `rg -n "slice\(0, 5\)" scripts/add-use-client.mjs` → no match. Otherwise stop.
  - [ ] 2. AGENTS.md: append under `## File contracts`: `- Invariants live in the header. A rule written elsewhere — a \`//\` note, JSDoc, an inline comment — carries none of the protection above; when you find one that a reasonable edit would violate, move it into the header (sectioned, or prose for a single invariant) and leave the explanation where it was.`
  - [ ] 3. Table.tsx:1-3 → prose header:
    ```tsx
    /*
     * Table — div-based data table (Table, TableHeader, TableRow, TableHeaderCell, …).
     * Deliberately has no "use client": it uses no hooks, and `onSort` is a
     * consumer-supplied passthrough, so the module renders in either graph.
     * Adding the directive would make every Table part a client reference for no
     * reason. Importing client components (Button) is composition, not a boundary.
     */
    ```
  - [ ] 4. DropdownTrigger.tsx: above `"use client";` (:1) insert
    ```tsx
    /*
     * DropdownTrigger — DropdownTrigger and TextDropdownTrigger (Slot-based menu
     * triggers) and TypeableDropdownTrigger (a search field used as a menu trigger).
     *
     * ## behavior
     * - TypeableDropdownTrigger's root is a div (Radix merges the trigger's button
     *   props onto it); `displayValue` shows the selection summary in the primary
     *   tone while the input is empty.
     * - Known limitation (multi): after a pointer toggle, focus sits on the item,
     *   so typing goes to Radix typeahead until the input is clicked again.
     *
     * ## constraints
     * - Radix toggles the menu on every trigger pointerdown; TypeableDropdownTrigger
     *   skips that when the target is the input. Without the skip, every click into
     *   the field closes the menu mid-typing.
     * - Pair it with `DropdownMenuContent focusOnOpen={false}`: content's
     *   onOpenAutoFocus otherwise moves focus off the input on open.
     * - Never refocus the input from content: that trips the non-modal
     *   focus-outside dismissal.
     */
    ```
    and shrink the mid-file block (:82-97) to `/* TypeableDropdownTrigger — see the file header for its pointer and focus constraints. */`. This drops the "Long-term fix: a combobox" TODO (R11.13); codebase:223 already records it.
  - [ ] 5. Slider.tsx: above `'use client';` (:1) insert a prose header: `/*` / ` * Slider — SliderContinuous / SliderStepped / SliderLabeled on Radix Slider.` / `` * Disabled styling on the Radix Root uses `ds-radix-data-disabled`, never `` / `` * `data-[disabled]:ds-disabled-state`: a Tailwind variant on a package class `` / `` * emits no rule, and `.ds-disabled-state` keys off `:disabled`/`[aria-disabled]`, `` / ` * which the Root <span> never has. That form shipped broken twice.` / ` */`. Then shrink :345-350 to `/* disabled: see the file header */`.
  - [ ] 6. BaseText.tsx: above the imports (:1) insert a prose header: `/*` / ` * BaseText — role text with typography props. Props are written as INLINE style` / ` * so they beat the consumer's className, which beats the role class (\`.text-style-*\`,` / ` * in \`@layer components\`); \`style\` outranks props. Never move a typography prop` / ` * to a class: the class-based version silently dropped two of its three props` / ` * on cascade order (and \`fontSize\` to tailwind-merge).` / ` */`. Keep the JSDoc at :40-52.
  - [ ] 7. DropdownMenu.tsx, LinearProgressIndicator.tsx, Toggle.tsx: move the `"use client";` / `'use client';` line from :1 to directly after the header's closing ` */`, deleting the blank line :2 (R11.9, fhc:158).
  - [ ] 8. Verify: `npm run lint` → exit 0. In a scratch worktree with this change on top of WI-C1-01, `npm ci && npm run build`, then `head -1 dist/components/{DropdownTrigger/DropdownTrigger,Slider/Slider,Menu/DropdownMenu,LinearProgressIndicator/LinearProgressIndicator,Toggle/Toggle}.js` → each `"use client";`, and `head -1 dist/components/Table/Table.js dist/components/Text/BaseText.js` → neither is a directive. Run WI-C1-01's `dist-stamp-check.mjs` → PASS. `rg -n "^// No \"use client\"|Long-term fix" src/components/Table/Table.tsx src/components/DropdownTrigger/DropdownTrigger.tsx` → no matches. `rg -l "## constraints" src/components/DropdownTrigger/DropdownTrigger.tsx` → 1.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: AGENTS.md states the invariant-form rule; the four invariants sit in headers; every header is the first thing in its file; dist stamping is unchanged for client modules and absent for Table and BaseText.
- log:
  - 2026-10-01 — created by audit
