import type { Meta, StoryObj } from "@storybook/react";
import { LeftSidebarClosedIcon } from "../Icons";
import { Button, ButtonSize, ButtonVariant } from "./Button";

const meta = {
  title: "Buttons & inputs/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: Object.values(ButtonVariant),
    },
    size: {
      control: "select",
      options: Object.values(ButtonSize),
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: "Button", variant: ButtonVariant.primary },
};
export const Secondary: Story = {
  args: { children: "Button", variant: ButtonVariant.secondary },
};
export const Brand: Story = {
  args: { children: "Button", variant: ButtonVariant.brand },
};
export const Destructive: Story = {
  args: { children: "Button", variant: ButtonVariant.destructive },
};
export const Ghost: Story = {
  args: { children: "Button", variant: ButtonVariant.ghost },
};
export const Text: Story = {
  args: { children: "Button", variant: ButtonVariant.text },
};
export const Small: Story = {
  args: {
    children: "Button",
    variant: ButtonVariant.primary,
    size: ButtonSize.sm,
  },
};
export const Disabled: Story = {
  args: { children: "Button", variant: ButtonVariant.primary, disabled: true },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {Object.values(ButtonVariant).map((v) => (
        <Button key={v} variant={v}>
          {v}
        </Button>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-4">
      <Button variant={ButtonVariant.primary} size={ButtonSize.default}>
        Default
      </Button>
      <Button variant={ButtonVariant.primary} size={ButtonSize.sm}>
        Small
      </Button>
      <Button variant={ButtonVariant.primary} size={ButtonSize.icon}>
        <LeftSidebarClosedIcon />
      </Button>
    </div>
  ),
};

export const DisabledAll: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {(
        Object.values(ButtonVariant).filter(
          (v) => v !== ButtonVariant.text,
        ) as (typeof ButtonVariant)[keyof typeof ButtonVariant][]
      ).map((v) => (
        <Button key={v} variant={v} disabled>
          {v}
        </Button>
      ))}
    </div>
  ),
};
