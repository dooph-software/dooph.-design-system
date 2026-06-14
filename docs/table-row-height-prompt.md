# Table — `rowHeight` Follow-up

This is an additive change to the already-implemented `Table` component in `src/components/Table/Table.tsx`. Do not touch any other component. Do not restructure anything.

---

## What to add

### 1. `Table` — add optional `rowHeight` prop

Add `rowHeight?: string` to the `Table` component's props. When provided, set it as a CSS custom property `--table-row-height` alongside the existing `--table-cols`. When omitted, do not set the property at all (absence is the correct default — do not set it to `"auto"`).

```tsx
// destructure rowHeight out of props before spreading
const { columns, rowHeight, className, style, ...rest } = props;

<div
  ref={ref}
  className={cn("flex flex-col w-full", className)}
  style={{
    "--table-cols": columns,
    ...(rowHeight ? { "--table-row-height": rowHeight } : {}),
    ...style,
  } as React.CSSProperties}
  {...rest}
/>
```

### 2. `TableRow` — read `--table-row-height`

In the existing `TableRow` inline style, add `height: "var(--table-row-height, auto)"`. The `auto` fallback means rows without a set `rowHeight` on their parent `Table` behave exactly as before.

```tsx
style={{
  gridTemplateColumns: "var(--table-cols)",
  height: "var(--table-row-height, auto)",
}}
```

### 3. `TableCell` — add `overflow-hidden` to base styles

When a fixed `rowHeight` is set, cell content can overflow the row boundary. Add `overflow-hidden` to `TableCell`'s base `cn(...)` string so content is clipped cleanly. This is a safe default — consumers can override with `className="overflow-visible"` if needed.

---

## Nothing else changes

- No new enum, no new exports, no changes to `index.ts` or `src/index.ts`
- `TableHeader`, `TableHeaderCell`, `TablePlaceholder` are untouched
- `rowHeight` accepts any valid CSS length: `"60px"`, `"4rem"`, `"var(--ui-spacing-xxl)"`, etc. — validation is the consumer's responsibility
