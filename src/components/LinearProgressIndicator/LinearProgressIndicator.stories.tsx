import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LinearProgressIndicator } from './LinearProgressIndicator';
import { LinearProgressVariant } from './constants';
import { LabelText } from '../Text';

const meta = {
  title: 'Buttons & inputs/LinearProgressIndicator',
  component: LinearProgressIndicator,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(LinearProgressVariant),
    },
    value: {
      control: { type: 'number', min: 0, max: 100, step: 5 },
    },
  },
} satisfies Meta<typeof LinearProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

const VALUES = [0, 25, 50, 75, 100];

export const BrandVariant: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      {VALUES.map((v) => (
        <div key={v} className="flex flex-col gap-1">
          <LabelText className="text-text-tertiary">{v}%</LabelText>
          <LinearProgressIndicator
            variant={LinearProgressVariant.brand}
            value={v}
            max={100}
          />
        </div>
      ))}
    </div>
  ),
};

export const PrimaryVariant: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      {VALUES.map((v) => (
        <div key={v} className="flex flex-col gap-1">
          <LabelText className="text-text-tertiary">{v}%</LabelText>
          <LinearProgressIndicator
            variant={LinearProgressVariant.primary}
            value={v}
            max={100}
          />
        </div>
      ))}
    </div>
  ),
};

export const AnimatedDemo: Story = {
  render: () => {
    const [value, setValue] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setValue((prev) => (prev >= 100 ? 0 : prev + 5));
      }, 300);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex flex-col gap-6">
        <div className="flex w-96 flex-col gap-2">
          <div className="flex items-center justify-between">
            <LabelText>Brand - Animated</LabelText>
            <LabelText className="text-text-tertiary">{value}%</LabelText>
          </div>
          <LinearProgressIndicator
            variant={LinearProgressVariant.brand}
            value={value}
            max={100}
          />
        </div>
        <div className="flex w-96 flex-col gap-2">
          <div className="flex items-center justify-between">
            <LabelText>Primary - Animated</LabelText>
            <LabelText className="text-text-tertiary">{value}%</LabelText>
          </div>
          <LinearProgressIndicator
            variant={LinearProgressVariant.primary}
            value={value}
            max={100}
          />
        </div>
      </div>
    );
  },
};

export const CustomWidth: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex w-64 flex-col gap-2">
        <LabelText>Small (256px)</LabelText>
        <LinearProgressIndicator
          variant={LinearProgressVariant.brand}
          value={60}
          max={100}
        />
      </div>
      <div className="flex w-96 flex-col gap-2">
        <LabelText>Medium (384px)</LabelText>
        <LinearProgressIndicator
          variant={LinearProgressVariant.primary}
          value={60}
          max={100}
        />
      </div>
      <div className="flex w-full flex-col gap-2">
        <LabelText>Full width</LabelText>
        <LinearProgressIndicator
          variant={LinearProgressVariant.brand}
          value={40}
          max={100}
        />
      </div>
    </div>
  ),
};

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex w-96 flex-col gap-2">
        <LabelText>Zero value (4px nub)</LabelText>
        <LinearProgressIndicator value={0} max={100} />
      </div>
      <div className="flex w-96 flex-col gap-2">
        <LabelText>Complete (100%)</LabelText>
        <LinearProgressIndicator value={100} max={100} />
      </div>
      <div className="flex w-96 flex-col gap-2">
        <LabelText>Very small value (1%)</LabelText>
        <LinearProgressIndicator value={1} max={100} />
      </div>
    </div>
  ),
};
