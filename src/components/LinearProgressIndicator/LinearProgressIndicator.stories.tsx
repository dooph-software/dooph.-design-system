import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LinearProgressIndicator } from './LinearProgressIndicator';
import { DS_COLOR_TOKENS } from '../../utils/color';
import { LabelText } from '../Text';

const meta = {
  title: 'Buttons & inputs/LinearProgressIndicator',
  component: LinearProgressIndicator,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: Object.keys(DS_COLOR_TOKENS),
    },
    value: {
      control: { type: 'number', min: 0, max: 100, step: 5 },
    },
  },
} satisfies Meta<typeof LinearProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

const VALUES = [0, 25, 50, 75, 100];

export const Default: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      {VALUES.map((v) => (
        <div key={v} className="flex flex-col gap-1">
          <LabelText className="text-text-tertiary">{v}%</LabelText>
          <LinearProgressIndicator value={v} max={100} />
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  name: 'Color prop',
  parameters: {
    docs: {
      description: {
        story:
          '`color` takes a DS token name or any CSS color. It defaults to the primary token.',
      },
    },
  },
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      {(['primary', 'brand', 'text', 'error-primary'] as const).map((c) => (
        <div key={c} className="flex flex-col gap-1">
          <LabelText className="text-text-tertiary">{c}</LabelText>
          <LinearProgressIndicator color={c} value={60} max={100} />
        </div>
      ))}
      <div className="flex flex-col gap-1">
        <LabelText className="text-text-tertiary">#7c5cff</LabelText>
        <LinearProgressIndicator color="#7c5cff" value={60} max={100} />
      </div>
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
            <LabelText>Default - Animated</LabelText>
            <LabelText className="text-text-tertiary">{value}%</LabelText>
          </div>
          <LinearProgressIndicator value={value} max={100} />
        </div>
        <div className="flex w-96 flex-col gap-2">
          <div className="flex items-center justify-between">
            <LabelText>Brand - Animated</LabelText>
            <LabelText className="text-text-tertiary">{value}%</LabelText>
          </div>
          <LinearProgressIndicator color="brand" value={value} max={100} />
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
        <LinearProgressIndicator value={60} max={100} />
      </div>
      <div className="flex w-96 flex-col gap-2">
        <LabelText>Medium (384px)</LabelText>
        <LinearProgressIndicator color="brand" value={60} max={100} />
      </div>
      <div className="flex w-full flex-col gap-2">
        <LabelText>Full width</LabelText>
        <LinearProgressIndicator value={40} max={100} />
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
