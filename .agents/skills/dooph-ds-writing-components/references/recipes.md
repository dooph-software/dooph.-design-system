# Component recipes

Worked shapes for the rules in SKILL.md. Each one copies a real file; open the
cited file for the full version.

## Contents
1. Option consts in `constants.ts`
2. A thin Radix wrapper
3. `asChild` and `Slottable`
4. Your own ref plus the consumer's
5. `className` and `style` when the root is not the role element
6. Overlay content and portals
7. Does this module need `"use client"`?
8. Consumer-owned data: the polling request
9. Surfacing a decision: a worked hand-back

## 1. Option consts in `constants.ts`

From `src/components/Button/constants.ts`. The file has no `"use client"`, so a
Server Component can read the values.

```ts
export const ButtonSize = {
  big: "big",
  medium: "medium",
  standard: "standard",
  sm: "sm",
  icon: "icon",
  iconSm: "icon-sm",      // camelCase key, kebab value
  iconMicro: "icon-micro",
} as const;
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];
```

The component types its props from these, not from cva's `VariantProps`:

```ts
export interface TabsTriggerProps
  extends ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  size?: TabSize;       // VariantProps would admit null: an unsized tab
  variant?: TabVariant;
}
```

## 2. A thin Radix wrapper

From `src/components/Checkbox/Checkbox.tsx`: no directive, no state, a
`forwardRef` with `displayName`, the ref typed from the primitive, the recipe
first and `className` last, states styled from Radix's `data-*` attributes.

```tsx
const Checkbox = forwardRef<
  ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, children, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ variant }), className)}
    {...props}
  >
    {children ?? <CheckboxIndicator />}
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";
```

The recipe reads state as `data-[state=checked]:bg-prominent`, never a class
the component toggles. Parts that add nothing are re-exported as they are:
`const PopoverTrigger = PopoverPrimitive.Trigger;` (`Popover/Popover.tsx`).

A part whose root owns its text renders through a Text component with `as`:

```tsx
<ButtonText as={TabsPrimitive.Trigger} ref={ref}
  className={cn(tabTriggerVariants({ size, variant }), className)} {...props} />
```

## 3. `asChild` and `Slottable`

Button picks its root with `const Comp = (asChild ? Slot : "button") as ElementType;`
and renders `<BaseText as={Comp} …>` (`Button/Button.tsx`).

When the component puts its own elements around the consumer's children,
`Slottable` marks which child is the slot target (`OutlineButton/OutlineButton.tsx`):

```tsx
<Slottable child={children}>
  {(child) => (
    <span className="relative z-10 inline-flex items-center gap-sm">{child}</span>
  )}
</Slottable>
```

## 4. Your own ref plus the consumer's

`useComposedRefs` (`src/utils/composeRefs.ts`, internal) writes the node into
every ref and is memoized, so a consumer's callback ref is not detached and
re-attached on every render. Pass it last so a spread cannot displace it
(`MorphRotationShape/MorphRotationShape.tsx`):

```tsx
const spanRef = useRef<HTMLSpanElement>(null);
const composedRef = useComposedRefs(spanRef, forwardedRef);
// …
<span {...spanProps} ref={composedRef} />
```

## 5. `className` and `style` when the root is not the role element

Say where each goes in the props JSDoc. Real examples:
- `Input`: `className` always lands on the chrome element; every other prop,
  and `ref`, land on the `<input>`.
- `OutlineButton`: `className` styles the outer pill frame `<div>`; `ref`,
  `style`, handlers and every other prop go to the inner button.
- `SegmentedTabSelect`: props, `ref` and `style` go to the Radix Tabs Root;
  `className` styles the inner TabsList.

A consumer `style` merges after the component's own values, as BaseText does:
`style={{ ...typography, ...style }}`.

## 6. Overlay content and portals

From `Popover/Popover.tsx`: the content portals by default, and `portal={false}`
keeps it inline.

```tsx
return portal ? (
  <PopoverPrimitive.Portal {...portalProps}>{content}</PopoverPrimitive.Portal>
) : content;
```

A dialog sends its overlay and panel to the portal as two children, never one
Fragment: Radix's DialogPortal wraps each child in Presence, which clones it
with a ref (`Modal/dialogShell.tsx`).

## 7. Does this module need `"use client"`?

Read the allowlist in `scripts/check-conventions.mjs` (`USE_CLIENT_ALLOWLIST`).
Each entry names the file, its reason and the APIs (`needs`) the reason
names; lint fails an entry whose file no longer uses them.

| The module itself… | Directive | Real example |
|---|---|---|
| holds its own UI state in `useState` / `useRef` / effects | yes | `Slider/Slider.tsx` (uncontrolled value, drag state) |
| creates or reads a context | yes | `SegmentedTabSelect/SegmentedTabSelect.tsx` |
| touches a browser API | yes | `CopyButton/CopyButton.tsx` (`navigator.clipboard`) |
| builds an inline handler closure on an element | yes | `Calendar/CalendarGrid.tsx` (per-day `onClick`) |
| forwards a function prop into a client component | yes | `DatePicker/DatePicker.tsx` (`onValueChange` into Calendar) |
| calls only `useCallback` | no | `src/utils/composeRefs.ts` |
| wraps a Radix part with `forwardRef`, `cn` and a spread | no | `Checkbox`, `Tabs`, `Popover`, `Tooltip` |
| holds consts or a cva recipe | no | `Button/constants.ts`, `Toggle/toggleOption.ts` |

The header contract comes first in the file; the directive may follow it.

A JS timer or `requestAnimationFrame` needs an entry in `TIMER_ALLOWLIST` with
its call count. Each existing entry is a UI concern: CopyButton reverts its own
"copied" confirmation, and two rAF loops redraw geometry. None fetches or polls.

## 8. Consumer-owned data: the polling request

Request: "a status badge that polls our health endpoint every 30s."

The DS side is presentational. It takes the state as a prop, has no hooks, no
directive, no URL and no interval:

```ts
// ServiceStatus/constants.ts
export const ServiceStatusVariant = {
  operational: "operational",
  degraded: "degraded",
  down: "down",
} as const;
export type ServiceStatusVariant =
  (typeof ServiceStatusVariant)[keyof typeof ServiceStatusVariant];
```

```tsx
// ServiceStatus/ServiceStatus.tsx
import { forwardRef, type HTMLAttributes } from "react";
import { Sticker, StickerVariant } from "../Sticker";
import { ServiceStatusVariant } from "./constants";

// A design decision: name this mapping in the hand-back. `satisfies` keeps
// the literal types, so Sticker's `custom` arm (which requires `color`) is
// never reachable.
const PAINT = {
  operational: StickerVariant.secondary,
  degraded: StickerVariant.alternate,
  down: StickerVariant.danger,
} as const satisfies Record<ServiceStatusVariant, StickerVariant>;

export interface ServiceStatusProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  variant: ServiceStatusVariant;
}

const ServiceStatus = forwardRef<HTMLDivElement, ServiceStatusProps>(
  ({ variant, ...props }, ref) => (
    <Sticker ref={ref} variant={PAINT[variant]} {...props} />
  ),
);
ServiceStatus.displayName = "ServiceStatus";

export { ServiceStatus };
```

The app owns the polling. Put this in the hand-back for the requester:

```tsx
"use client";
import { useEffect, useState } from "react";
import { ServiceStatus, ServiceStatusVariant } from "@dooph-software/design-system";

export function ApiStatus() {
  const [variant, setVariant] = useState<ServiceStatusVariant>(
    ServiceStatusVariant.operational,
  );
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        setVariant(res.ok ? ServiceStatusVariant.operational : ServiceStatusVariant.degraded);
      } catch {
        setVariant(ServiceStatusVariant.down);
      }
    };
    poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, []);
  return <ServiceStatus variant={variant}>API</ServiceStatus>;
}
```

And say it plainly: "Fetching and polling belong to your app, so the component
takes `variant` and the polling code above lives in your app."

## 9. Surfacing a decision: a worked hand-back

Request: "add a medium size to Tabs, to sit next to a medium Button."

Facts the change runs into:
- Button `medium` is `h-button-medium ds-px-button-medium rounded-full` and
  renders the hero button text role (`Button/Button.tsx`).
- Every tab size is `rounded-tight` or `rounded-mini` with `px-rg` or `p-0`,
  and TabsTrigger renders `ButtonText` (`Toggle/toggleOption.ts`, `Tabs/Tabs.tsx`).
- `toggleOptionVariants` is shared by TabsTrigger and ToggleSwitchItem.
  ToggleSwitch reaches it only through its own `ToggleSize` and `OPTION_SIZE`
  map (`Toggle/Toggle.tsx`), so a new recipe size is not a new Toggle size
  until those change.
- The TabSize JSDoc gives each size's height and its `rg` (10px) horizontal
  padding (`Tabs/constants.ts`), matching the recipe. Had a comment disagreed
  with the recipe, it would go under Flagged: never silently fix or copy it.

The hand-back:

```
Changed: Tabs/constants.ts (TabSize.medium), Toggle/toggleOption.ts (size.medium).
Decisions:
- Radius: rounded-tight, like the other tabs. Alternative: rounded-full, like Button medium. Open.
- Padding: px-rg, like the other tabs. Alternative: ds-px-button-medium (22px), like Button medium. Open.
- Text role: ButtonText (14px), like the other tabs. Alternative: the hero button role (16px), like Button medium. Open.
Also affected: ToggleSwitchItem shares the recipe; ToggleSize is unchanged, so Toggle does not offer medium.
Flagged: none (the TabSize JSDoc matches the recipe).
Lint: conventions: N checks passed (the line lint printed)
```
