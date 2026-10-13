# Component recipes

Worked shapes for the rules in SKILL.md. Recipes 1-7 come from real files; open the
cited file for the full version. Recipes 8 and 9 are worked requests:
`UnreadCount` and `TextDropdownSize.medium` are **hypothetical** and do not
exist in `src/`.

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

From `src/components/Popover/Popover.tsx`: no directive, no state, a
`forwardRef` with `displayName`, the ref typed from the primitive, the
component's classes first and `className` last, states styled from Radix's
`data-*` attributes.

```tsx
const PopoverContent = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = "start", /* … */ portal = true, portalProps, ...props }, ref) => {
  const content = (
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      className={cn(
        "z-50 overflow-hidden rounded-normal …",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        "ds-motion-overlay",
        "ds-radix-popover-content-origin",
        className,
      )}
      {...props}
    />
  );
  // … the portal switch: recipe 6
});
PopoverContent.displayName = "PopoverContent";
```

The open and closed looks read Radix's `data-[state=…]`, never a class the
component toggles. Parts that add nothing are re-exported as they are:
`const PopoverTrigger = PopoverPrimitive.Trigger;`.

A part that mounts through Radix's Presence (overlay content, or any part that
unmounts when closed) animates open and close with CSS `@keyframes`, never a
transition. Presence keeps a closing part mounted only while a new
`animation-name` runs, and unmounts it on `animationend`; it never waits for a
transition, so a transition-only close is cut off. Here the keyframes are
tailwindcss-animate's `animate-in`/`animate-out`, timed by `ds-motion-overlay`.
Size or place the animation from the `--radix-*` variables the part exposes:
`ds-radix-popover-content-origin` reads `--radix-popover-content-transform-origin`.

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
| creates or reads a context | yes | `Menu/DropdownMenu.tsx` |
| touches a browser API | yes | `CopyButton/CopyButton.tsx` (`navigator.clipboard`) |
| builds an inline handler closure on an element | yes | `Calendar/CalendarGrid.tsx` (per-day `onClick`) |
| forwards a function prop into a client component | yes | `DatePicker/DatePicker.tsx` (`onValueChange` into Calendar) |
| calls only `useCallback`, `useMemo` or `useId` (they run in React's server build) | no | `src/utils/composeRefs.ts`, `ProgressIndicator/ProgressIndicator.tsx`, `WavyDivider/WavyDivider.tsx` |
| wraps a Radix part with `forwardRef`, `cn` and a spread | no | `Checkbox`, `Tabs`, `Popover`, `Tooltip` |
| holds consts or a cva recipe | no | `Button/constants.ts`, `Toggle/toggleOption.ts` |

The header contract comes first in the file; the directive may follow it.

A JS timer or `requestAnimationFrame` needs an entry in `TIMER_ALLOWLIST` with
its call count. Each existing entry is a UI concern: CopyButton reverts its own
"copied" confirmation, and two rAF loops redraw geometry. None fetches or polls.

## 8. Consumer-owned data: the polling request

(`UnreadCount` is hypothetical; the DS has no such component.)

Request: "an unread-messages count for the nav that refreshes from our inbox
endpoint every minute."

The DS side is presentational. It takes the count as a prop, has no hooks, no
directive, no URL and no interval:

```tsx
// UnreadCount/UnreadCount.tsx
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { LabelText } from "../Text";

export interface UnreadCountProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  count: number;
}

const UnreadCount = forwardRef<HTMLSpanElement, UnreadCountProps>(
  ({ count, className, ...props }, ref) => (
    <LabelText
      ref={ref}
      className={cn("rounded-full bg-prominent px-xs text-prominent-fg", className)}
      {...props}
    >
      {/* A design decision: name the "99+" cap in the hand-back. */}
      {count > 99 ? "99+" : count}
    </LabelText>
  ),
);
UnreadCount.displayName = "UnreadCount";

export { UnreadCount };
```

The app owns the polling. Put this in the hand-back for the requester:

```tsx
"use client";
import { useEffect, useState } from "react";
import { UnreadCount } from "@dooph-software/design-system";

export function InboxCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/inbox/unread", { cache: "no-store" });
        if (res.ok) setCount((await res.json()).count);
      } catch {
        // keep the last count; how an outage looks is the app's call
      }
    };
    poll();
    const id = setInterval(poll, 60_000);
    return () => clearInterval(id);
  }, []);
  // A plain span cannot carry a name: label the control around the count.
  return (
    <a href="/inbox" aria-label={`Inbox, ${count} unread`}>
      Inbox <UnreadCount count={count} />
    </a>
  );
}
```

And say it plainly: "Fetching and polling belong to your app, so the component
takes `count` and the polling code above lives in your app."

## 9. Surfacing a decision: a worked hand-back

(`TextDropdownSize.medium` is hypothetical; today the const has only
`standard` and `sm`.)

Request: "add a medium size to TextDropdownTrigger, for a title row that sits
beside a medium Button."

Facts the change runs into:
- Button `medium` is `h-button-medium ds-px-button-medium rounded-full` and
  renders the hero button text role (`Button/Button.tsx`).
- Both TextDropdownTrigger sizes are `rounded-tight` with no horizontal
  padding. `standard` is `h-text-trigger` (30px) with the button text role and
  the `rg` chevron; `sm` has no height of its own, the label role and the `sm`
  chevron (`DropdownTrigger/DropdownTrigger.tsx`).
- The text role and the chevron are picked by `size === sm ? … : …`, so a new
  size silently gets the standard's. The class lines test each size by name,
  so `medium` has no height and no text colour until it gets a line of its own.
- CalendarCaption renders `TextDropdownSize.sm` only, so it does not change.
- The `TextDropdownSize` JSDoc names no heights, so no comment goes stale. Had
  a comment disagreed with the code, it would go under Flagged: never silently
  fix or copy it.

The hand-back:

```
Changed: DropdownTrigger/constants.ts (TextDropdownSize.medium), DropdownTrigger/DropdownTrigger.tsx (a medium class line).
Decisions:
- Height: h-button-medium (46px), to match the Button beside it. Settled by the request.
- Radius: rounded-tight, like the other sizes. Alternative: rounded-full, like Button medium. Open.
- Padding: none, like the other sizes. Alternative: ds-px-button-medium, like Button medium. Open.
- Text role: the button role (14px), which the size check gives every size but sm. Alternative: the hero button role (16px), like Button medium. Open.
- Chevron: IconSize.rg, from the same check. Open.
Also affected: CalendarCaption uses sm only; unchanged.
Flagged: none (no comment states a TextDropdownTrigger height).
Lint: conventions: N checks passed (the line lint printed)
```
