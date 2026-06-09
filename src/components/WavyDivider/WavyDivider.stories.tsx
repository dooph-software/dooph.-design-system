import type { Meta, StoryObj } from "@storybook/react";
import { WavyDivider, WavyDividerVariant } from "./WavyDivider";

const meta = {
  title: "Bits & Pieces/WavyDivider",
  component: WavyDivider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: Object.values(WavyDividerVariant),
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WavyDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const High: Story = {
  args: {
    variant: WavyDividerVariant.high,
    className: "text-border",
  },
};

export const Low: Story = {
  args: {
    variant: WavyDividerVariant.low,
    className: "text-border",
  },
};

export const BothVariants: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-style-label text-text-secondary">
          High frequency
        </span>
        <WavyDivider
          variant={WavyDividerVariant.high}
          className="text-border"
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-style-label text-text-secondary">
          Low frequency
        </span>
        <WavyDivider variant={WavyDividerVariant.low} className="text-border" />
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <WavyDivider variant={WavyDividerVariant.high} className="text-primary" />
      <WavyDivider variant={WavyDividerVariant.high} className="text-brand" />
      <WavyDivider variant={WavyDividerVariant.high} className="text-border" />
      <WavyDivider
        variant={WavyDividerVariant.low}
        className="text-text-tertiary"
      />
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4 rounded-standard border border-border bg-surface p-5">
      <p className="text-style-body text-text">
        Above the divider — some content goes here.
      </p>
      <WavyDivider variant={WavyDividerVariant.high} className="text-border" />
      <p className="text-style-body text-text-secondary">
        Below the divider — more content follows.
      </p>
    </div>
  ),
};
