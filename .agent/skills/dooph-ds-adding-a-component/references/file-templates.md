# File templates for a new component

The shape CTAButton, Sticker and FancyToggleSwitch were built in. `Example` is a
placeholder name: replace it everywhere, and drop what the component has no use
for (no discrete options → no `constants.ts`; no expressive detail → no
`Practical` story). How the component's own code is written (props, refs,
`asChild`, Radix idioms, Text components) is dooph-ds-writing-components; its
classes are dooph-ds-styling.

## `src/components/Example/constants.ts`

Only when the component has discrete options. It never carries `"use client"`,
so a Server Component can read the values.

```ts
// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

export const ExampleVariant = {
  primary: "primary",
  secondary: "secondary",
} as const;
export type ExampleVariant =
  (typeof ExampleVariant)[keyof typeof ExampleVariant];

export const ExampleSize = {
  standard: "standard",
  sm: "sm",
} as const;
export type ExampleSize = (typeof ExampleSize)[keyof typeof ExampleSize];
```

## `src/components/Example/Example.tsx` (the wiring only)

```tsx
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { ExampleSize, ExampleVariant } from "./constants";

export interface ExampleProps extends HTMLAttributes<HTMLDivElement> {
  /** The first sentence of this JSDoc is the prop's description in components.md. */
  variant?: ExampleVariant;
  size?: ExampleSize;
}

const Example = forwardRef<HTMLDivElement, ExampleProps>(
  ({ variant = ExampleVariant.primary, size = ExampleSize.standard, className, ...props }, ref) => (
    <div ref={ref} className={cn(exampleVariants({ variant, size }), className)} {...props} />
  ),
);
Example.displayName = "Example";

export { Example };
```

`exampleVariants` is the component's cva recipe (dooph-ds-styling). Named exports
only. The default written here (`size = ExampleSize.standard`) is what
components.md prints in its Default column.

## `src/components/Example/index.ts`

```ts
export { Example } from "./Example";
export type { ExampleProps } from "./Example";
export { ExampleSize, ExampleVariant } from "./constants";
```

`src/index.ts` re-exports this barrel with `export *`, so everything listed here
is public API. Leave internal helpers (a part's cva recipe, a geometry function)
out of it.

## `src/index.ts`

```ts
export * from './components/Example';
```

One line in the `// Components` list, above `// Utilities`.

## `src/components/Example/Example.stories.tsx`

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Example } from "./Example";
import { ExampleSize, ExampleVariant } from "./constants";

const meta = {
  title: "Bits & Pieces/Example",
  component: Example,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: Object.values(ExampleVariant) },
    size: { control: "select", options: Object.values(ExampleSize) },
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: ExampleVariant.primary, size: ExampleSize.standard },
};

/** Every variant × size side by side. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-lg">
      {Object.values(ExampleVariant).map((variant) =>
        Object.values(ExampleSize).map((size) => (
          <Example key={`${variant}-${size}`} variant={variant} size={size} />
        )),
      )}
    </div>
  ),
};
```

A component with required props needs `args` on every story, a `render`
story included (CTAButton's `AllVariants` sets `text`, `href` and `icon`).

The title's group is one Storybook already has: `AI Chat`, `Bits & Pieces`,
`Buttons`, `Dates`, `Icons`, `Inputs`, `Menus`, `Navigation`, `Overlays`,
`Progress`, `Text`. Storybook picks up any `src/**/*.stories.tsx`; nothing to
register.

Add the stories the component's behaviour calls for:

- `Disabled`, for anything that can be disabled (`disabled` set, the chosen
  or checked state included where there is one, as in the FancyToggleSwitch
  and Checkbox stories). Other states get their own story or one `AllStates`
  grid.
- `Controlled`, for a value control: the story holds `useState` and passes
  `value` / `onValueChange` (FancyToggleSwitch), or the Radix pair the
  component passes through, such as `checked` / `onCheckedChange` (Checkbox).
  A stateful render is a named function, `render: function ControlledStory() { … }`,
  as in the FancyToggleSwitch stories. The state lives in the story, never in
  the component.
- `Practical`, for an expressive detail: the default beside a
  `data-ds-expression="practical"` wrapper, as in DropdownCaret's stories:

```tsx
export const Practical: Story = {
  render: () => (
    <div className="flex flex-row gap-xxl">
      <Column label="Default (signature)" />
      <div data-ds-expression="practical">
        <Column label="Practical" />
      </div>
    </div>
  ),
};
```

Text in a story goes through Text components (`<ButtonText>{label}</ButtonText>`),
as in the component itself.
