import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  LoadingSpinnerColor,
  LoadingSpinnerSize,
} from "../LoadingSpinner/LoadingSpinner";
import {
  ProgressIndicator,
  ProgressIndicatorVariants,
} from "./ProgressIndicator";

const meta = {
  title: "Bits & Pieces/ProgressIndicator",
  component: ProgressIndicator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    progress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    variant: {
      control: "select",
      options: Object.values(ProgressIndicatorVariants),
    },
    color: {
      control: "select",
      options: Object.values(LoadingSpinnerColor),
    },
    size: {
      control: "select",
      options: Object.values(LoadingSpinnerSize),
    },
  },
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    progress: 0.6,
    variant: ProgressIndicatorVariants.flat,
    color: LoadingSpinnerColor.primary,
    size: LoadingSpinnerSize.rg,
  },
};

export const Empty: Story = {
  args: { progress: 0 },
};

export const Half: Story = {
  args: { progress: 0.5, size: LoadingSpinnerSize.md },
};

export const Complete: Story = {
  args: { progress: 1, size: LoadingSpinnerSize.md },
};

export const WavyVariant: Story = {
  args: {
    progress: 0.6,
    variant: ProgressIndicatorVariants.wavy,
    size: LoadingSpinnerSize.md,
  },
};

export const AllSizes: Story = {
  args: { progress: 0.6 },
  render: () => (
    <div className="flex items-center gap-4">
      <ProgressIndicator progress={0.6} size={LoadingSpinnerSize.sm} />
      <ProgressIndicator progress={0.6} size={LoadingSpinnerSize.rg} />
      <ProgressIndicator progress={0.6} size={LoadingSpinnerSize.md} />
      <ProgressIndicator progress={0.6} size={LoadingSpinnerSize.xl} />
    </div>
  ),
};

export const ProgressSteps: Story = {
  args: { progress: 0 },
  render: () => (
    <div className="flex items-center gap-4">
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <ProgressIndicator key={p} progress={p} size={LoadingSpinnerSize.md} />
      ))}
    </div>
  ),
};

export const WavyProgressSteps: Story = {
  args: { progress: 0 },
  render: () => (
    <div className="flex items-center gap-4">
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <ProgressIndicator
          key={p}
          progress={p}
          variant={ProgressIndicatorVariants.wavy}
          size={LoadingSpinnerSize.md}
        />
      ))}
    </div>
  ),
};

/** Interactive — drag the slider to see the smooth CSS transition on the flat variant. */
export const Interactive: Story = {
  args: { progress: 0.5 },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState(0.5);
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <ProgressIndicator progress={value} size={LoadingSpinnerSize.md} />
          <ProgressIndicator
            progress={value}
            variant={ProgressIndicatorVariants.wavy}
            size={LoadingSpinnerSize.md}
          />
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-48"
        />
        <span className="text-style-label text-text-secondary">
          {Math.round(value * 100)} %
        </span>
      </div>
    );
  },
};
