# Patterns

Worked examples for the rules in the usage skill. The routes are Next.js App Router. In a framework without Server Components, drop the `"use client"` lines and keep the rest.

## 1. A server page with a client form

The page loads data and lays out the screen. Only the form, which holds state and handles events, is a client component.

```tsx
// app/settings/notifications/page.tsx (no "use client")
import { BodyText, TitleText } from "@dooph-software/design-system";
import { getNotificationSettings } from "@/lib/settings";
import { NotificationsForm } from "./notifications-form";

export default async function NotificationsPage() {
  const settings = await getNotificationSettings();
  return (
    <main className="mx-auto flex max-w-[40rem] flex-col gap-xl px-xl py-xxl">
      <TitleText as="h1">Notifications</TitleText>
      <BodyText as="p" className="text-text-secondary">
        Choose what we email you about.
      </BodyText>
      <NotificationsForm initial={settings} />
    </main>
  );
}
```

```tsx
// app/settings/notifications/notifications-form.tsx
"use client";

import { useState } from "react";
import {
  Button,
  ButtonVariant,
  Checkbox,
  Input,
  LabelText,
} from "@dooph-software/design-system";

type Settings = { email: string; productNews: boolean };

export function NotificationsForm({ initial }: { initial: Settings }) {
  const [email, setEmail] = useState(initial.email);
  const [productNews, setProductNews] = useState(initial.productNews);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/settings/notifications", {
      method: "POST",
      body: JSON.stringify({ email, productNews }),
    });
    setSaving(false);
  }

  return (
    <form
      className="flex flex-col gap-lg"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="flex flex-col gap-xs">
        <LabelText as="label" htmlFor="notif-email">Email</LabelText>
        <Input id="notif-email" type="email" value={email} onValueChange={setEmail} />
      </div>
      <div className="flex items-center gap-sm">
        <Checkbox
          id="notif-product-news"
          checked={productNews}
          onCheckedChange={(checked) => setProductNews(checked === true)}
        />
        <LabelText as="label" htmlFor="notif-product-news">Product news</LabelText>
      </div>
      <Button type="submit" variant={ButtonVariant.prominent} disabled={saving}>
        Save
      </Button>
    </form>
  );
}
```

Points to copy:
- `Input` puts `id`, `ref` and every other prop on the `<input>`, so `htmlFor` reaches it. `className` goes on the field chrome. `onValueChange` receives the raw string.
- `Checkbox` is a Radix checkbox, so it takes `checked` / `onCheckedChange` and draws its own indicator. Its `id` sits on the box, so the label's `htmlFor` toggles it.
- A Server Component cannot pass an event handler or other plain function (`onClick`, `onCheckedChange`) to a client component or DOM element; a Server Action (`"use server"`) is the exception. If a handler is needed, that subtree is a client leaf.
- A Server Component can render DS components with plain props (strings, numbers, elements, dot consts), as the page does with `TitleText`.

## 2. Links and navigation

```tsx
import Link from "next/link";
import { Button, ButtonVariant, TextLink } from "@dooph-software/design-system";

<Button asChild variant={ButtonVariant.prominent}>
  <Link href="/pricing">See pricing</Link>
</Button>

<TextLink asChild>
  <Link href="/changelog">Changelog</Link>
</TextLink>
```

With `asChild`, your element becomes the root and receives the DS classes, handlers and `ref`. The child must be exactly one element. Don't put a `<Link>` inside a `<Button>` without `asChild`: that nests a link in a button. `ShapeButton`, `DropdownTrigger` and `TextDropdownTrigger` take `asChild` the same way. `CTAButton` takes it too but supplies its own content: pass `text` and `icon` and leave the child empty (`<CTAButton asChild text="See pricing" icon={…}><Link href="/pricing" /></CTAButton>`). `OutlineButton` slots its inner button: your element gets the handlers and `ref`, while `className` still styles the outer frame `<div>`. The Radix triggers (`ModalTrigger`, `SheetTrigger`, `PopoverTrigger`, `TooltipTrigger`, `DropdownMenuTrigger`) take it from Radix.

A link-only screen needs no `"use client"`. `Button` and `TextLink` render from a Server Component.

## 3. A menu

```tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemVariant,
  DropdownMenuSection,
  DropdownMenuTrigger,
  DropdownTrigger,
} from "@dooph-software/design-system";

export function FileActions({ fileId }: { fileId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>Actions</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuItem onSelect={() => renameFile(fileId)}>Rename</DropdownMenuItem>
          <DropdownMenuItem
            variant={DropdownMenuItemVariant.danger}
            onSelect={() => deleteFile(fileId)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

`renameFile` and `deleteFile` are your app's functions. Items sit in a `DropdownMenuSection`, which gives them their inset. The menu is non-modal by default; pass `modal` for dialog-like focus trapping. For a value picker, use `DropdownMenuRadioGroup` + `DropdownMenuRadioSelectItem`, or `selectType={DropdownMenuSelectType.multi}` with `DropdownMenuMultiSelectItem`.

## 4. Text in free containers

DS controls set their own text role, so they take plain strings. Containers that set none need Text components:

```tsx
<Table columns="2fr 1fr">
  <TableHeader>
    <TableHeaderCell>Name</TableHeaderCell>
    <TableHeaderCell>Plan</TableHeaderCell>
  </TableHeader>
  {rows.map((row) => (
    <TableRow key={row.id}>
      <TableCell><BodyText>{row.name}</BodyText></TableCell>
      <TableCell><BodyText className="text-text-secondary">{row.plan}</BodyText></TableCell>
    </TableRow>
  ))}
</Table>
```

`TableHeaderCell` sets the button text role (`ButtonText`) on its own label. `TableCell`, `ModalContent`, `SheetContent`, `PopoverContent` and `OutlineSection` set no text role, and `ModalContent` / `SheetContent` add no padding either. `ModalTitle` and `SheetTitle` render as `HeadingText`; their descriptions render as `BodyText`.

## 5. Toasts

`ToastProvider` goes once near the root. It is a client component, and it can wrap Server Component children. Call `useToast()` in a client leaf:

```tsx
"use client";
import { Button, useToast } from "@dooph-software/design-system";

export function SaveButton() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: "Saved" })}>Save</Button>;
}
```

`ToastProvider`'s `duration` sets the auto-dismiss delay for every toast (default 4000 ms). A `toast({ duration })` overrides it, and `Infinity` keeps a toast open.

## 6. Merging classes in app code

The package exports `cn` (clsx + tailwind-merge, set up for the DS scales and text roles). Use it for your own conditional classes. Then `p-lg` replaces `p-md`, and a colour class never erases a text role:

```tsx
import { cn } from "@dooph-software/design-system";
<div className={cn("flex gap-sm p-md", dense && "p-sm")} />
```

If the app keeps its own merge helper, build it from the package config, so it knows the DS class names:

```ts
import { extendTailwindMerge } from "tailwind-merge";
import { DS_TW_MERGE_CONFIG } from "@dooph-software/design-system";

export const twMerge = extendTailwindMerge<"text-style">(DS_TW_MERGE_CONFIG);
```

## 7. Without Tailwind

The tokens are CSS custom properties from `styles.css`, so plain CSS reads them directly: `gap: var(--ui-spacing-sm)`, `color: var(--ui-color-text-secondary)`, `border-radius: var(--ui-radius-tight)`. The token names and values are in [token-contract.md](../../dooph-design-system-theming/references/token-contract.md).

## 8. AI chat

The chat parts draw a conversation your app runs: transport, streaming state, timers and copy ("Thought for 26s") are yours. Render the composer from the client component that owns the chat state.

```tsx
"use client";

import {
  AIPromptInput,
  AIPromptInputSubmit,
  AIPromptInputTextarea,
  AIPromptInputToolbar,
  AIPromptInputToolbarEnd,
} from "@dooph-software/design-system";

export function Composer({ responding, send, abort }: {
  responding: boolean;
  send: (text: string) => void;
  abort: () => void;
}) {
  return (
    <AIPromptInput onSubmit={send} responding={responding} onStop={abort}>
      <AIPromptInputTextarea placeholder="Ask anything" />
      <AIPromptInputToolbar>
        <AIPromptInputToolbarEnd>
          <AIPromptInputSubmit
            onClick={(event) => {
              if (responding && !window.confirm("Stop the response?")) event.preventDefault();
            }}
          />
        </AIPromptInputToolbarEnd>
      </AIPromptInputToolbar>
    </AIPromptInput>
  );
}
```

`AIPromptInputSubmit` sends while idle and stops while `responding`. Your `onClick` runs before `onStop`, and `event.preventDefault()` in it cancels the stop. The submit forwards its other props, so it works under `<TooltipTrigger asChild>`.
