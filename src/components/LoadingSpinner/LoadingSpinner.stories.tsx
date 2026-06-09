import type { Meta, StoryObj } from "@storybook/react";
import {
  LoadingSpinner,
  LoadingSpinnerColor,
  LoadingSpinnerSize,
  LoadingSpinnerVariant,
} from "./LoadingSpinner";

const meta = {
  title: "Bits & Pieces/LoadingSpinner",
  component: LoadingSpinner,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: Object.values(LoadingSpinnerVariant),
    },
    color: {
      control: "select",
      options: [...Object.values(LoadingSpinnerColor), "#e05252"],
    },
    size: {
      control: "select",
      options: Object.values(LoadingSpinnerSize),
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: LoadingSpinnerVariant.flat,
    color: LoadingSpinnerColor.primary,
    size: LoadingSpinnerSize.rg,
  },
};

export const Spokes: Story = {
  args: {
    variant: LoadingSpinnerVariant.spokes,
    color: LoadingSpinnerColor.primary,
    size: LoadingSpinnerSize.rg,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <LoadingSpinner size={LoadingSpinnerSize.sm} />
      <LoadingSpinner size={LoadingSpinnerSize.rg} />
      <LoadingSpinner size={LoadingSpinnerSize.md} />
      <LoadingSpinner size={LoadingSpinnerSize.xl} />
    </div>
  ),
};

export const AllSizesSpokes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <LoadingSpinner
        variant={LoadingSpinnerVariant.spokes}
        size={LoadingSpinnerSize.sm}
      />
      <LoadingSpinner
        variant={LoadingSpinnerVariant.spokes}
        size={LoadingSpinnerSize.rg}
      />
      <LoadingSpinner
        variant={LoadingSpinnerVariant.spokes}
        size={LoadingSpinnerSize.md}
      />
      <LoadingSpinner
        variant={LoadingSpinnerVariant.spokes}
        size={LoadingSpinnerSize.xl}
      />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <LoadingSpinner
        color={LoadingSpinnerColor.primary}
        size={LoadingSpinnerSize.md}
      />
      <LoadingSpinner
        color={LoadingSpinnerColor.brand}
        size={LoadingSpinnerSize.md}
      />
      <LoadingSpinner color="#e05252" size={LoadingSpinnerSize.md} />
    </div>
  ),
};

export const AllVariantsAndColors: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="w-12 text-style-label text-text-secondary">flat</span>
        <LoadingSpinner
          variant={LoadingSpinnerVariant.flat}
          color={LoadingSpinnerColor.primary}
          size={LoadingSpinnerSize.md}
        />
        <LoadingSpinner
          variant={LoadingSpinnerVariant.flat}
          color={LoadingSpinnerColor.brand}
          size={LoadingSpinnerSize.md}
        />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-12 text-style-label text-text-secondary">spokes</span>
        <LoadingSpinner
          variant={LoadingSpinnerVariant.spokes}
          color={LoadingSpinnerColor.primary}
          size={LoadingSpinnerSize.md}
        />
        <LoadingSpinner
          variant={LoadingSpinnerVariant.spokes}
          color={LoadingSpinnerColor.brand}
          size={LoadingSpinnerSize.md}
        />
      </div>
    </div>
  ),
};
