# Client references

The package entry (`dist/index.js`) carries no `"use client"`, so a Server Component can import from `@dooph-software/design-system`. Each export comes from a chunk file. A chunk whose first line is `"use client"` makes every export in it a client reference. The generated list below gives the counts and names for this version. Consts, variant functions (`buttonVariants`, `tabTriggerVariants`, …) and utilities (`cn`, `resolveDsColor`, `DS_COLOR_TOKENS`) are server-safe, so server code can read and call them.

## What a client reference means in a Server Component

- **You can render it** from a Server Component, with props React can serialise: strings, numbers, booleans, plain objects and arrays, and JSX `children`.
- **You cannot pass a function prop** from a Server Component: no event handler, no `onValueChange`, no render function, and no component as a value. The one exception is a Server Action (a function marked `"use server"`). Next.js stops the render with "Event handlers cannot be passed to Client Component props" or "Functions cannot be passed directly to Client Components".
- **The same holds for server-safe DS components.** `Button` renders on the server, so `<Button onClick={…}>` in a Server Component fails the same way. Any function prop is created in a client file.
- **`useToast`** is a hook, so only client code can call it.
- **`ShapeMorphSpinner` and `MorphRotationShape` `shapes`:** from server code pass `Shapes` keys (`[Shapes.clover, Shapes.puff]`), not shape components (`[CloverShape, PuffShape]`). Keys build; components fail with the "Functions cannot be passed" error.

The pattern: the page stays a Server Component (it can be `async` and load data). The interactive part moves into its own small `"use client"` file that creates the handlers and renders the DS component. The page renders that file's component and passes it data, not functions.

```tsx
// app/pricing/talk-to-sales.tsx
"use client";
import { Button, ButtonVariant } from "@dooph-software/design-system";

export function TalkToSales({ href }: { href: string }) {
  return (
    <Button variant={ButtonVariant.secondary} onClick={() => window.location.assign(href)}>
      Talk to sales
    </Button>
  );
}

// app/pricing/page.tsx (no directive)
import { BodyText } from "@dooph-software/design-system";
import { getPlans } from "@/lib/plans";
import { TalkToSales } from "./talk-to-sales";

export default async function PricingPage() {
  const plans = await getPlans();
  return (
    <main>
      {plans.map((plan) => <BodyText as="p" key={plan.id}>{plan.name}</BodyText>)}
      <TalkToSales href="/contact" />
    </main>
  );
}
```

## Client and server-safe exports

<!-- GENERATED:client-references by scripts/generate-docs.mjs — do not edit -->

328 runtime exports: 65 client references, 263 server-safe. Read from source: an export is a client reference when the file that declares it carries `"use client"`.

### Client references, by folder

| Folder | Exports |
| --- | --- |
| `AIChat` | `AIModelSelectItem`, `AIModelSelectTrigger`, `AIModelTooltipContent`, `AIPromptInput`, `AIPromptInputSubmit`, `AIPromptInputTextarea`, `AIPromptInputToolbar`, `AIPromptInputToolbarEnd`, `AIPromptInputToolbarStart`, `AIThinkingEffortSelector`, `AIThinkingPart` |
| `AnimatedText` | `RevealChangeText`, `RollingDigitsText` |
| `Calendar` | `Calendar`, `CalendarCaption`, `CalendarGrid`, `CalendarPresetItem`, `CalendarPresetsPanel` |
| `CopyButton` | `CopyButton` |
| `DatePicker` | `DatePicker`, `DatePickerSplitTrigger` |
| `DropdownTrigger` | `DropdownTrigger`, `DropdownTriggerContent`, `TextDropdownTrigger`, `TypeableDropdownTrigger` |
| `Input` | `Input` |
| `Menu` | `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuMultiSelectItem`, `DropdownMenuPlainItem`, `DropdownMenuPortal`, `DropdownMenuRadioGroup`, `DropdownMenuRadioSelectItem`, `DropdownMenuSearch`, `DropdownMenuSection`, `DropdownMenuSegment`, `DropdownMenuSeparator`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuTrigger` |
| `MorphRotationShape` | `MorphRotationShape` |
| `OutlineButton` | `OutlineButton` |
| `SegmentedTabSelect` | `SegmentedTabItem`, `SegmentedTabSelect` |
| `SidebarWithHoverIcon` | `SidebarWithHoverIcon` |
| `Slider` | `SliderContinuous`, `SliderLabeled`, `SliderStepped` |
| `Toast` | `ToastAction`, `ToastClose`, `ToastDescription`, `ToastProvider`, `ToastRoot`, `ToastTitle`, `ToastViewport`, `useToast` |
| `Toggle` | `FancyToggleSwitch`, `FancyToggleSwitchItem`, `ToggleSwitch`, `ToggleSwitchItem` |
| `VerificationCode` | `VerificationCodeInput` |

Client exports that are not components: `useToast`. Every other const and function export is server-safe.

### Server-safe components

`AIContextGauge`, `AIContextIcon`, `AIPlanIcon`, `AIPowerIcon`, `AISkillIcon`, `AISpeedIcon`, `AITextPart`, `AIThinkingIcon`, `AIToolActionIcon`, `AIToolPart`, `AIToolReadIcon`, `AITurnSummary`, `ArrowDownIcon`, `ArrowDownLeftIcon`, `ArrowDownRightIcon`, `ArrowLeftIcon`, `ArrowRightIcon`, `ArrowShape`, `ArrowUpIcon`, `ArrowUpLeftIcon`, `ArrowUpRightIcon`, `AttachFileIcon`, `Avatar`, `BarChartAxesIcon`, `BarChartIcon`, `BaseIcon`, `BaseShape`, `BaseText`, `BodyText`, `BugReportIcon`, `Button`, `ButtonText`, `CTAButton`, `CTAText`, `CalendarIcon`, `CapsuleShape`, `ChangelogIcon`, `ChatDivider`, `CheckIcon`, `Checkbox`, `CheckboxIndicator`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronUpIcon`, `ChevronsDownUpIcon`, `ChevronsLeftRightIcon`, `ChevronsRightIcon`, `ChevronsRightLeftIcon`, `ChevronsUpDownIcon`, `ClearFilterFunnelIcon`, `ClipboardIcon`, `CloseCancelIcon`, `CloverShape`, `CodeDigitInput`, `CookieShape`, `CreditCardIcon`, `DarkModeIcon`, `DatePickerTrigger`, `DiamondShape`, `DiscPlatterDBIcon`, `DoubleShape`, `DownloadIcon`, `DropdownCaret`, `DropdownIcon`, `EightLeafCloverShape`, `ErrorAlternativeIcon`, `ErrorIcon`, `ExtensionsIcon`, `FadeChangeText`, `FilterFunnelIcon`, `FilterLinesIcon`, `FiltersSlidersIcon`, `GraphIcon`, `HeadingText`, `HeartFillIcon`, `HelpIcon`, `HeroBodyText`, `HeroButtonText`, `HeroText`, `HideMoneyIcon`, `HotkeyIndicator`, `InfoIcon`, `InvoiceIcon`, `KeyIcon`, `LabelText`, `LightModeIcon`, `LinearProgressIndicator`, `LoadingSpinner`, `LoadingSpinnerIcon`, `LogOutIcon`, `ManyUsersIcon`, `ManyUsersRoundedIcon`, `Modal`, `ModalClose`, `ModalContent`, `ModalDescription`, `ModalOverlay`, `ModalPortal`, `ModalTitle`, `ModalTrigger`, `MonoText`, `NewChatIcon`, `OrganizationIcon`, `OutlineSection`, `OverviewIcon`, `PentagonShape`, `PixircleShape`, `PlaceholderIcon`, `PlusIcon`, `Popover`, `PopoverAnchor`, `PopoverClose`, `PopoverContent`, `PopoverPortal`, `PopoverTrigger`, `ProgressIndicator`, `PuffShape`, `RecentsIcon`, `RollChangeText`, `RollHoverText`, `SaveAlternativeIcon`, `SaveIcon`, `SearchBox`, `SearchIcon`, `SendIcon`, `SettingsBoltIcon`, `SettingsGearIcon`, `ShapeButton`, `ShapeClipPath`, `ShapeMorphSpinner`, `Sheet`, `SheetClose`, `SheetContent`, `SheetDescription`, `SheetOverlay`, `SheetPortal`, `SheetTitle`, `SheetTrigger`, `ShimmerText`, `ShowMoneyIcon`, `SidebarLeftHoverIcon`, `SidebarLeftIcon`, `SidebarRightHoverIcon`, `SidebarRightIcon`, `SortAscendingIcon`, `SortDescendingIcon`, `SplitButton`, `SplitButtonAction`, `SplitButtonGroup`, `SplitButtonTrigger`, `SquircleShape`, `StarShape`, `Sticker`, `StopAlternativeIcon`, `StopFilledIcon`, `StopIcon`, `SubheadingText`, `SystemThemeIcon`, `Table`, `TableCell`, `TableHeader`, `TableHeaderCell`, `TableIcon`, `TablePlaceholder`, `TableRow`, `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`, `TagIcon`, `TextLink`, `ThreeColumnsIcon`, `ThreeDotsIcon`, `TitleText`, `Tooltip`, `TooltipBody`, `TooltipContent`, `TooltipProvider`, `TooltipTitle`, `TooltipTrigger`, `TripleShape`, `UnderlineLinkText`, `UserIcon`, `UserMessageHeader`, `UserRoundedIcon`, `WarningIcon`, `WavyDivider`

<!-- /GENERATED:client-references -->

A server-safe component that wraps Radix or renders a client part keeps that part behind its own client boundary, so it still renders from a Server Component.

## Checking an export in the installed package

The list above is for this version. To check one name in the installed copy, find the line `import { … Name … } from "./chunk-XXXX.js"` in `node_modules/@dooph-software/design-system/dist/index.js`, then read the first line of that chunk. `"use client";` means it is a client reference.
