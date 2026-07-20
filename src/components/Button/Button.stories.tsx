import type { Meta, StoryObj } from "@storybook/react";
import { LeftSidebarClosedIcon, IconSize } from "../Icons";
import { Button } from "./Button";
import { ButtonSize, ButtonVariant } from "./constants";

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
export const Danger: Story = {
  args: { children: "Button", variant: ButtonVariant.danger },
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

export const IconSizeComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      {[ButtonVariant.ghost, ButtonVariant.secondary, ButtonVariant.brand].map(
        (variant) => (
          <div key={variant} className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium">{variant}</div>
            <div className="flex items-center gap-3">
              <Button variant={variant} size={ButtonSize.icon}>
                <LeftSidebarClosedIcon size={IconSize.standard} />
              </Button>
              <span className="text-xs text-gray-500">icon (38px)</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant={variant} size={ButtonSize.iconSm}>
                <LeftSidebarClosedIcon size={IconSize.standard} />
              </Button>
              <span className="text-xs text-gray-500">icon-sm (34px)</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant={variant} size={ButtonSize.iconMicro}>
                <LeftSidebarClosedIcon size={IconSize.standard} />
              </Button>
              <span className="text-xs text-gray-500">icon-micro (26px)</span>
            </div>
          </div>
        ),
      )}
    </div>
  ),
};
