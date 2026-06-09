# Design System Health Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all quality issues found in the three-agent design system audit: one critical token bug, several story enum/content violations, and one incorrect skill reference.

**Architecture:** All changes are isolated to `src/components/` story/component files and `.agents/skills/`. No API changes. No new files. Pure quality fixes.

**Tech Stack:** React, TypeScript, Tailwind v4, Radix UI, Storybook

---

### Task 1: Fix destructive button text color token

**Files:**
- Modify: `src/components/Button/Button.tsx:42`

- [ ] **Step 1: Fix `text-white` → `text-destructive-fg`**

Change line 42 from:
```ts
"bg-destructive text-white border-destructive shadow-button",
```
to:
```ts
"bg-destructive text-destructive-fg border-destructive shadow-button",
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\stick\Github\dooph\dooph-Design-System && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Button/Button.tsx
git commit -m "fix(Button): use text-destructive-fg instead of hardcoded text-white"
```

---

### Task 2: Update Button.stories.tsx to use ButtonVariant/ButtonSize enums

**Files:**
- Modify: `src/components/Button/Button.stories.tsx`

- [ ] **Step 1: Update imports and argTypes options**

Add `ButtonVariant, ButtonSize` to the import (they already live in `./Button`).

Replace argTypes options raw strings with `Object.values()`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button, ButtonVariant, ButtonSize } from './Button';

const meta = {
  title: 'Buttons & inputs/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(ButtonVariant),
    },
    size: {
      control: 'select',
      options: Object.values(ButtonSize),
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;
```

- [ ] **Step 2: Update individual story args to use enum constants**

```tsx
export const Primary: Story = { args: { children: 'Button', variant: ButtonVariant.primary } };
export const Secondary: Story = { args: { children: 'Button', variant: ButtonVariant.secondary } };
export const Brand: Story = { args: { children: 'Button', variant: ButtonVariant.brand } };
export const Destructive: Story = { args: { children: 'Button', variant: ButtonVariant.destructive } };
export const Ghost: Story = { args: { children: 'Button', variant: ButtonVariant.ghost } };
export const TextVariantStory: Story = { args: { children: 'Button', variant: ButtonVariant.text } };
export const Small: Story = { args: { children: 'Button', variant: ButtonVariant.primary, size: ButtonSize.sm } };
export const Disabled: Story = { args: { children: 'Button', variant: ButtonVariant.primary, disabled: true } };
```

- [ ] **Step 3: Update render stories to use enum values**

AllVariants and DisabledAll render stories: replace raw string arrays with `Object.values(ButtonVariant)` (filtered for DisabledAll to exclude `text`).

- [ ] **Step 4: Update AllSizes render story**

```tsx
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-4">
      <Button variant={ButtonVariant.primary} size={ButtonSize.default}>Default</Button>
      <Button variant={ButtonVariant.primary} size={ButtonSize.sm}>Small</Button>
      <Button variant={ButtonVariant.primary} size={ButtonSize.icon}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/></svg>
      </Button>
    </div>
  ),
};
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Button/Button.stories.tsx
git commit -m "fix(Button/stories): use ButtonVariant and ButtonSize enum constants throughout"
```

---

### Task 3: Update BaseText.stories.tsx argTypes to use TextVariant enum

**Files:**
- Modify: `src/components/Text/BaseText.stories.tsx`

- [ ] **Step 1: Replace raw `textVariantOptions` with `Object.values(TextVariant)`**

Remove the `textVariantOptions` constant and update argTypes:
```tsx
argTypes: {
  variant: {
    control: "select",
    options: Object.values(TextVariant),
  },
  ...
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Text/BaseText.stories.tsx
git commit -m "fix(Text/stories): derive argTypes options from TextVariant enum"
```

---

### Task 4: Fix Toast.stories.tsx placeholder text

**Files:**
- Modify: `src/components/Toast/Toast.stories.tsx`

- [ ] **Step 1: Replace placeholder text on lines 75 and 159**

Change both instances of `"The Evil Rabbit jumped over the fence again."` to realistic content:
- Line 75 (Action story): `"Export will be discarded. Continue?"`
- Line 159 (ActionButton / AllVariants): `"Export will be discarded. Continue?"`

- [ ] **Step 2: Commit**

```bash
git add src/components/Toast/Toast.stories.tsx
git commit -m "fix(Toast/stories): replace placeholder text with realistic content"
```

---

### Task 5: Add argTypes to Avatar.stories.tsx

**Files:**
- Modify: `src/components/Avatar/Avatar.stories.tsx`

- [ ] **Step 1: Add argTypes to meta**

```tsx
const meta = {
  title: "Display/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: Object.values(AvatarSize),
    },
  },
} satisfies Meta<typeof Avatar>;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Avatar/Avatar.stories.tsx
git commit -m "fix(Avatar/stories): add argTypes for size control"
```

---

### Task 6: Add argTypes to Toggle.stories.tsx

**Files:**
- Modify: `src/components/Toggle/Toggle.stories.tsx`

- [ ] **Step 1: Add argTypes to meta**

```tsx
const meta = {
  title: 'Buttons & inputs/TwoWayToggle',
  component: TwoWayToggle,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(ToggleVariant),
    },
    size: {
      control: 'select',
      options: Object.values(ToggleSize),
    },
  },
} satisfies Meta<typeof TwoWayToggle>;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Toggle/Toggle.stories.tsx
git commit -m "fix(Toggle/stories): add argTypes for variant and size controls"
```

---

### Task 7: Add argTypes to Tooltip.stories.tsx

**Files:**
- Modify: `src/components/Tooltip/Tooltip.stories.tsx`

- [ ] **Step 1: Add argTypes to meta**

```tsx
const meta = {
  title: "Overlays/Tooltip",
  component: TooltipContent,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [...],
  argTypes: {
    variant: {
      control: "select",
      options: Object.values(TooltipTypes),
    },
    themeInverse: { control: "boolean" },
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
  },
} satisfies Meta<typeof TooltipContent>;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Tooltip/Tooltip.stories.tsx
git commit -m "fix(Tooltip/stories): add argTypes for variant, themeInverse, and side controls"
```

---

### Task 8: Fix architecture skill incorrect ds-px-ui-sm reference

**Files:**
- Modify: `.agents/skills/dooph-ds-architecture/SKILL.md:94`

- [ ] **Step 1: Fix the incorrect claim**

Line 94 currently says:
> `DropdownMenuSection` wraps item groups with horizontal inset (`ds-px-ui-sm`).

But `DropdownMenuSection` uses `ds-px-ui-xs`. Fix to:
> `DropdownMenuSection` wraps item groups with horizontal inset (`ds-px-ui-xs`).

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/dooph-ds-architecture/SKILL.md
git commit -m "fix(skills): correct DropdownMenuSection spacing helper reference (xs not sm)"
```

---

### Task 9: Verify TypeScript build passes

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit` from the repo root
Expected: zero errors

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: successful build, no errors
