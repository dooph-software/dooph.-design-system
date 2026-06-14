# Table Component — Implementation Prompt

You are implementing a new `Table` component family for the `@dooph-software/design-system` package. Follow these instructions exactly. Do not add, invent, or restructure anything not described here.

---

## Architecture rules (non-negotiable)

These apply to every component in this file. Read them first.

**1. forwardRef + spread + cn — always**
Every component is a `forwardRef`. Every component spreads `...props` onto its root element. Every component merges className via `cn(baseStyles, className)`. Mirror the exact pattern from `src/components/Button/Button.tsx` and `src/components/Avatar/Avatar.tsx`.

**2. No raw text elements — ever**
Do not render `<span>`, `<p>`, `<h1>`–`<h6>`, or any HTML text element directly. All text inside this component file must use the design system text components imported from `../../components/Text/BaseText`:
- `ButtonText` — for sortable header cell label inside the ghost button
- All other text that needs to appear in this file follows the same rule

The component cells (`TableCell`, `TableHeaderCell`) accept `children` only — consumers are responsible for passing `<BodyText />`, `<LabelText />`, `<ButtonText />`, or any other content they need. The DS does not dictate what consumers put inside cells.

**3. Dot-accessible variant enums**
Any prop with discrete options must be a `const` object exported alongside a derived type. The type always derives from the const — never a hand-written union. The const and type share the same identifier.

**4. Theme via tokens**
Use Tailwind token utilities (`bg-surface`, `border-border`, `text-ghost-fg`, etc.) exactly as other components do. Do not hard-code colour values.

**5. displayName on every forwardRef component**
Set `ComponentName.displayName = "ComponentName"` on every forwardRef.

---

## Files to create

```
src/components/Table/Table.tsx     ← all component code
src/components/Table/index.ts      ← barrel re-exports everything from Table.tsx
```

After creating those, add one line to `src/index.ts` (append with the other component exports):
```ts
export * from './components/Table';
```

---

## Sort direction enum

Export this from `Table.tsx`:

```ts
export const TableSortDirection = {
  none: "none",
  ascend: "ascend",
  descend: "descend",
} as const;
export type TableSortDirection = (typeof TableSortDirection)[keyof typeof TableSortDirection];
```

---

## Components

### 1. `Table`

**Element:** `<div>`

**Purpose:** Root layout shell. Sets the CSS custom property `--table-cols` which all child rows read for their `grid-template-columns`. Also establishes the flex column layout that allows `TablePlaceholder` to fill remaining vertical space.

**Props (in addition to all `HTMLAttributes<HTMLDivElement>`):**
- `columns: string` — a CSS `grid-template-columns` value, e.g. `"140px 130px 110px 1fr 170px"`. Required.

**Implementation:**
```tsx
<div
  ref={ref}
  className={cn("flex flex-col w-full", className)}
  style={{ "--table-cols": columns, ...style } as React.CSSProperties}
  {...props}
/>
```

---

### 2. `TableHeader`

**Element:** `<div>`

**Purpose:** The column header row. Reads `--table-cols` and lays out header cells in a grid matching the data rows below. Does not own sticky behaviour — the consumer adds `className="sticky top-0 z-10 bg-surface"` when they need it.

**Props:** All `HTMLAttributes<HTMLDivElement>`. No additional props.

**Implementation:**
```tsx
<div
  ref={ref}
  className={cn("grid border-b border-border", className)}
  style={{ gridTemplateColumns: "var(--table-cols)" }}
  {...props}
/>
```

---

### 3. `TableHeaderCell`

**Element:** `<div>` (non-sortable) or renders a `Button` inside (sortable)

**Purpose:** A single column header cell. In its default (non-sortable) state it is a plain padded container — the consumer passes whatever children they want (`<LabelText>`, `<BodyText>`, etc.). When `sortDirection` is provided, the cell renders its children inside a ghost `Button` that is full-width with left-aligned content, appending a sort direction icon to the right of the children.

**Props (in addition to all `HTMLAttributes<HTMLDivElement>`):**
- `sortDirection?: TableSortDirection` — when present, activates sortable mode
- `onSort?: () => void` — click handler for the sort button (only used when `sortDirection` is provided)

**Children:** Accepted and rendered as-is. Consumers supply their own text components.

**Non-sortable implementation:**
```tsx
<div
  ref={ref}
  className={cn("flex items-center px-4 py-3", className)}
  {...props}
/>
// children render inside directly
```

**Sortable implementation (when `sortDirection` is defined):**

Render a `Button` with `variant={ButtonVariant.ghost}` and `size={ButtonSize.sm}` that:
- Is `w-full` (fills the cell)
- Has `justify-start` (overrides the default `justify-center` on `Button`)
- On click calls `onSort`

Inside the button:
1. `<ButtonText>{children}</ButtonText>` — wraps the consumer's label in ButtonText style
2. A sort icon immediately after, chosen by `sortDirection`:
   - `TableSortDirection.none` → `<ChevronsUpDownIcon />` (unsorted / inactive state)
   - `TableSortDirection.ascend` → `<ChevronUpIcon />`
   - `TableSortDirection.descend` → `<ChevronDownIcon />`

All three icons are already exported from `src/components/Icons/index.ts`. Import them from `../../components/Icons/...` (or the barrel).

The outer `<div>` wrapper still receives `ref`, `className` (merged with `cn`), and spread `...props` (minus `sortDirection` and `onSort`, which are destructured out). The button lives inside it.

Full sortable inner structure:
```tsx
<div ref={ref} className={cn("flex items-center", className)} {...rest}>
  <Button
    variant={ButtonVariant.ghost}
    size={ButtonSize.sm}
    className="w-full justify-start gap-1"
    onClick={onSort}
  >
    <ButtonText>{children}</ButtonText>
    <SortIcon />  {/* chosen from the three above */}
  </Button>
</div>
```

Import `Button`, `ButtonVariant`, `ButtonSize` from `../../components/Button/Button`.
Import `ButtonText` from `../../components/Text/BaseText`.

---

### 4. `TableRow`

**Element:** `<div>`

**Purpose:** A single data row. Reads `--table-cols` and lays out cells in the same grid as `TableHeader`. Has a bottom border to separate rows. Includes a hover state.

**Props:** All `HTMLAttributes<HTMLDivElement>`. No additional props.

**Implementation:**
```tsx
<div
  ref={ref}
  className={cn(
    "grid border-b border-border",
    "[&:not(:last-child)]:border-b",
    "hover:bg-surface-secondary transition-colors duration-100",
    className
  )}
  style={{ gridTemplateColumns: "var(--table-cols)" }}
  {...props}
/>
```

---

### 5. `TableCell`

**Element:** `<div>`

**Purpose:** A single data cell inside a `TableRow`. Provides padding and vertical centering. Accepts only `children` — the consumer is entirely responsible for content (they pass `<BodyText />`, a `<div>` with stacked values, an `<Avatar />`, etc.).

**Props:** All `HTMLAttributes<HTMLDivElement>`. No additional props.

**Implementation:**
```tsx
<div
  ref={ref}
  className={cn("flex flex-col justify-center px-4 py-3", className)}
  {...props}
/>
```

---

### 6. `TablePlaceholder`

**Element:** `<div>`

**Purpose:** An optional child of `Table` placed after all `TableRow` elements. When the rows do not fill the full height of the container, this component fills the remaining space and centers its children both horizontally and vertically. Consumers use it to show end-of-list messages, zero-state prompts, or any custom centred content. They pass `<BaseText />`, `<BodyText />`, or custom layout as children — this component does not render any text of its own.

**Props:** All `HTMLAttributes<HTMLDivElement>`. No additional props.

**Implementation:**
```tsx
<div
  ref={ref}
  className={cn("flex flex-1 items-center justify-center py-8", className)}
  {...props}
/>
```

`flex-1` causes it to expand into whatever vertical space the rows leave behind inside the `flex flex-col` `Table` root.

---

## Imports summary for Table.tsx

```ts
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { Button, ButtonVariant, ButtonSize } from "../Button/Button";
import { ButtonText } from "../Text/BaseText";
import { ChevronUpIcon } from "../Icons/ChevronUpIcon";
import { ChevronDownIcon } from "../Icons/ChevronDownIcon";
import { ChevronsUpDownIcon } from "../Icons/ChevronsUpDownIcon";
```

---

## index.ts barrel

Export everything from `Table.tsx`:

```ts
export {
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableCell,
  TablePlaceholder,
  TableSortDirection,
} from './Table';
export type {
  TableSortDirection as TableSortDirectionType,
  // ...any prop types you define
} from './Table';
```

---

## What this component family intentionally does NOT do

- No internal sort/filter state — consumers own all data state
- No `columns` prop on individual rows — the CSS custom property handles alignment
- No virtualization, pagination, or selection — out of scope
- No Radix primitive — tables have no interactive behaviour that needs a primitive
- No sticky built-in — consumers add `className="sticky top-0 z-10 bg-surface"` to `TableHeader` themselves
- No pre-defined column widths — consumers pass a `grid-template-columns` string to `Table`

---

## Storybook story

Create a story file at `src/components/Table/Table.stories.tsx` and demonstrate:
1. A `Table` with 3–4 `TableRow` elements and a `TablePlaceholder` at the bottom
2. A `TableHeaderCell` in sortable mode cycling through all three `TableSortDirection` values
3. `TableCell` with stacked multi-line content (two `<BodyText />` elements in a `<div>`)
