---
name: dooph-design-system-usage
description: Use when building or changing app UI with @dooph-software/design-system (pages, forms, settings screens, lists, tables, dialogs, menus, navigation); when rendering any visible text, heading or label; when choosing a DS component or wiring value, onValueChange, asChild, className or style; when writing spacing, colour, radius or width classes in app code; or when deciding where "use client", state, fetching or timers go.
---

# Building UI with the dooph design system

**The DS draws; your app decides.** Components present what you hand them. Your app owns data, fetching, timers, state and what a click does.

Install, imports, fonts and the preset: dooph-design-system-setup. Token overrides and dark mode: dooph-design-system-theming. Every export's props, defaults and consts: [references/components.md](references/components.md).

## Rules

| Rule | Failure it prevents |
|---|---|
| **Text goes through a Text component**: `TitleText`, `HeadingText`, `SubheadingText`, `BodyText`, `LabelText`, `MonoText`, `ButtonText`, `CTAText`, the hero roles, or `BaseText`. `as` picks the element: `<TitleText as="h1">`, `<BodyText as="p">`, `<LabelText as="label" htmlFor="email">` (a label beside its control always takes `as="label"`). | A raw `<p>` or `<span>` gets none of the role's type tokens. |
| **Typography is props only**, on Text components too: `fontSize={FontSizes.subheading}`, `fontWeight={FontWeights.semibold}`, `letterSpacing={Tracking.label}`, `lineHeight={1.5}` (line height is yours to set), `tabular`. No `text-sm`, `font-semibold`, `tracking-*`, `leading-*`, `text-style-*`, the preset's `text-body` / `font-label`, or inline `fontSize`. Colour classes are fine: `text-text-secondary`. | Props are inline, so they beat every class (only `style` outranks them), and the consts keep sizes on the token scale. A class silently loses to a prop, and `text-sm` is off the scale. |
| **Responsive type isn't supported**: Text components take props only, and the props take no per-breakpoint values. Don't work around it with className utilities, duplicated hidden copies, JS width checks, or a viewport-driven string passed to a prop (`clamp()`, `vw`, a `var()` redefined in a media query): the props accept any CSS string, but such a value is off the role scale and breaks this rule. Redefining a role token (`--ui-text-*`) inside a media query in app CSS is the same workaround: it is not supported either. | Type outside the role system, or text duplicated in the page. |
| **DS controls set their own text role**: pass plain strings (`<Button>Save</Button>`). `ModalContent`, `SheetContent`, `PopoverContent`, `OutlineSection` and `TableCell` set none, so put Text components inside. | Unstyled text in panels and cells. |
| **Spacing uses the DS words** (table below): `gap-sm`, `px-lg`, `mt-xxxs`. Colour, radius and shadow use DS utilities: `bg-surface-page`, `border-border-primary`, `rounded-tight`, `shadow-menu`. No numeric spacing (`mt-0.5`, `p-6`), palette colours (`text-gray-500`, `bg-white`) or hex. | Layout that ignores token overrides; colours that break in dark mode. |
| **In `w-*`, `max-w-*`, `min-w-*` and `basis-*`, the DS size names are spacing**: `max-w-md` is 12px, not a 28rem column. A width off the scale is your own value, as a class: `max-w-[40rem]`. | A content column collapsed to 12px. |
| **Choose by job** (table below), then read its entry in components.md. Option props take the dot consts: `variant={ButtonVariant.prominent}`, `side={SheetSide.bottom}`. | Hand-built controls; guessed props. |
| **The app owns data and control.** Drive controls with `value` + `onValueChange` (Radix parts: `checked`/`onCheckedChange`, `open`/`onOpenChange`), or leave them uncontrolled with `defaultValue`. Fetching, polling, timers and copy like "Thought for 26s" are yours and arrive as props. | Waiting for a component to fetch or tick. None does. |
| **`"use client"` goes on the smallest leaf**: the form, or the one button with a handler. The page stays a Server Component, loads its data and passes the leaf serialisable props. | The whole page shipped to the browser, data loading included. |
| **Compose with `asChild`**: `<Button asChild><Link href="/pricing">See pricing</Link></Button>`, every Radix trigger (`<ModalTrigger asChild><Button>`). The child must be one element. | A link nested in a button; lost client-side navigation. |
| **`className` merges with `cn`; `style` merges last.** Your conflicting class replaces the component's (`rounded-full` beats `rounded-tight`); your `style` wins. On some components `className` styles a different element from the one that gets `ref`, `style` and the other props (`Input`, `SearchBox`, `OutlineButton`, `SegmentedTabSelect` and the Sliders among them); check the component's components.md entry and its JSDoc before overriding. | Overrides on the wrong element. |

## Which component for which job

| Job | Use |
|---|---|
| Action | `Button`, `CopyButton`, `SplitButton`; expressive: `CTAButton`, `OutlineButton`, `ShapeButton` |
| Link | `TextLink`; `Button asChild` when it looks like a button |
| Text or number field | `Input` (`InputVariant`); `SearchBox` for search |
| Yes/no setting | `Checkbox` with `LabelText as="label"`. There is no on/off switch. |
| One of two or more options | `ToggleSwitch` (selection never clears), `FancyToggleSwitch` |
| Switch panels | `Tabs`, `SegmentedTabSelect` |
| Menu or select | `DropdownMenu` with `DropdownTrigger` |
| Dialog, side panel, floating panel, hint | `Modal`, `Sheet`, `Popover`, `Tooltip` (needs a `TooltipProvider` ancestor) |
| Notification | `ToastProvider` + `useToast` |
| Data grid | `Table`; `TableHeaderCell` with `sortDirection` + `onSort` sorts |
| Status chip | `Sticker` |
| Waiting, progress | `LoadingSpinner`, `ShapeMorphSpinner`; `ProgressIndicator`, `LinearProgressIndicator` |
| Dates, codes, ranges | `DatePicker`, `Calendar`, `VerificationCodeInput`, `SliderContinuous` / `SliderStepped` / `SliderLabeled` |
| AI chat | the `AI*` parts, `ChatDivider`, `UserMessageHeader` ([pattern 8](references/patterns.md#8-ai-chat)) |

## Quick reference

| Spacing word | xxxs | xxs | xs | sm | rg | md | lg | xl | xxl | xxxl |
|---|---|---|---|---|---|---|---|---|---|---|
| px | 2 | 4 | 6 | 8 | 10 | 12 | 16 | 20 | 26 | 42 |

Worked examples: [references/patterns.md](references/patterns.md). Modal on desktop, Sheet on mobile: [references/responsive-sheet-modal.md](references/responsive-sheet-modal.md).

## Rationalizations

| Said | Reality |
|---|---|
| "A page at `app/settings/notifications/page.tsx` - client component with form state" | The page stays a server page and renders a `"use client"` form holding the state and the POST ([pattern 1](references/patterns.md#1-a-server-page-with-a-client-form)). |
| "Client components would use `"use client"` and fetch/axios on client side" | Only the part that handles events is client code. Data loads on the server and arrives as props. |

## Verification

1. Run the app's own typecheck script and its build, never raw `tsc`. In Next.js, raw `tsc` reporting `Cannot find name 'LayoutProps'` means `next typegen` was skipped, not a pre-existing error (dooph-design-system-setup, Verify).
2. Search the `.tsx` files you touched; this should print nothing:
   ```sh
   grep -nE '\b(font-[a-z[]|tracking-|leading-|text-style-|text-(xs|sm|base|lg|[0-9]?xl|body|label|title|heading|subheading|hero|mono)\b|text-\[|(p|m)[xytrbl]?-(0\.|[1-9])|gap(-[xy])?-[0-9]|space-[xy]-[0-9]|(bg|text|border)-(white|black|(gray|slate|zinc|neutral|stone|red|blue|green)-))|\[#[0-9a-fA-F]{3,8}\]' <files>
   ```
   It is partial (inline `style`, unlisted palettes and most hex slip past), so read the diff too.
   Remove any `"use client"` you added to a file with no hooks, browser APIs or event handlers.
3. Open the screen in a browser, light and dark, and use every control once.
