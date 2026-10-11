---
name: dooph-design-system-usage
description: Use when building or changing app UI with @dooph-software/design-system (pages, forms, settings screens, lists, tables, dialogs, menus, navigation); when rendering any visible text, heading or label; when choosing a DS component or wiring value, onValueChange, asChild, className or style; when writing spacing, colour, radius or width classes in app code; or when deciding where "use client", state, fetching or timers go.
---

# Building UI with the dooph design system

**The DS draws; your app decides.** Components present what you hand them. Your app owns data, fetching, timers, state and what a click does. Text goes through Text components; spacing, colour, radius and shadow come from DS tokens.

Not here: install, imports, fonts, the Tailwind preset, Server Component basics (dooph-design-system-setup); token overrides, dark mode, the practical preset (dooph-design-system-theming). Every export's props, defaults and consts: [references/components.md](references/components.md).

## Rules

| Rule | Failure it prevents |
|---|---|
| **Text goes through a Text component**: `TitleText`, `HeadingText`, `SubheadingText`, `BodyText`, `LabelText`, `MonoText`, `ButtonText`, `CTAText`, the hero roles, or `BaseText`. `as` picks the element: `<TitleText as="h1">`, `<BodyText as="p">`, `<LabelText as="label" htmlFor="email">`. | A raw `<p>` or `<span>` skips the role's family, size, weight and font axes, and the token overrides with them. |
| **Typography is props only**, on Text components too: `fontSize={FontSizes.subheading}`, `fontWeight={FontWeights.semibold}`, `letterSpacing={Tracking.label}`, `lineHeight={1.5}` (line height is yours to set), `tabular`. No `text-sm`, `font-semibold`, `tracking-*`, `leading-*`, `text-style-*`, the preset's `text-body` / `font-label`, or inline `fontSize`. Colour classes are fine: `text-text-secondary`. | Props are the supported path: they are inline, so they always win, and the consts keep sizes on the token scale. A class sits outside it: a prop silently beats it, and `text-sm` is off the scale. |
| **Responsive type isn't supported**: Text components take props only, and props can't change per breakpoint. Don't work around it with className utilities, duplicated hidden copies, or JS width checks. | Type that escapes the role system, or two copies of one text in the page. |
| **DS controls set their own text role**: pass plain strings (`<Button>Save</Button>`, `<DropdownMenuItem>Rename</DropdownMenuItem>`). `ModalContent`, `SheetContent`, `PopoverContent`, `OutlineSection` and `TableCell` set none, so put Text components inside. | Unstyled text in panels and cells. |
| **Spacing uses the DS words** (table below): `gap-sm`, `px-lg`, `mt-xxxs`. Colour, radius and shadow use DS utilities: `bg-surface-page`, `border-border-primary`, `rounded-tight`, `shadow-menu`. No numeric spacing (`mt-0.5`, `p-6`), palette colours (`text-gray-500`, `bg-white`) or hex. | Layout that ignores token overrides; colours that break in dark mode. |
| **In `w-*`, `max-w-*`, `min-w-*` and `basis-*`, the DS size names are spacing**: `max-w-md` is 12px, not a 28rem column. A width off the scale is your own value, as a class: `max-w-[40rem]`. | A content column collapsed to 12px. |
| **Choose by job** (table below), then read the component's entry in components.md. Option props take the dot consts: `variant={ButtonVariant.prominent}`, `side={SheetSide.bottom}`. | Hand-built switches, menus and dialogs; guessed props. |
| **The app owns data and control.** Drive controls with `value` + `onValueChange` (Radix parts: `checked`/`onCheckedChange`, `open`/`onOpenChange`), or leave them uncontrolled with `defaultValue`. Fetching, polling, timers and copy like "Thought for 26s" live in your code and arrive as props. | Waiting for a component to fetch or tick. None does. |
| **`"use client"` goes on the smallest leaf**: the form, or the one button with a handler. The page stays a Server Component, loads its data and passes the leaf serialisable props. | The whole page shipped to the browser, data loading included. |
| **Compose with `asChild`**: `<Button asChild><Link href="/pricing">See pricing</Link></Button>`, `<TextLink asChild>`, every Radix trigger (`<ModalTrigger asChild><Button>`). The child must be one element. | A link nested in a button; lost client-side navigation. |
| **`className` merges with `cn`; `style` merges last.** Your conflicting class replaces the component's (`rounded-full` beats `rounded-tight`); your `style` wins. Where `className` lands off the root, components.md says where (SegmentedTabSelect: the list; sliders: the outer box). Input puts `className` on the field chrome and every other prop on the `<input>`. | Overrides on the wrong element. |

## Which component for which job

| Job | Use |
|---|---|
| Action | `Button` (`ButtonVariant.prominent` for the main call to action), `CopyButton`, `SplitButton`; expressive: `CTAButton`, `OutlineButton`, `ShapeButton` |
| Link | `TextLink`; `Button asChild` when it looks like a button |
| Text or number field | `Input` (`InputVariant`); `SearchBox` for search |
| Yes/no setting | `Checkbox` with `LabelText as="label"`. There is no on/off switch. |
| One of two or more options | `ToggleSwitch` (selection never clears), `FancyToggleSwitch` |
| Switch panels | `Tabs`, `SegmentedTabSelect` |
| Menu or select | `DropdownMenu`; `DropdownMenuTrigger asChild` around `DropdownTrigger` |
| Dialog, side panel, floating panel, hint | `Modal`, `Sheet`, `Popover`, `Tooltip` (inside a `TooltipProvider`; Radix throws without one) |
| Notification | `ToastProvider` + `useToast` |
| Data grid | `Table` (`columns` is the grid template); `TableHeaderCell` with `sortDirection` + `onSort` sorts |
| Status chip | `Sticker` |
| Waiting, progress | `LoadingSpinner`, `ShapeMorphSpinner`; `ProgressIndicator` (0–1), `LinearProgressIndicator` |
| Dates, codes, ranges | `DatePicker`, `Calendar`, `VerificationCodeInput`, `SliderContinuous` / `SliderStepped` / `SliderLabeled` |
| AI chat | the `AI*` parts, `ChatDivider`, `UserMessageHeader` ([pattern 8](references/patterns.md#8-ai-chat)) |

## Quick reference

| Spacing word | xxxs | xxs | xs | sm | rg | md | lg | xl | xxl | xxxl |
|---|---|---|---|---|---|---|---|---|---|---|
| px | 2 | 4 | 6 | 8 | 10 | 12 | 16 | 20 | 26 | 42 |

Worked examples (server page with a client form, links, a menu, text in cells, toasts, merging classes): [references/patterns.md](references/patterns.md). Modal on desktop, Sheet on mobile: [references/responsive-sheet-modal.md](references/responsive-sheet-modal.md).

## Rationalizations

| Said | Reality |
|---|---|
| "A page at `app/settings/notifications/page.tsx` - client component with form state" | The page stays a server page and renders a `"use client"` form that holds the state and the POST ([pattern 1](references/patterns.md#1-a-server-page-with-a-client-form)). |
| "Client components would use `"use client"` and fetch/axios on client side" | Only the part that handles events is a client component. Initial data loads on the server and arrives as props. |

**Red flags:** `"use client"` at the top of a page or layout; `mt-0.5`, `p-6`, `style={{ maxWidth: 640 }}`; a `<p>`, `<span>` or `<label>` holding text; a `LabelText` without `as="label"` beside its control.

## Verification

1. Run the app's own typecheck and build (dooph-design-system-setup).
2. Search the `.tsx` files you touched; this should print nothing:
   ```sh
   grep -nE '\b(font-[a-z[]|tracking-|leading-|text-style-|text-(xs|sm|base|lg|[0-9]?xl|body|label|title|heading|subheading|hero|mono)\b|text-\[|(p|m)[xytrbl]?-(0\.|[1-9])|gap(-[xy])?-[0-9]|space-[xy]-[0-9]|(bg|text|border)-(white|black|(gray|slate|zinc|neutral|stone|red|blue|green)-))|\[#[0-9a-fA-F]{3,8}\]' <files>
   ```
   The search is partial: it misses inline `style` values, hex outside a bracketed class, and palettes it doesn't list. Read the diff too.
   For each `"use client"` you added: does that file use hooks, browser APIs or event handlers? If not, remove it.
3. Open the screen in a browser, light and dark, and use every control once.

## Related

dooph-design-system-setup · dooph-design-system-theming · [components.md](references/components.md) · [token-contract.md](../dooph-design-system-theming/references/token-contract.md)
