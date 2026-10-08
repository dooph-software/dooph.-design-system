import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  LoadingSpinnerColor,
  LoadingSpinnerSize,
  LoadingSpinnerVariant,
} from "./constants";
import { LabelText } from "../Text";

const meta = {
  title: "Progress/LoadingSpinner",
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

export const Star: Story = {
  args: {
    variant: LoadingSpinnerVariant.star,
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

export const AllSizesStar: Story = {
  render: () => (
    <div className="flex items-center gap-lg">
      <LoadingSpinner
        variant={LoadingSpinnerVariant.star}
        size={LoadingSpinnerSize.sm}
      />
      <LoadingSpinner
        variant={LoadingSpinnerVariant.star}
        size={LoadingSpinnerSize.rg}
      />
      <LoadingSpinner
        variant={LoadingSpinnerVariant.star}
        size={LoadingSpinnerSize.md}
      />
      <LoadingSpinner
        variant={LoadingSpinnerVariant.star}
        size={LoadingSpinnerSize.xl}
      />
    </div>
  ),
};

/**
 * The star inside a 1px border drawn exactly on its box: at every size and
 * every angle of the turn, the star stays clear of the border.
 */
export const StarStaysInBox: Story = {
  render: () => (
    <div className="flex items-center gap-lg">
      {Object.values(LoadingSpinnerSize).map((size) => (
        <span key={size} className="inline-flex border border-solid border-border-primary">
          <LoadingSpinner variant={LoadingSpinnerVariant.star} size={size} />
        </span>
      ))}
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
        color={LoadingSpinnerColor.prominent}
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
        <LabelText className="w-12 text-text-secondary">flat</LabelText>
        <LoadingSpinner
          variant={LoadingSpinnerVariant.flat}
          color={LoadingSpinnerColor.primary}
          size={LoadingSpinnerSize.md}
        />
        <LoadingSpinner
          variant={LoadingSpinnerVariant.flat}
          color={LoadingSpinnerColor.prominent}
          size={LoadingSpinnerSize.md}
        />
      </div>
      <div className="flex items-center gap-4">
        <LabelText className="w-12 text-text-secondary">spokes</LabelText>
        <LoadingSpinner
          variant={LoadingSpinnerVariant.spokes}
          color={LoadingSpinnerColor.primary}
          size={LoadingSpinnerSize.md}
        />
        <LoadingSpinner
          variant={LoadingSpinnerVariant.spokes}
          color={LoadingSpinnerColor.prominent}
          size={LoadingSpinnerSize.md}
        />
      </div>
      <div className="flex items-center gap-lg">
        <LabelText className="w-12 text-text-secondary">star</LabelText>
        <LoadingSpinner
          variant={LoadingSpinnerVariant.star}
          color={LoadingSpinnerColor.primary}
          size={LoadingSpinnerSize.md}
        />
        <LoadingSpinner
          variant={LoadingSpinnerVariant.star}
          color={LoadingSpinnerColor.prominent}
          size={LoadingSpinnerSize.md}
        />
        {/* `color` overriding the default with an arbitrary CSS colour */}
        <LoadingSpinner
          variant={LoadingSpinnerVariant.star}
          color="#e05252"
          size={LoadingSpinnerSize.md}
        />
      </div>
    </div>
  ),
};
