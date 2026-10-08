import type { Meta, StoryObj } from "@storybook/react-vite";
import { WavyDivider } from "./WavyDivider";
import { WavyDividerVariant } from "./constants";
import { BodyText, LabelText } from "../Text";

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

/** Contradicts strokeWeight (default 2). */
export const HeavyStroke: Story = {
  args: {
    variant: WavyDividerVariant.high,
    strokeWeight: 4,
    className: "text-border",
  },
};

export const BothVariants: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <LabelText className="text-text-secondary">
          High frequency
        </LabelText>
        <WavyDivider
          variant={WavyDividerVariant.high}
          className="text-border"
        />
      </div>
      <div className="flex flex-col gap-2">
        <LabelText className="text-text-secondary">
          Low frequency
        </LabelText>
        <WavyDivider variant={WavyDividerVariant.low} className="text-border" />
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <WavyDivider variant={WavyDividerVariant.high} className="text-primary" />
      <WavyDivider variant={WavyDividerVariant.high} className="text-prominent" />
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
    <div className="flex w-80 flex-col gap-4 rounded-normal border border-border-primary bg-surface-primary p-5">
      <BodyText as="p" className="text-text">
        Above the divider — some content goes here.
      </BodyText>
      <WavyDivider variant={WavyDividerVariant.high} className="text-border" />
      <BodyText as="p" className="text-text-secondary">
        Below the divider — more content follows.
      </BodyText>
    </div>
  ),
};
